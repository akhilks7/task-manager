"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const StartTaskSchema = z.object({
  taskId: z.string().uuid(),
});

export async function startTaskAction(taskId: string) {
  const validated = StartTaskSchema.safeParse({ taskId });
  if (!validated.success) {
    throw new Error("Invalid task ID");
  }

  const supabase = createClient();
  const { data, error } = await supabase.rpc("start_task", {
    p_task_id: validated.data.taskId,
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath(`/employee/tasks/${taskId}`);
  revalidatePath("/employee");
  return { success: true };
}

const SubmitReportSchema = z.object({
  taskId: z.string().uuid(),
  reportText: z.string().min(1, "Written report text is required"),
  attachmentUrl: z.string().nullable().optional(),
});

export async function submitReportAction(
  taskId: string,
  reportText: string,
  attachmentUrl?: string | null
) {
  const validated = SubmitReportSchema.safeParse({
    taskId,
    reportText,
    attachmentUrl,
  });

  if (!validated.success) {
    throw new Error(
      validated.error.errors[0]?.message || "Invalid report parameters"
    );
  }

  const supabase = createClient();

  // Call the Postgres RPC submit_report
  const { data, error } = await supabase.rpc("submit_report", {
    p_task_id: validated.data.taskId,
    p_report_text: validated.data.reportText.trim(),
    p_attachment_url: validated.data.attachmentUrl || null,
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath(`/employee/tasks/${taskId}`);
  revalidatePath("/employee");
  return { success: true, reportId: data };
}
