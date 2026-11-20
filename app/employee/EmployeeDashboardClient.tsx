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
  CheckSquare,
  Clock,
  User,
  ArrowRight,
  Search,
  Filter,
  AlertCircle,
  PlayCircle,
  FileCheck2,
  CheckCircle2,
  XCircle,
  Sparkles,
  ClipboardList,
} from "lucide-react";

interface EmployeeDashboardClientProps {
  tasks: Task[];
}

export function EmployeeDashboardClient({ tasks }: EmployeeDashboardClientProps) {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [search, setSearch] = useState("");

  const assignedCount = tasks.filter((t) => t.status === "assigned").length;
  const inProgressCount = tasks.filter((t) => t.status === "in_progress").length;
  const submittedCount = tasks.filter((t) => t.status === "submitted").length;
  const approvedCount = tasks.filter((t) => t.status === "approved").length;
  const rejectedCount = tasks.filter((t) => t.status === "rejected").length;
  const actionRequiredCount = assignedCount + inProgressCount + rejectedCount;

  const filteredTasks = tasks.filter((task) => {
    const matchesStatus =
      statusFilter === "all" || task.status === statusFilter;
    const matchesSearch =
      task.title.toLowerCase().includes(search.toLowerCase()) ||
      (task.creator?.full_name &&
        task.creator.full_name.toLowerCase().includes(search.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-50 border border-indigo-200/80 text-[11px] font-semibold text-indigo-700 mb-2">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-pulse" />
          <span>Individual Contributor Workspace</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
          <ShinyText text="My Work & Activity Log" speed={5} />
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Review tasks delegated to you, record progress, and submit work reports for manager sign-off
        </p>
      </div>

      {/* Action Required Banner */}
      {actionRequiredCount > 0 && (
        <div className="p-4 bg-blue-50/90 border border-blue-200/80 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-blue-900 shadow-xs">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center text-blue-700 flex-shrink-0 shadow-xs">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <p className="font-semibold text-sm">
                You have {actionRequiredCount} task{actionRequiredCount > 1 ? "s" : ""} needing your action
              </p>
              <p className="text-xs text-blue-700">
                Tasks ready to be started, reports to be submitted, or work needing revision.
              </p>
            </div>
          </div>
          {rejectedCount > 0 && (
            <button
              onClick={() => setStatusFilter("rejected")}
              className="px-3.5 py-1.5 bg-rose-600 text-white text-xs font-semibold rounded-xl hover:bg-rose-700 transition-colors whitespace-nowrap shadow-xs cursor-pointer self-start sm:self-auto"
            >
              View Revision Requests ({rejectedCount})
            </button>
          )}
        </div>
      )}

      {/* Top Stat Cards with React Bits Spotlight & CountUp */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Assigned */}
        <SpotlightCard
          spotlightColor="rgba(99, 102, 241, 0.14)"
          className="bg-white p-5 rounded-2xl border-slate-200 shadow-xs hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Assigned
            </span>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-xs">
              <ClipboardList className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-bold text-slate-900 tracking-tight">
              <CountUp to={tasks.length} duration={1.2} />
            </span>
          </div>
          <div className="mt-2 text-xs text-slate-500">
            Total assignments across all time
          </div>
        </SpotlightCard>

        {/* Action Required */}
        <SpotlightCard
          spotlightColor="rgba(245, 158, 11, 0.14)"
          className="bg-white p-5 rounded-2xl border-slate-200 shadow-xs hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Action Required
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shadow-xs">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-bold text-amber-600 tracking-tight">
              <CountUp to={actionRequiredCount} duration={1.2} />
            </span>
          </div>
          <div className="mt-2 text-xs text-amber-700 font-medium">
            {assignedCount} new • {inProgressCount} active • {rejectedCount} revise
          </div>
        </SpotlightCard>

        {/* Under Manager Review */}
        <SpotlightCard
          spotlightColor="rgba(168, 85, 247, 0.14)"
          className="bg-white p-5 rounded-2xl border-slate-200 shadow-xs hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Submitted / In Review
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
            Awaiting manager sign-off
          </div>
        </SpotlightCard>

        {/* Completed & Approved */}
        <SpotlightCard
          spotlightColor="rgba(16, 185, 129, 0.14)"
          className="bg-white p-5 rounded-2xl border-slate-200 shadow-xs hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Approved
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
            Successfully accepted work
          </div>
        </SpotlightCard>
      </div>

      {/* Task Status Breakdown Bar with CountUp */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-slate-900">
            My Task Pipeline
          </h2>
          <span className="text-xs text-slate-400">
            Click a status to filter your work
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
              <span>In Review</span>
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
              <span>Needs Revision</span>
            </div>
            <div className="text-xl font-bold text-slate-900 mt-1">
              <CountUp to={rejectedCount} duration={1} />
            </div>
          </button>
        </div>
      </div>

      {/* Task List / Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        {/* Filter and Search Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-slate-50/40">
          <div className="flex items-center space-x-2">
            <h2 className="text-base font-semibold text-slate-900">
              My Task Worklist
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
                placeholder="Search tasks..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 pr-4 py-1.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all placeholder-slate-400 w-full sm:w-60 shadow-2xs"
              />
            </div>

            {/* Status Dropdown */}
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="pl-3 pr-8 py-1.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all text-slate-700 cursor-pointer appearance-none shadow-2xs"
              >
                <option value="all">All Tasks ({tasks.length})</option>
                <option value="assigned">Assigned / Not Started ({assignedCount})</option>
                <option value="in_progress">In Progress ({inProgressCount})</option>
                <option value="submitted">Submitted / Under Review ({submittedCount})</option>
                <option value="rejected">Needs Revision ({rejectedCount})</option>
                <option value="approved">Approved ({approvedCount})</option>
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
                ? "You currently have no tasks assigned to you. When your manager delegates a task, it will appear here."
                : "No tasks match your selected filter."}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredTasks.map((task) => (
              <Link
                key={task.id}
                href={`/employee/tasks/${task.id}`}
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
                        Manager: {task.creator?.full_name}
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
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-semibold ${
                        task.status === "assigned"
                          ? "bg-blue-50 text-blue-700"
                          : task.status === "in_progress"
                          ? "bg-amber-50 text-amber-700"
                          : task.status === "rejected"
                          ? "bg-rose-50 text-rose-700"
                          : task.status === "submitted"
                          ? "bg-purple-50 text-purple-700"
                          : "bg-emerald-50 text-emerald-700"
                      }`}
                    >
                      {task.status === "assigned"
                        ? "Start Task"
                        : task.status === "in_progress"
                        ? "Submit Report"
                        : task.status === "rejected"
                        ? "Revise & Resubmit"
                        : task.status === "submitted"
                        ? "Under Review"
                        : "View Work"}
                      <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                    </span>
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
