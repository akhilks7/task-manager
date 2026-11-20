"use client";

import React, { useTransition } from "react";
import { useFormState } from "react-dom";
import Link from "next/link";
import { createTaskAction, type CreateTaskState } from "../actions";
import { Profile } from "@/types/database";
import { ArrowLeft, PlusCircle, AlertCircle, Calendar, User, FileText } from "lucide-react";

interface CreateTaskFormProps {
  employees: Profile[];
}

export function CreateTaskForm({ employees }: CreateTaskFormProps) {
  const [state, formAction] = useFormState<CreateTaskState | null, FormData>(
    createTaskAction,
    null
  );
  const [isPending, startTransition] = useTransition();

  return (
    <div className="max-w-2xl mx-auto">
      {/* Back Link */}
      <Link
        href="/manager"
        className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-800 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-1.5" />
        Back to Tasks
      </Link>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 sm:p-8">
        <div className="mb-6 pb-4 border-b border-slate-100">
          <h1 className="text-xl font-bold text-slate-900">Create New Task</h1>
          <p className="text-sm text-slate-500 mt-1">
            Delegate a task to one of your assigned team members
          </p>
        </div>

        {state?.error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-start space-x-3 text-rose-800 text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-500 mt-0.5" />
            <p>{state.error}</p>
          </div>
        )}

        <form
          action={(formData) => {
            startTransition(() => {
              formAction(formData);
            });
          }}
          className="space-y-5"
        >
          {/* Title */}
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-semibold text-slate-700 mb-1.5"
            >
              Task Title <span className="text-rose-500">*</span>
            </label>
            <input
              id="title"
              name="title"
              type="text"
              required
              placeholder="e.g. Prepare monthly branch expenditure report"
              className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            {state?.fieldErrors?.title && (
              <p className="mt-1 text-xs text-rose-600">
                {state.fieldErrors.title[0]}
              </p>
            )}
          </div>

          {/* Description */}
          <div>
            <label
              htmlFor="description"
              className="block text-sm font-semibold text-slate-700 mb-1.5"
            >
              Description & Requirements
            </label>
            <textarea
              id="description"
              name="description"
              rows={4}
              placeholder="Provide context, required deliverable format, references, etc."
              className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            {state?.fieldErrors?.description && (
              <p className="mt-1 text-xs text-rose-600">
                {state.fieldErrors.description[0]}
              </p>
            )}
          </div>

          {/* Employee dropdown */}
          <div>
            <label
              htmlFor="assigned_to"
              className="block text-sm font-semibold text-slate-700 mb-1.5"
            >
              Assign To Employee <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <select
                id="assigned_to"
                name="assigned_to"
                required
                defaultValue=""
                className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="" disabled>
                  Select an employee assigned to you
                </option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.full_name} ({emp.email})
                  </option>
                ))}
              </select>
            </div>
            {employees.length === 0 ? (
              <p className="mt-1.5 text-xs text-amber-600">
                You currently have no employees paired with you. Please request an
                admin to assign employees to your management profile.
              </p>
            ) : (
              <p className="mt-1 text-xs text-slate-500">
                Only employees reporting directly to you are listed.
              </p>
            )}
            {state?.fieldErrors?.assigned_to && (
              <p className="mt-1 text-xs text-rose-600">
                {state.fieldErrors.assigned_to[0]}
              </p>
            )}
          </div>

          {/* Due date */}
          <div>
            <label
              htmlFor="due_date"
              className="block text-sm font-semibold text-slate-700 mb-1.5"
            >
              Due Date
            </label>
            <input
              id="due_date"
              name="due_date"
              type="date"
              className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            {state?.fieldErrors?.due_date && (
              <p className="mt-1 text-xs text-rose-600">
                {state.fieldErrors.due_date[0]}
              </p>
            )}
          </div>

          <div className="flex items-center justify-end space-x-3 pt-6 border-t border-slate-100">
            <Link
              href="/manager"
              className="px-4 py-2.5 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isPending || employees.length === 0}
              className="inline-flex items-center px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm rounded-lg shadow-sm transition-colors disabled:opacity-50"
            >
              <PlusCircle className="w-4 h-4 mr-2" />
              {isPending ? "Assigning Task..." : "Create & Assign Task"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
