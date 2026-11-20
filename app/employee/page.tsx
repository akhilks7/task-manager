import React from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { EmployeeDashboardClient } from "./EmployeeDashboardClient";
import { Task } from "@/types/database";

export const dynamic = "force-dynamic";

export default async function EmployeeDashboardPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch tasks assigned to this employee with creator (manager) profile
  const { data: tasks } = await supabase
    .from("tasks")
    .select("*, creator:created_by(id, full_name, email)")
    .eq("assigned_to", user.id)
    .order("created_at", { ascending: false });

  return <EmployeeDashboardClient tasks={(tasks as Task[]) || []} />;
}
