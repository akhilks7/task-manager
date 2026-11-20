import React from "react";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { UserManagementClient } from "./UserManagementClient";
import { Profile } from "@/types/database";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const adminClient = createAdminClient();
  const { data: profiles } = await adminClient
    .from("profiles")
    .select("*, manager:manager_id(id, full_name, email)")
    .order("created_at", { ascending: false });

  return (
    <UserManagementClient
      initialUsers={(profiles as Profile[]) || []}
      currentUserId={user?.id || ""}
    />
  );
}
