import React from "react";
import { createClient } from "@/lib/supabase/server";
import { AdminDashboardClient } from "./AdminDashboardClient";
import { Task, Profile } from "@/types/database";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const supabase = createClient();

  // Fetch all profiles to compute user statistics
  const { data: profiles } = await supabase
    .from("profiles")
    .select("role, is_active");

  const totalUsers = profiles?.length || 0;
  const adminsCount = profiles?.filter((p) => p.role === "admin").length || 0;
  const managersCount = profiles?.filter((p) => p.role === "manager").length || 0;
  const employeesCount = profiles?.filter((p) => p.role === "employee").length || 0;

  // Fetch all tasks with assignee and creator profiles
  const { data: tasks } = await supabase
    .from("tasks")
    .select(`
      *,
      assignee:assigned_to(id, full_name, email),
      creator:created_by(id, full_name, email)
    `)
    .order("created_at", { ascending: false });

  const allTasks = (tasks as Task[]) || [];

  const assignedCount = allTasks.filter((t) => t.status === "assigned").length;
  const inProgressCount = allTasks.filter((t) => t.status === "in_progress").length;
  const submittedCount = allTasks.filter((t) => t.status === "submitted").length;
  const approvedCount = allTasks.filter((t) => t.status === "approved").length;
  const rejectedCount = allTasks.filter((t) => t.status === "rejected").length;

  const stats = {
    totalUsers,
    adminsCount,
    managersCount,
    employeesCount,
    totalTasks: allTasks.length,
    assignedCount,
    inProgressCount,
    submittedCount,
    approvedCount,
    rejectedCount,
  };

  return <AdminDashboardClient stats={stats} tasks={allTasks} />;
}
