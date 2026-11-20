import React from "react";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ManagerTaskReviewClient } from "./ManagerTaskReviewClient";
import { Task, TaskReport } from "@/types/database";

export const dynamic = "force-dynamic";

export default async function ManagerTaskDetailPage({
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

  // Fetch task with assignee profile
  const { data: task, error: taskError } = await supabase
    .from("tasks")
    .select("*, assignee:assigned_to(id, full_name, email)")
    .eq("id", params.id)
    .single();

  if (taskError || !task) {
    notFound();
  }

  // Ensure manager owns this task
  if (task.created_by !== user.id) {
    // If not creator and not admin, forbid
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "admin") {
      redirect("/manager");
    }
  }

  // Fetch report history for this task in chronological order
  const { data: reports } = await supabase
    .from("task_reports")
    .select("*, reviewer:reviewed_by(id, full_name, email)")
    .eq("task_id", params.id)
    .order("submitted_at", { ascending: true });

  return (
    <ManagerTaskReviewClient
      task={task as Task}
      reports={(reports as TaskReport[]) || []}
    />
  );
}
