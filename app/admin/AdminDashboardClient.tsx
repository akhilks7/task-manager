"use client";

import React, { useState } from "react";
import { Task, Profile, TaskStatus } from "@/types/database";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { formatDate } from "@/lib/utils";
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
      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          System Overview
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Real-time bird's-eye metrics on users, task throughput, and review pipelines
        </p>
      </div>

      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Users */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Users
            </span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-slate-900">
              {stats.totalUsers}
            </span>
          </div>
          <div className="mt-2 text-xs text-slate-500 flex items-center space-x-2">
            <span>{stats.managersCount} Managers</span>
            <span>•</span>
            <span>{stats.employeesCount} Employees</span>
            <span>•</span>
            <span>{stats.adminsCount} Admins</span>
          </div>
        </div>

        {/* Total Tasks */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Tasks
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <CheckSquare className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-slate-900">
              {stats.totalTasks}
            </span>
          </div>
          <div className="mt-2 text-xs text-slate-500">
            Across all teams and employees
          </div>
        </div>

        {/* Awaiting Review */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Awaiting Review
            </span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <FileCheck2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-purple-700">
              {stats.submittedCount}
            </span>
          </div>
          <div className="mt-2 text-xs text-purple-600 font-medium">
            Pending manager decision
          </div>
        </div>

        {/* Completed / Approved */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Approved
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-emerald-700">
              {stats.approvedCount}
            </span>
          </div>
          <div className="mt-2 text-xs text-emerald-600">
            Successfully accepted work
          </div>
        </div>
      </div>

      {/* Task Status Breakdown Bar / Counters */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <h2 className="text-sm font-semibold text-slate-900 mb-4">
          Task Pipeline Breakdown
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <button
            onClick={() => setStatusFilter("assigned")}
            className={`p-3 rounded-lg border text-left transition-all ${
              statusFilter === "assigned"
                ? "border-blue-500 bg-blue-50/50"
                : "border-slate-200 hover:bg-slate-50"
            }`}
          >
            <div className="flex items-center space-x-1.5 text-xs font-medium text-blue-700">
              <Clock className="w-3.5 h-3.5" />
              <span>Assigned</span>
            </div>
            <div className="text-xl font-bold text-slate-900 mt-1">
              {stats.assignedCount}
            </div>
          </button>

          <button
            onClick={() => setStatusFilter("in_progress")}
            className={`p-3 rounded-lg border text-left transition-all ${
              statusFilter === "in_progress"
                ? "border-amber-500 bg-amber-50/50"
                : "border-slate-200 hover:bg-slate-50"
            }`}
          >
            <div className="flex items-center space-x-1.5 text-xs font-medium text-amber-700">
              <PlayCircle className="w-3.5 h-3.5" />
              <span>In Progress</span>
            </div>
            <div className="text-xl font-bold text-slate-900 mt-1">
              {stats.inProgressCount}
            </div>
          </button>

          <button
            onClick={() => setStatusFilter("submitted")}
            className={`p-3 rounded-lg border text-left transition-all ${
              statusFilter === "submitted"
                ? "border-purple-500 bg-purple-50/50"
                : "border-slate-200 hover:bg-slate-50"
            }`}
          >
            <div className="flex items-center space-x-1.5 text-xs font-medium text-purple-700">
              <FileCheck2 className="w-3.5 h-3.5" />
              <span>Submitted</span>
            </div>
            <div className="text-xl font-bold text-slate-900 mt-1">
              {stats.submittedCount}
            </div>
          </button>

          <button
            onClick={() => setStatusFilter("approved")}
            className={`p-3 rounded-lg border text-left transition-all ${
              statusFilter === "approved"
                ? "border-emerald-500 bg-emerald-50/50"
                : "border-slate-200 hover:bg-slate-50"
            }`}
          >
            <div className="flex items-center space-x-1.5 text-xs font-medium text-emerald-700">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Approved</span>
            </div>
            <div className="text-xl font-bold text-slate-900 mt-1">
              {stats.approvedCount}
            </div>
          </button>

          <button
            onClick={() => setStatusFilter("rejected")}
            className={`p-3 rounded-lg border text-left transition-all ${
              statusFilter === "rejected"
                ? "border-rose-500 bg-rose-50/50"
                : "border-slate-200 hover:bg-slate-50"
            }`}
          >
            <div className="flex items-center space-x-1.5 text-xs font-medium text-rose-700">
              <XCircle className="w-3.5 h-3.5" />
              <span>Rejected</span>
            </div>
            <div className="text-xl font-bold text-slate-900 mt-1">
              {stats.rejectedCount}
            </div>
          </button>
        </div>
      </div>

      {/* All Tasks Table */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h2 className="text-lg font-semibold text-slate-900">
            Company Task Activity
          </h2>
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search tasks or people..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 pr-3 py-1.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-slate-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border border-slate-300 rounded-lg text-sm px-3 py-1.5 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">All Statuses</option>
                <option value="assigned">Assigned</option>
                <option value="in_progress">In Progress</option>
                <option value="submitted">Submitted</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
              <thead className="bg-slate-50 text-slate-600 font-semibold text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3.5">Task</th>
                  <th className="px-6 py-3.5">Assigned Employee</th>
                  <th className="px-6 py-3.5">Manager</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5">Due Date</th>
                  <th className="px-6 py-3.5">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredTasks.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                      No tasks found.
                    </td>
                  </tr>
                ) : (
                  filteredTasks.map((task) => (
                    <tr key={task.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-900">
                          {task.title}
                        </div>
                        {task.description && (
                          <div className="text-xs text-slate-500 truncate max-w-xs mt-0.5">
                            {task.description}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-800">
                          {task.assignee?.full_name || "Unknown"}
                        </div>
                        <div className="text-xs text-slate-500">
                          {task.assignee?.email}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-slate-800">
                          {task.creator?.full_name || "Unknown"}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={task.status} />
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-600">
                        {formatDate(task.due_date)}
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-500">
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
    </div>
  );
}
