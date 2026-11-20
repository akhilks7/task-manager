"use client";

import React, { useState } from "react";
import { Task, Profile, TaskStatus } from "@/types/database";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { formatDate } from "@/lib/utils";
import { SpotlightCard } from "@/components/react-bits/SpotlightCard";
import { CountUp } from "@/components/react-bits/CountUp";
import { ShinyText } from "@/components/react-bits/ShinyText";
import {
  Users,
  CheckSquare,
  Clock,
  PlayCircle,
  FileCheck2,
  CheckCircle2,
  XCircle,
  Search,
  Filter,
  Sparkles,
} from "lucide-react";
import Link from "next/link";

interface AdminDashboardClientProps {
  stats: {
    totalUsers: number;
    adminsCount: number;
    managersCount: number;
    employeesCount: number;
    totalTasks: number;
    assignedCount: number;
    inProgressCount: number;
    submittedCount: number;
    approvedCount: number;
    rejectedCount: number;
  };
  tasks: Task[];
}

export function AdminDashboardClient({
  stats,
  tasks,
}: AdminDashboardClientProps) {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [search, setSearch] = useState("");

  const filteredTasks = tasks.filter((t) => {
    const matchesStatus = statusFilter === "all" || t.status === statusFilter;
    const matchesSearch =
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.assignee?.full_name.toLowerCase().includes(search.toLowerCase()) ||
      t.creator?.full_name.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-8">
      {/* Page Title with Enterprise Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-50 border border-indigo-200/80 text-[11px] font-semibold text-indigo-700 mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-pulse" />
            <span>Admin Executive Console</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            <ShinyText text="System Overview" speed={5} />
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Real-time bird's-eye metrics on users, task throughput, and review pipelines
          </p>
        </div>
      </div>

      {/* Top Stat Cards with React Bits Spotlight & CountUp */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Users */}
        <SpotlightCard
          spotlightColor="rgba(99, 102, 241, 0.14)"
          className="bg-white p-5 rounded-2xl border-slate-200 shadow-xs hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Users
            </span>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-xs">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-bold text-slate-900 tracking-tight">
              <CountUp to={stats.totalUsers} duration={1.2} />
            </span>
          </div>
          <div className="mt-2 text-xs text-slate-500 flex items-center space-x-2">
            <span>{stats.managersCount} Managers</span>
            <span>•</span>
            <span>{stats.employeesCount} Staff</span>
            <span>•</span>
            <span>{stats.adminsCount} Admins</span>
          </div>
        </SpotlightCard>

        {/* Total Tasks */}
        <SpotlightCard
          spotlightColor="rgba(59, 130, 246, 0.14)"
          className="bg-white p-5 rounded-2xl border-slate-200 shadow-xs hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Tasks
            </span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-xs">
              <CheckSquare className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-bold text-slate-900 tracking-tight">
              <CountUp to={stats.totalTasks} duration={1.2} />
            </span>
          </div>
          <div className="mt-2 text-xs text-slate-500">
            Across all teams and pipelines
          </div>
        </SpotlightCard>

        {/* Awaiting Review */}
        <SpotlightCard
          spotlightColor="rgba(168, 85, 247, 0.14)"
          className="bg-white p-5 rounded-2xl border-slate-200 shadow-xs hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Awaiting Review
            </span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shadow-xs">
              <FileCheck2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-bold text-purple-700 tracking-tight">
              <CountUp to={stats.submittedCount} duration={1.2} />
            </span>
          </div>
          <div className="mt-2 text-xs text-purple-600 font-medium">
            Pending manager decision
          </div>
        </SpotlightCard>

        {/* Completed / Approved */}
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
              <CountUp to={stats.approvedCount} duration={1.2} />
            </span>
          </div>
          <div className="mt-2 text-xs text-emerald-600">
            Successfully accepted work
          </div>
        </SpotlightCard>
      </div>

      {/* Task Status Breakdown Bar / Counters with CountUp */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-slate-900">
            Task Pipeline Breakdown
          </h2>
          <span className="text-xs text-slate-400">
            Click a status to filter activity
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <button
            onClick={() => setStatusFilter("assigned")}
            className={`p-3 rounded-xl border text-left transition-all ${
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
              <CountUp to={stats.assignedCount} duration={1} />
            </div>
          </button>

          <button
            onClick={() => setStatusFilter("in_progress")}
            className={`p-3 rounded-xl border text-left transition-all ${
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
              <CountUp to={stats.inProgressCount} duration={1} />
            </div>
          </button>

          <button
            onClick={() => setStatusFilter("submitted")}
            className={`p-3 rounded-xl border text-left transition-all ${
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
              <CountUp to={stats.submittedCount} duration={1} />
            </div>
          </button>

          <button
            onClick={() => setStatusFilter("approved")}
            className={`p-3 rounded-xl border text-left transition-all ${
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
              <CountUp to={stats.approvedCount} duration={1} />
            </div>
          </button>

          <button
            onClick={() => setStatusFilter("rejected")}
            className={`p-3 rounded-xl border text-left transition-all ${
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
              <CountUp to={stats.rejectedCount} duration={1} />
            </div>
          </button>
        </div>
      </div>

      {/* Task List / Table Section */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        {/* Table Controls */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-slate-50/40">
          <div className="flex items-center space-x-2">
            <h2 className="text-base font-semibold text-slate-900">
              Company Task Activity
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
                placeholder="Search tasks or people..."
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
                <option value="all">All Statuses</option>
                <option value="assigned">Assigned</option>
                <option value="in_progress">In Progress</option>
                <option value="submitted">Submitted</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
              <Filter className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Tasks Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50/80 text-slate-500 text-xs uppercase font-semibold border-b border-slate-200">
              <tr>
                <th scope="col" className="px-6 py-3.5">
                  Task
                </th>
                <th scope="col" className="px-6 py-3.5">
                  Assigned Employee
                </th>
                <th scope="col" className="px-6 py-3.5">
                  Manager
                </th>
                <th scope="col" className="px-6 py-3.5">
                  Status
                </th>
                <th scope="col" className="px-6 py-3.5">
                  Due Date
                </th>
                <th scope="col" className="px-6 py-3.5">
                  Created
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTasks.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-12 text-center text-slate-400 text-sm"
                  >
                    No tasks found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredTasks.map((task) => (
                  <tr
                    key={task.id}
                    className="hover:bg-slate-50/70 transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-900 group-hover:text-indigo-600 transition-colors">
                        {task.title}
                      </div>
                      {task.description && (
                        <div className="text-xs text-slate-400 truncate max-w-xs mt-0.5">
                          {task.description}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {task.assignee ? (
                        <div>
                          <div className="font-medium text-slate-900">
                            {task.assignee.full_name}
                          </div>
                          <div className="text-xs text-slate-400">
                            {task.assignee.email}
                          </div>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400">Unassigned</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {task.creator ? (
                        <div>
                          <div className="font-medium text-slate-900">
                            {task.creator.full_name}
                          </div>
                          <div className="text-xs text-slate-400">
                            {task.creator.email}
                          </div>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400">Unknown</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={task.status} />
                    </td>
                    <td className="px-6 py-4 text-xs">
                      {task.due_date ? (
                        <span
                          className={
                            new Date(task.due_date) < new Date() &&
                            task.status !== "approved"
                              ? "text-rose-600 font-medium"
                              : "text-slate-600"
                          }
                        >
                          {formatDate(task.due_date)}
                        </span>
                      ) : (
                        <span className="text-slate-400">None</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-400">
                      {formatDate(task.created_at)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
