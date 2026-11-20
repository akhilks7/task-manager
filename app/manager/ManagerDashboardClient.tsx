"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Task } from "@/types/database";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { formatDate } from "@/lib/utils";
import { SpotlightCard } from "@/components/react-bits/SpotlightCard";
import { CountUp } from "@/components/react-bits/CountUp";
import { ShinyText } from "@/components/react-bits/ShinyText";
import {
  PlusCircle,
  Search,
  Filter,
  AlertCircle,
  CheckSquare,
  ArrowRight,
  Clock,
  User,
  PlayCircle,
  FileCheck2,
  CheckCircle2,
  XCircle,
  FileText,
  Briefcase,
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

  const assignedCount = tasks.filter((t) => t.status === "assigned").length;
  const inProgressCount = tasks.filter((t) => t.status === "in_progress").length;
  const submittedCount = tasks.filter((t) => t.status === "submitted").length;
  const approvedCount = tasks.filter((t) => t.status === "approved").length;
  const rejectedCount = tasks.filter((t) => t.status === "rejected").length;
  const activeCount = assignedCount + inProgressCount;

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
    <div className="space-y-8">
      {/* Top Banner & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-50 border border-indigo-200/80 text-[11px] font-semibold text-indigo-700 mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-pulse" />
            <span>Team Delegation & Review Console</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            <ShinyText text="Manager Workspace" speed={5} />
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Delegate tasks to your team, track active progress, and sign off on submitted reports
          </p>
        </div>
        <Link
          href="/manager/tasks/new"
          className="inline-flex items-center justify-center px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-medium text-sm rounded-xl shadow-md shadow-indigo-600/20 hover:shadow-lg hover:shadow-indigo-600/30 transition-all active:scale-[0.99] flex-shrink-0"
        >
          <PlusCircle className="w-4 h-4 mr-2" />
          Create Task
        </Link>
      </div>

      {/* Review Alert Banner */}
      {submittedCount > 0 && (
        <div className="p-4 bg-purple-50/90 border border-purple-200/80 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-purple-900 shadow-xs">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-purple-100 flex items-center justify-center text-purple-700 flex-shrink-0 shadow-xs">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <p className="font-semibold text-sm">
                {submittedCount} task{submittedCount > 1 ? "s" : ""} awaiting your review
              </p>
              <p className="text-xs text-purple-700">
                Team members have submitted work reports ready for your approval or feedback.
              </p>
            </div>
          </div>
          <button
            onClick={() => setStatusFilter("submitted")}
            className="px-3.5 py-1.5 bg-purple-600 text-white text-xs font-semibold rounded-xl hover:bg-purple-700 transition-colors whitespace-nowrap shadow-xs cursor-pointer self-start sm:self-auto"
          >
            Review Pending Submissions
          </button>
        </div>
      )}

      {/* Top Stat Cards with React Bits Spotlight & CountUp */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Delegated Tasks */}
        <SpotlightCard
          spotlightColor="rgba(99, 102, 241, 0.14)"
          className="bg-white p-5 rounded-2xl border-slate-200 shadow-xs hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Delegated
            </span>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-xs">
              <Briefcase className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-bold text-slate-900 tracking-tight">
              <CountUp to={tasks.length} duration={1.2} />
            </span>
          </div>
          <div className="mt-2 text-xs text-slate-500">
            Assigned across your reporting team
          </div>
        </SpotlightCard>

        {/* Awaiting Review */}
        <SpotlightCard
          spotlightColor="rgba(168, 85, 247, 0.14)"
          className="bg-white p-5 rounded-2xl border-slate-200 shadow-xs hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Needs Your Review
            </span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shadow-xs">
              <FileCheck2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-bold text-purple-700 tracking-tight">
              <CountUp to={submittedCount} duration={1.2} />
            </span>
          </div>
          <div className="mt-2 text-xs text-purple-600 font-medium">
            Pending manager sign-off
          </div>
        </SpotlightCard>

        {/* Active In Progress */}
        <SpotlightCard
          spotlightColor="rgba(59, 130, 246, 0.14)"
          className="bg-white p-5 rounded-2xl border-slate-200 shadow-xs hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Active / In Progress
            </span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-xs">
              <PlayCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-bold text-slate-900 tracking-tight">
              <CountUp to={activeCount} duration={1.2} />
            </span>
          </div>
          <div className="mt-2 text-xs text-slate-500">
            {inProgressCount} in progress • {assignedCount} not started
          </div>
        </SpotlightCard>

        {/* Approved Work */}
        <SpotlightCard
          spotlightColor="rgba(16, 185, 129, 0.14)"
          className="bg-white p-5 rounded-2xl border-slate-200 shadow-xs hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Approved Work
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-xs">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-bold text-emerald-700 tracking-tight">
              <CountUp to={approvedCount} duration={1.2} />
            </span>
          </div>
          <div className="mt-2 text-xs text-emerald-600">
            Successfully completed deliverables
          </div>
        </SpotlightCard>
      </div>

      {/* Task Status Breakdown Bar with CountUp */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-slate-900">
            Team Pipeline Breakdown
          </h2>
          <span className="text-xs text-slate-400">
            Click a status to filter team tasks
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <button
            onClick={() => setStatusFilter("assigned")}
            className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
              statusFilter === "assigned"
                ? "border-blue-500 bg-blue-50/60 ring-2 ring-blue-500/20"
                : "border-slate-200 hover:bg-slate-50 hover:border-slate-300"
            }`}
          >
            <div className="flex items-center space-x-1.5 text-xs font-medium text-blue-700">
              <Clock className="w-3.5 h-3.5" />
              <span>Assigned</span>
            </div>
            <div className="text-xl font-bold text-slate-900 mt-1">
              <CountUp to={assignedCount} duration={1} />
            </div>
          </button>

          <button
            onClick={() => setStatusFilter("in_progress")}
            className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
              statusFilter === "in_progress"
                ? "border-amber-500 bg-amber-50/60 ring-2 ring-amber-500/20"
                : "border-slate-200 hover:bg-slate-50 hover:border-slate-300"
            }`}
          >
            <div className="flex items-center space-x-1.5 text-xs font-medium text-amber-700">
              <PlayCircle className="w-3.5 h-3.5" />
              <span>In Progress</span>
            </div>
            <div className="text-xl font-bold text-slate-900 mt-1">
              <CountUp to={inProgressCount} duration={1} />
            </div>
          </button>

          <button
            onClick={() => setStatusFilter("submitted")}
            className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
              statusFilter === "submitted"
                ? "border-purple-500 bg-purple-50/60 ring-2 ring-purple-500/20"
                : "border-slate-200 hover:bg-slate-50 hover:border-slate-300"
            }`}
          >
            <div className="flex items-center space-x-1.5 text-xs font-medium text-purple-700">
              <FileCheck2 className="w-3.5 h-3.5" />
              <span>Submitted</span>
            </div>
            <div className="text-xl font-bold text-slate-900 mt-1">
              <CountUp to={submittedCount} duration={1} />
            </div>
          </button>

          <button
            onClick={() => setStatusFilter("approved")}
            className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
              statusFilter === "approved"
                ? "border-emerald-500 bg-emerald-50/60 ring-2 ring-emerald-500/20"
                : "border-slate-200 hover:bg-slate-50 hover:border-slate-300"
            }`}
          >
            <div className="flex items-center space-x-1.5 text-xs font-medium text-emerald-700">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Approved</span>
            </div>
            <div className="text-xl font-bold text-slate-900 mt-1">
              <CountUp to={approvedCount} duration={1} />
            </div>
          </button>

          <button
            onClick={() => setStatusFilter("rejected")}
            className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
              statusFilter === "rejected"
                ? "border-rose-500 bg-rose-50/60 ring-2 ring-rose-500/20"
                : "border-slate-200 hover:bg-slate-50 hover:border-slate-300"
            }`}
          >
            <div className="flex items-center space-x-1.5 text-xs font-medium text-rose-700">
              <XCircle className="w-3.5 h-3.5" />
              <span>Rejected</span>
            </div>
            <div className="text-xl font-bold text-slate-900 mt-1">
              <CountUp to={rejectedCount} duration={1} />
            </div>
          </button>
        </div>
      </div>

      {/* Task Activity Table Section */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        {/* Controls Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-slate-50/40">
          <div className="flex items-center space-x-2">
            <h2 className="text-base font-semibold text-slate-900">
              Delegated Tasks
            </h2>
            <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-medium">
              {filteredTasks.length} {filteredTasks.length === 1 ? "task" : "tasks"}
            </span>
          </div>

          <div className="flex items-center space-x-3">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search tasks or employees..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 pr-4 py-1.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all placeholder-slate-400 w-full sm:w-60 shadow-2xs"
              />
            </div>

            {/* Filter Dropdown */}
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="pl-3 pr-8 py-1.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all text-slate-700 cursor-pointer appearance-none shadow-2xs"
              >
                <option value="all">All Statuses ({tasks.length})</option>
                <option value="submitted">Submitted / In Review ({submittedCount})</option>
                <option value="assigned">Assigned ({assignedCount})</option>
                <option value="in_progress">In Progress ({inProgressCount})</option>
                <option value="approved">Approved ({approvedCount})</option>
                <option value="rejected">Rejected ({rejectedCount})</option>
              </select>
              <Filter className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Task Cards List */}
        {filteredTasks.length === 0 ? (
          <div className="text-center py-16 px-4">
            <CheckSquare className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-slate-800">
              No tasks found
            </h3>
            <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
              {tasks.length === 0
                ? "You haven't delegated any tasks yet. Click 'Create Task' above to assign your first task."
                : "No tasks match your selected filter criteria."}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredTasks.map((task) => (
              <Link
                key={task.id}
                href={`/manager/tasks/${task.id}`}
                className="block hover:bg-slate-50/70 transition-colors p-5 group"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1.5">
                    <div className="flex items-center space-x-3">
                      <h3 className="text-base font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">
                        {task.title}
                      </h3>
                      <StatusBadge status={task.status} />
                    </div>
                    {task.description && (
                      <p className="text-sm text-slate-500 line-clamp-1 max-w-2xl">
                        {task.description}
                      </p>
                    )}
                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
                      <span className="flex items-center font-medium text-slate-700">
                        <User className="w-3.5 h-3.5 mr-1 text-slate-400" />
                        {task.assignee?.full_name} ({task.assignee?.email})
                      </span>
                      {task.due_date && (
                        <span
                          className={`flex items-center ${
                            new Date(task.due_date) < new Date() &&
                            task.status !== "approved"
                              ? "text-rose-600 font-medium"
                              : "text-slate-600"
                          }`}
                        >
                          <Clock className="w-3.5 h-3.5 mr-1 text-slate-400" />
                          Due: {formatDate(task.due_date)}
                        </span>
                      )}
                      <span>Assigned {formatDate(task.created_at)}</span>
                    </div>
                  </div>

                  <div className="flex items-center text-sm font-medium sm:self-center">
                    {task.status === "submitted" ? (
                      <span className="inline-flex items-center text-purple-600 font-semibold bg-purple-50 px-3 py-1 rounded-lg">
                        Review Report
                        <ArrowRight className="w-4 h-4 ml-1.5" />
                      </span>
                    ) : (
                      <span className="inline-flex items-center text-indigo-600 group-hover:translate-x-0.5 transition-transform">
                        View Details
                        <ArrowRight className="w-4 h-4 ml-1.5" />
                      </span>
                    )}
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
