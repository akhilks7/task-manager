import React from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CreateTaskForm } from "./CreateTaskForm";
import { Profile } from "@/types/database";

export const dynamic = "force-dynamic";

export default async function NewTaskPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch only active employees where manager_id = current manager id
  const { data: employees } = await supabase
    .from("profiles")
    .select("*")
    .eq("role", "employee")
    .eq("manager_id", user.id)
    .eq("is_active", true)
    .order("full_name", { ascending: true });

  return <CreateTaskForm employees={(employees as Profile[]) || []} />;
}
