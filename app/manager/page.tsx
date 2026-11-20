import React from "react";
import { createClient } from "@/lib/supabase/server";
import { ManagerDashboardClient } from "./ManagerDashboardClient";
import { Task } from "@/types/database";

export const dynamic = "force-dynamic";

export default async function ManagerDashboardPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  // Fetch tasks created by this manager with assignee profile
  const { data: tasks } = await supabase
    .from("tasks")
    .select("*, assignee:assigned_to(id, full_name, email)")
    .eq("created_by", user.id)
    .order("created_at", { ascending: false });

  const taskList = (tasks as Task[]) || [];
  const pendingCount = taskList.filter((t) => t.status === "submitted").length;

  return (
    <ManagerDashboardClient
      tasks={taskList}
      pendingCount={pendingCount}
    />
  );
}
