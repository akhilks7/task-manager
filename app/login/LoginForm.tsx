"use client";

import React, { useTransition } from "react";
import { useFormState } from "react-dom";
import { loginAction, type LoginActionState } from "./actions";
import { Lock, Mail, AlertCircle, ArrowRight, FileCheck2 } from "lucide-react";

export function LoginForm({ initialError }: { initialError?: string }) {
  const [state, formAction] = useFormState<LoginActionState | null, FormData>(
    loginAction,
    null
  );
  const [isPending, startTransition] = useTransition();

  const errorMessage =
    state?.error ||
    (initialError === "account_deactivated"
      ? "Your account has been deactivated. Please contact your administrator."
      : initialError);

  return (
    <form
      action={(formData) => {
        startTransition(() => {
          formAction(formData);
        });
      }}
      className="space-y-5"
    >
      {errorMessage && (
        <div className="p-3.5 rounded-lg bg-rose-50 border border-rose-200 flex items-start space-x-2.5 text-rose-700 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-500 mt-0.5" />
          <p>{errorMessage}</p>
        </div>
      )}

      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-slate-700 mb-1.5"
        >
          Email address
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Mail className="w-4 h-4" />
          </div>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder="name@company.com"
            className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
          />
        </div>
        {state?.fieldErrors?.email && (
          <p className="mt-1.5 text-xs text-rose-600">
            {state.fieldErrors.email[0]}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="password"
          className="block text-sm font-medium text-slate-700 mb-1.5"
        >
          Password
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Lock className="w-4 h-4" />
          </div>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            placeholder="••••••••"
            className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
          />
        </div>
        {state?.fieldErrors?.password && (
          <p className="mt-1.5 text-xs text-rose-600">
            {state.fieldErrors.password[0]}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full mt-2 flex items-center justify-center py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all disabled:opacity-60"
      >
        {isPending ? (
          <span className="inline-flex items-center">
            <svg
              className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8H4z"
              />
            </svg>
            Signing in...
          </span>
        ) : (
          <span className="inline-flex items-center">
            Sign In
            <ArrowRight className="w-4 h-4 ml-1.5" />
          </span>
        )}
      </button>

      <div className="pt-3 text-center">
        <p className="text-xs text-slate-500">
          Accounts are provisioned by company administration.
        </p>
      </div>
    </form>
  );
}
