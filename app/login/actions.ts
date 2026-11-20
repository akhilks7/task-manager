"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { redirect } from "next/navigation";
import { z } from "zod";

const LoginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export type LoginActionState = {
  error?: string;
  fieldErrors?: {
    email?: string[];
    password?: string[];
  };
};

export async function loginAction(
  prevState: LoginActionState | null,
  formData: FormData
): Promise<LoginActionState> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const validated = LoginSchema.safeParse({ email, password });
  if (!validated.success) {
    return {
      fieldErrors: validated.error.flatten().fieldErrors,
    };
  }

  const supabase = createClient();
  const { data: authData, error: authError } =
    await supabase.auth.signInWithPassword({
      email: validated.data.email,
      password: validated.data.password,
    });

  if (authError || !authData.user) {
    return {
      error: authError?.message || "Invalid credentials. Please try again.",
    };
  }

  // Fetch profile via admin client to verify role and active status
  const adminClient = createAdminClient();
  const { data: profile, error: profileError } = await adminClient
    .from("profiles")
    .select("role, is_active")
    .eq("id", authData.user.id)
    .single();

  if (profileError || !profile) {
    await supabase.auth.signOut();
    return {
      error: profileError?.message || "Profile not found. Please contact your system administrator.",
    };
  }

  if (!profile.is_active) {
    await supabase.auth.signOut();
    return {
      error: "Your account has been deactivated. Please contact your administrator.",
    };
  }

  // Redirect to role-specific dashboard
  redirect(`/${profile.role}`);
}
