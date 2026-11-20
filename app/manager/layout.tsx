import React from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Navbar } from "@/components/ui/Navbar";

export default async function ManagerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "manager") {
    redirect(`/${profile?.role || "login"}`);
  }

  // Count submitted tasks awaiting review created by this manager
  const { count: pendingCount } = await supabase
    .from("tasks")
    .select("*", { count: "exact", head: true })
    .eq("created_by", user.id)
    .eq("status", "submitted");

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar
        user={{
          id: user.id,
          email: user.email || profile.email,
          full_name: profile.full_name,
          role: "manager",
        }}
        pendingReviewsCount={pendingCount || 0}
      />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
