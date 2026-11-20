import React from "react";
import { LoginForm } from "./LoginForm";
import { FileCheck2 } from "lucide-react";

export default function LoginPage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-slate-50">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-indigo-600 text-white shadow-md mb-4">
          <FileCheck2 className="w-7 h-7" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Task & Report Management
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Sign in to access your role-specific dashboard
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-sm border border-slate-200 rounded-2xl sm:px-10">
          <LoginForm initialError={searchParams.error} />
        </div>
      </div>
    </div>
  );
}
