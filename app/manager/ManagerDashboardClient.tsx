"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Task } from "@/types/database";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { formatDate } from "@/lib/utils";
import {
  PlusCircle,
  Search,
  Filter,
  AlertCircle,
  CheckSquare,
  ArrowRight,
  Clock,
  User,
} from "lucide-react";

interface ManagerDashboardClientProps {
  tasks: Task[];
  pendingCount: number;
}

export function ManagerDashboardClient({
  tasks,
  pendingCount,
}: ManagerDashboardClientProps) {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [search, setSearch] = useState("");

  const filteredTasks = tasks.filter((task) => {
    const matchesStatus =
      statusFilter === "all" || task.status === statusFilter;
    const matchesSearch =
      task.title.toLowerCase().includes(search.toLowerCase()) ||
      (task.assignee?.full_name &&
        task.assignee.full_name.toLowerCase().includes(search.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Manager Workspace
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Delegate tasks to your team and review submitted reports
          </p>
        </div>
        <Link
          href="/manager/tasks/new"
          className="inline-flex items-center justify-center px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm rounded-lg shadow-sm transition-colors"
        >
          <PlusCircle className="w-4 h-4 mr-2" />
          Create Task
        </Link>
      </div>

      {/* Review Alert Banner */}
      {pendingCount > 0 && (
        <div className="p-4 bg-purple-50 border border-purple-200 rounded-xl flex items-center justify-between text-purple-900">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center text-purple-700 flex-shrink-0">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <p className="font-semibold text-sm">
                {pendingCount} task{pendingCount > 1 ? "s" : ""} awaiting your review
              </p>
              <p className="text-xs text-purple-700">
                Team members have submitted work ready for your sign-off or feedback.
              </p>
            </div>
          </div>
          <button
            onClick={() => setStatusFilter("submitted")}
            className="px-3 py-1.5 bg-purple-600 text-white text-xs font-medium rounded-lg hover:bg-purple-700 transition-colors whitespace-nowrap"
          >
            Filter Awaiting Review
          </button>
        </div>
      )}

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search tasks or employees..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-slate-300 rounded-lg text-sm px-3 py-2 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All Statuses ({tasks.length})</option>
            <option value="submitted">Submitted / In Review ({tasks.filter((t) => t.status === "submitted").length})</option>
            <option value="assigned">Assigned ({tasks.filter((t) => t.status === "assigned").length})</option>
            <option value="in_progress">In Progress ({tasks.filter((t) => t.status === "in_progress").length})</option>
            <option value="approved">Approved ({tasks.filter((t) => t.status === "approved").length})</option>
            <option value="rejected">Rejected ({tasks.filter((t) => t.status === "rejected").length})</option>
          </select>
        </div>
      </div>

      {/* Task List */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {filteredTasks.length === 0 ? (
          <div className="text-center py-12 px-4">
            <CheckSquare className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-slate-800">
              No tasks found
            </h3>
            <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
              {tasks.length === 0
                ? "You haven't delegated any tasks yet. Click 'Create Task' above to assign your first task."
                : "No tasks match your current filter criteria."}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-200">
            {filteredTasks.map((task) => (
              <Link
                key={task.id}
                href={`/manager/tasks/${task.id}`}
                className="block hover:bg-slate-50/80 transition-colors p-5"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-3">
                      <h3 className="text-base font-semibold text-slate-900 hover:text-indigo-600 transition-colors">
                        {task.title}
                      </h3>
                      <StatusBadge status={task.status} />
                    </div>
                    {task.description && (
                      <p className="text-sm text-slate-500 line-clamp-1">
                        {task.description}
                      </p>
                    )}
                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
                      <span className="flex items-center text-slate-700 font-medium">
                        <User className="w-3.5 h-3.5 mr-1 text-slate-400" />
                        {task.assignee?.full_name} ({task.assignee?.email})
                      </span>
                      {task.due_date && (
                        <span className="flex items-center text-slate-600">
                          <Clock className="w-3.5 h-3.5 mr-1 text-slate-400" />
                          Due {formatDate(task.due_date)}
                        </span>
                      )}
                      <span>Created {formatDate(task.created_at)}</span>
                    </div>
                  </div>

                  <div className="flex items-center text-sm font-medium text-indigo-600 sm:self-center">
                    <span>View Task</span>
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
