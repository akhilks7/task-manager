import React from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Navbar } from "@/components/ui/Navbar";
import { Profile } from "@/types/database";

export default async function AdminLayout({
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

  if (!profile || profile.role !== "admin") {
    redirect(`/${profile?.role || "login"}`);
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar
        user={{
          id: user.id,
          email: user.email || profile.email,
          full_name: profile.full_name,
          role: "admin",
        }}
      />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
