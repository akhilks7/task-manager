import React from "react";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { EmployeeTaskDetailClient } from "./EmployeeTaskDetailClient";
import { Task, TaskReport } from "@/types/database";

export const dynamic = "force-dynamic";

export default async function EmployeeTaskDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch task with creator (manager) profile
  const { data: task, error: taskError } = await supabase
    .from("tasks")
    .select("*, creator:created_by(id, full_name, email)")
    .eq("id", params.id)
    .single();

  if (taskError || !task) {
    notFound();
  }

  // Ensure employee is the assigned assignee or an admin
  if (task.assigned_to !== user.id) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "admin") {
      redirect("/employee");
    }
  }

  // Fetch reports for this task
  const { data: reports } = await supabase
    .from("task_reports")
    .select("*, reviewer:reviewed_by(id, full_name, email)")
    .eq("task_id", params.id)
    .order("submitted_at", { ascending: true });

  return (
    <EmployeeTaskDetailClient
      task={task as Task}
      reports={(reports as TaskReport[]) || []}
    />
  );
}
