import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { z } from "zod";

const CreateUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  full_name: z.string().min(1),
  role: z.enum(["admin", "manager", "employee"]),
  manager_id: z.string().uuid().nullable().optional(),
});

const UpdateUserSchema = z.object({
  id: z.string().uuid(),
  full_name: z.string().min(1).optional(),
  role: z.enum(["admin", "manager", "employee"]).optional(),
  manager_id: z.string().uuid().nullable().optional(),
  is_active: z.boolean().optional(),
  password: z.string().min(6).optional(),
});

async function verifyAdmin() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { authorized: false, error: "Unauthorized: No session", status: 401 };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    return { authorized: false, error: "Forbidden: Admin access required", status: 403 };
  }

  return { authorized: true, user };
}

// GET /api/admin/users - List all users
export async function GET() {
  const authCheck = await verifyAdmin();
  if (!authCheck.authorized) {
    return NextResponse.json({ error: authCheck.error }, { status: authCheck.status });
  }

  const adminClient = createAdminClient();
  const { data: profiles, error } = await adminClient
    .from("profiles")
    .select("*, manager:manager_id(id, full_name, email)")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ users: profiles });
}

// POST /api/admin/users - Create new user
export async function POST(request: NextRequest) {
  const authCheck = await verifyAdmin();
  if (!authCheck.authorized) {
    return NextResponse.json({ error: authCheck.error }, { status: authCheck.status });
  }

  try {
    const body = await request.json();
    const validated = CreateUserSchema.parse(body);

    const adminClient = createAdminClient();

    // Create user in auth.users
    const { data: authData, error: authError } =
      await adminClient.auth.admin.createUser({
        email: validated.email,
        password: validated.password,
        email_confirm: true,
        user_metadata: {
          full_name: validated.full_name,
          role: validated.role,
          manager_id: validated.role === "employee" ? validated.manager_id || null : null,
        },
      });

    if (authError || !authData.user) {
      return NextResponse.json(
        { error: authError?.message || "Failed to create user in auth system" },
        { status: 400 }
      );
    }

    // Ensure profiles table has correct values (trigger handles insert, update guarantees sync)
    const { error: profileError } = await adminClient
      .from("profiles")
      .upsert({
        id: authData.user.id,
        email: validated.email,
        full_name: validated.full_name,
        role: validated.role,
        manager_id: validated.role === "employee" ? validated.manager_id || null : null,
        is_active: true,
      });

    if (profileError) {
      // rollback auth user if profile insert failed
      await adminClient.auth.admin.deleteUser(authData.user.id);
      return NextResponse.json(
        { error: `Database profile error: ${profileError.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: "User created successfully", user: authData.user },
      { status: 201 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to process request" },
      { status: 400 }
    );
  }
}

// PATCH /api/admin/users - Update user
export async function PATCH(request: NextRequest) {
  const authCheck = await verifyAdmin();
  if (!authCheck.authorized) {
    return NextResponse.json({ error: authCheck.error }, { status: authCheck.status });
  }

  try {
    const body = await request.json();
    const validated = UpdateUserSchema.parse(body);
    const adminClient = createAdminClient();

    // Prepare profile update data
    const updateData: Record<string, any> = {};
    if (validated.full_name !== undefined) updateData.full_name = validated.full_name;
    if (validated.role !== undefined) {
      updateData.role = validated.role;
      if (validated.role !== "employee") {
        updateData.manager_id = null;
      }
    }
    if (validated.manager_id !== undefined && (validated.role === "employee" || !validated.role)) {
      updateData.manager_id = validated.manager_id;
    }
    if (validated.is_active !== undefined) updateData.is_active = validated.is_active;

    if (Object.keys(updateData).length > 0) {
      const { error: profileError } = await adminClient
        .from("profiles")
        .update(updateData)
        .eq("id", validated.id);

      if (profileError) {
        return NextResponse.json({ error: profileError.message }, { status: 500 });
      }
    }

    // If password update requested
    if (validated.password) {
      const { error: pwdError } = await adminClient.auth.admin.updateUserById(
        validated.id,
        { password: validated.password }
      );
      if (pwdError) {
        return NextResponse.json({ error: pwdError.message }, { status: 500 });
      }
    }

    return NextResponse.json({ message: "User updated successfully" });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to process update" },
      { status: 400 }
    );
  }
}

// DELETE /api/admin/users - Delete user
export async function DELETE(request: NextRequest) {
  const authCheck = await verifyAdmin();
  if (!authCheck.authorized) {
    return NextResponse.json({ error: authCheck.error }, { status: authCheck.status });
  }

  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("id");

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    // Prevent admin from deleting themselves
    if (authCheck.user?.id === userId) {
      return NextResponse.json(
        { error: "You cannot delete your own admin account" },
        { status: 400 }
      );
    }

    const adminClient = createAdminClient();
    const { error: deleteError } = await adminClient.auth.admin.deleteUser(userId);

    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }

    return NextResponse.json({ message: "User deleted successfully" });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to process deletion" },
      { status: 400 }
    );
  }
}
