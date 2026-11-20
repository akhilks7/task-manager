"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

const CreateTaskSchema = z.object({
  title: z.string().min(1, "Task title is required"),
  description: z.string().optional(),
  due_date: z.string().optional(),
  assigned_to: z.string().uuid("Invalid employee selected"),
});

export type CreateTaskState = {
  error?: string;
  fieldErrors?: {
    title?: string[];
    description?: string[];
    due_date?: string[];
    assigned_to?: string[];
  };
};

export async function createTaskAction(
  prevState: CreateTaskState | null,
  formData: FormData
): Promise<CreateTaskState> {
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const due_date = formData.get("due_date") as string;
  const assigned_to = formData.get("assigned_to") as string;

  const validated = CreateTaskSchema.safeParse({
    title,
    description: description || undefined,
    due_date: due_date || undefined,
    assigned_to,
  });

  if (!validated.success) {
    return {
      fieldErrors: validated.error.flatten().fieldErrors,
    };
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be signed in to create tasks" };
  }

  // Validate manager role and employee assignment
  const { data: employee, error: empError } = await supabase
    .from("profiles")
    .select("id, manager_id, role, is_active")
    .eq("id", validated.data.assigned_to)
    .single();

  if (empError || !employee) {
    return { error: "Selected employee not found" };
  }

  if (employee.role !== "employee" || employee.manager_id !== user.id) {
    return {
      error: "You can only assign tasks to employees assigned to you.",
    };
  }

  const { error: insertError } = await supabase.from("tasks").insert({
    title: validated.data.title,
    description: validated.data.description || null,
    due_date: validated.data.due_date || null,
    assigned_to: validated.data.assigned_to,
    created_by: user.id,
    status: "assigned",
  });

  if (insertError) {
    return { error: `Failed to create task: ${insertError.message}` };
  }

  revalidatePath("/manager");
  redirect("/manager");
}

const ReviewReportSchema = z.object({
  report_id: z.string().uuid(),
  decision: z.enum(["approved", "rejected"]),
  comment: z.string().optional(),
});

export async function reviewReportAction(
  reportId: string,
  decision: "approved" | "rejected",
  comment?: string
) {
  const validated = ReviewReportSchema.safeParse({
    report_id: reportId,
    decision,
    comment,
  });

  if (!validated.success) {
    throw new Error("Invalid review parameters");
  }

  if (decision === "rejected" && (!comment || comment.trim() === "")) {
    throw new Error("A feedback comment is required when rejecting a report");
  }

  const supabase = createClient();

  // Call the Postgres RPC review_report
  const { data, error } = await supabase.rpc("review_report", {
    p_report_id: reportId,
    p_decision: decision,
    p_comment: comment?.trim() || null,
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/manager");
  return { success: true };
}
