"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Task, TaskReport } from "@/types/database";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { formatDate, formatDateTime } from "@/lib/utils";
import { reviewReportAction } from "../actions";
import { createClient } from "@/lib/supabase/client";
import {
  ArrowLeft,
  Calendar,
  User,
  Paperclip,
  CheckCircle2,
  XCircle,
  Clock,
  MessageSquare,
  AlertCircle,
  FileCheck2,
  Download,
} from "lucide-react";

interface ManagerTaskReviewClientProps {
  task: Task;
  reports: TaskReport[];
}

export function ManagerTaskReviewClient({
  task,
  reports,
}: ManagerTaskReviewClientProps) {
  const router = useRouter();
  const [comment, setComment] = useState("");
  const [loadingDecision, setLoadingDecision] = useState<"approved" | "rejected" | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // The latest report submitted
  const latestReport = reports[reports.length - 1];
  const canReview =
    latestReport &&
    latestReport.review_status === "pending" &&
    task.status === "submitted";

  const handleReview = async (decision: "approved" | "rejected") => {
    if (!latestReport) return;
    if (decision === "rejected" && !comment.trim()) {
      setActionError("A feedback comment is required when rejecting a report.");
      return;
    }

    setLoadingDecision(decision);
    setActionError(null);

    try {
      await reviewReportAction(latestReport.id, decision, comment);
      setSuccessMsg(
        `Report has been ${decision === "approved" ? "approved" : "rejected"} successfully.`
      );
      setComment("");
      router.refresh();
    } catch (err: any) {
      setActionError(err.message || "Failed to submit review");
    } finally {
      setLoadingDecision(null);
    }
  };

  const getDownloadUrl = async (path: string) => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase.storage
        .from("reports")
        .createSignedUrl(path, 60);

      if (error || !data?.signedUrl) {
        window.open(path, "_blank");
      } else {
        window.open(data.signedUrl, "_blank");
      }
    } catch {
      window.open(path, "_blank");
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back button */}
      <Link
        href="/manager"
        className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-1.5" />
        Back to Dashboard
      </Link>

      {/* Task Overview Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <h1 className="text-xl font-bold text-slate-900">{task.title}</h1>
              <StatusBadge status={task.status} />
            </div>
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
              <span className="flex items-center font-medium text-slate-700">
                <User className="w-3.5 h-3.5 mr-1 text-slate-400" />
                Assigned to: {task.assignee?.full_name} ({task.assignee?.email})
              </span>
              {task.due_date && (
                <span className="flex items-center text-slate-600">
                  <Calendar className="w-3.5 h-3.5 mr-1 text-slate-400" />
                  Due: {formatDate(task.due_date)}
                </span>
              )}
              <span>Created {formatDate(task.created_at)}</span>
            </div>
          </div>
        </div>

        {/* Task Description */}
        <div className="pt-6">
          <h3 className="text-xs font-semibold uppercase text-slate-500 tracking-wider mb-2">
            Task Description & Instructions
          </h3>
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-sm text-slate-800 whitespace-pre-wrap">
            {task.description || (
              <span className="text-slate-400 italic">No description provided.</span>
            )}
          </div>
        </div>
      </div>

      {/* Review Action Form (Shown if latest report is awaiting review) */}
      {canReview && (
        <div className="bg-purple-50/50 rounded-2xl border-2 border-purple-200 shadow-xs p-6 sm:p-8">
          <div className="flex items-center space-x-2.5 text-purple-900 mb-2">
            <FileCheck2 className="w-6 h-6 text-purple-600" />
            <h2 className="text-lg font-bold">Review Latest Submission</h2>
          </div>
          <p className="text-sm text-purple-800 mb-6">
            Review the report provided below. You can accept the deliverable or
            reject it with required feedback so the employee can revise and resubmit.
          </p>

          {actionError && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-800 text-sm rounded-lg flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0" />
              <span>{actionError}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm rounded-lg flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-1.5">
                Feedback / Review Comment
              </label>
              <textarea
                rows={3}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Required if rejecting (e.g., 'Please attach the updated receipts breakdown table'). Optional for approval."
                className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => handleReview("rejected")}
                disabled={loadingDecision !== null}
                className="inline-flex items-center px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-medium text-sm rounded-lg shadow-sm transition-colors disabled:opacity-50"
              >
                <XCircle className="w-4 h-4 mr-2" />
                {loadingDecision === "rejected" ? "Rejecting..." : "Reject with Feedback"}
              </button>

              <button
                type="button"
                onClick={() => handleReview("approved")}
                disabled={loadingDecision !== null}
                className="inline-flex items-center px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm rounded-lg shadow-sm transition-colors disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4 mr-2" />
                {loadingDecision === "approved" ? "Approving..." : "Approve Report"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Submission History */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 sm:p-8">
        <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
          <Clock className="w-5 h-5 mr-2 text-slate-500" />
          Submission & Report History ({reports.length})
        </h2>

        {reports.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-sm">
            The employee has not submitted any reports for this task yet.
          </div>
        ) : (
          <div className="space-y-6">
            {reports.map((report, idx) => (
              <div
                key={report.id}
                className={`p-5 rounded-xl border ${
                  idx === reports.length - 1
                    ? "border-slate-300 bg-slate-50/50"
                    : "border-slate-200 bg-white"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200/80">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-200 text-slate-700">
                      Submission #{idx + 1}
                    </span>
                    <span className="text-xs text-slate-500">
                      {formatDateTime(report.submitted_at)}
                    </span>
                  </div>
                  <StatusBadge status={report.review_status} />
                </div>

                {/* Report Text */}
                <div className="pt-4 text-sm text-slate-800 whitespace-pre-wrap">
                  {report.report_text}
                </div>

                {/* Attachment */}
                {report.attachment_url && (
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center">
                    <button
                      onClick={() => getDownloadUrl(report.attachment_url!)}
                      className="inline-flex items-center text-xs font-medium text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      <Paperclip className="w-3.5 h-3.5 mr-1.5" />
                      View Attachment: {report.attachment_url.split("/").pop()}
                      <Download className="w-3.5 h-3.5 ml-2" />
                    </button>
                  </div>
                )}

                {/* Reviewer Comment & Feedback */}
                {report.reviewed_at && (
                  <div className="mt-4 p-3.5 rounded-lg bg-white border border-slate-200">
                    <div className="flex items-center space-x-1.5 text-xs font-semibold text-slate-700 mb-1">
                      <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
                      <span>Manager Review Feedback</span>
                      <span className="text-slate-400 font-normal">
                        ({formatDateTime(report.reviewed_at)})
                      </span>
                    </div>
                    <p className="text-xs text-slate-600">
                      {report.review_comment || "No comment provided."}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
