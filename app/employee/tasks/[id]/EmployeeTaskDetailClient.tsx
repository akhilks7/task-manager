"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Task, TaskReport } from "@/types/database";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { formatDate, formatDateTime } from "@/lib/utils";
import { startTaskAction, submitReportAction } from "../actions";
import { createClient } from "@/lib/supabase/client";
import {
  ArrowLeft,
  Calendar,
  User,
  PlayCircle,
  Send,
  Paperclip,
  Clock,
  MessageSquare,
  AlertCircle,
  CheckCircle2,
  Download,
  FileCheck2,
  XCircle,
} from "lucide-react";

interface EmployeeTaskDetailClientProps {
  task: Task;
  reports: TaskReport[];
}

export function EmployeeTaskDetailClient({
  task,
  reports,
}: EmployeeTaskDetailClientProps) {
  const router = useRouter();

  // State for Starting Task
  const [isStarting, setIsStarting] = useState(false);
  const [startError, setStartError] = useState<string | null>(null);

  // State for Submitting Report
  const [reportText, setReportText] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);

  const canSubmit = task.status === "in_progress" || task.status === "rejected";
  const latestReport = reports[reports.length - 1];

  const handleStartTask = async () => {
    setIsStarting(true);
    setStartError(null);
    try {
      await startTaskAction(task.id);
      router.refresh();
    } catch (err: any) {
      setStartError(err.message || "Failed to start task");
    } finally {
      setIsStarting(false);
    }
  };

  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportText.trim()) {
      setSubmitError("Please write a report describing your work.");
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(null);

    try {
      let attachmentPath: string | null = null;

      // Upload file to Supabase storage if selected
      if (selectedFile) {
        setUploadProgress("Uploading attachment to secure storage...");
        const supabase = createClient();
        const fileExt = selectedFile.name.split(".").pop();
        const safeName = selectedFile.name.replace(/[^a-zA-Z0-9.-]/g, "_");
        const filePath = `${task.id}/${Date.now()}_${safeName}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("reports")
          .upload(filePath, selectedFile, {
            cacheControl: "3600",
            upsert: false,
          });

        if (uploadError) {
          throw new Error(`Attachment upload failed: ${uploadError.message}`);
        }

        attachmentPath = uploadData.path;
      }

      setUploadProgress("Submitting report to manager...");
      await submitReportAction(task.id, reportText, attachmentPath);

      setSubmitSuccess("Report submitted successfully for manager review!");
      setReportText("");
      setSelectedFile(null);
      setUploadProgress(null);
      router.refresh();
    } catch (err: any) {
      setSubmitError(err.message || "Failed to submit report");
    } finally {
      setIsSubmitting(false);
      setUploadProgress(null);
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
        href="/employee"
        className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-1.5" />
        Back to My Tasks
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
                Delegated by: {task.creator?.full_name}
              </span>
              {task.due_date && (
                <span className="flex items-center text-slate-600">
                  <Calendar className="w-3.5 h-3.5 mr-1 text-slate-400" />
                  Due: {formatDate(task.due_date)}
                </span>
              )}
              <span>Assigned {formatDate(task.created_at)}</span>
            </div>
          </div>

          {/* Action Trigger for "Assigned" state */}
          {task.status === "assigned" && (
            <div className="sm:self-center">
              <button
                onClick={handleStartTask}
                disabled={isStarting}
                className="inline-flex items-center px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm rounded-lg shadow-sm transition-colors disabled:opacity-50"
              >
                <PlayCircle className="w-4 h-4 mr-2" />
                {isStarting ? "Starting..." : "Start Task"}
              </button>
            </div>
          )}
        </div>

        {startError && (
          <div className="mt-4 p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-lg">
            {startError}
          </div>
        )}

        {/* Task Instructions */}
        <div className="pt-6">
          <h3 className="text-xs font-semibold uppercase text-slate-500 tracking-wider mb-2">
            Description & Requirements
          </h3>
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-sm text-slate-800 whitespace-pre-wrap">
            {task.description || (
              <span className="text-slate-400 italic">No description provided.</span>
            )}
          </div>
        </div>
      </div>

      {/* Status Notice if Submitted */}
      {task.status === "submitted" && (
        <div className="p-4 bg-purple-50 border border-purple-200 rounded-xl flex items-center space-x-3 text-purple-900">
          <FileCheck2 className="w-6 h-6 text-purple-600 flex-shrink-0" />
          <div>
            <p className="font-semibold text-sm">
              Your report is under review
            </p>
            <p className="text-xs text-purple-700 mt-0.5">
              Your manager is reviewing your submission. You will see the approved
              status or revision feedback here once reviewed.
            </p>
          </div>
        </div>
      )}

      {/* Status Notice if Approved */}
      {task.status === "approved" && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center space-x-3 text-emerald-900">
          <CheckCircle2 className="w-6 h-6 text-emerald-600 flex-shrink-0" />
          <div>
            <p className="font-semibold text-sm">
              Task Completed & Approved
            </p>
            <p className="text-xs text-emerald-700 mt-0.5">
              Great job! Your submission has been reviewed and accepted by your manager.
            </p>
          </div>
        </div>
      )}

      {/* Status Notice if Rejected */}
      {task.status === "rejected" && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-start space-x-3 text-rose-900">
          <XCircle className="w-6 h-6 text-rose-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold text-sm">
              Revision Requested by Manager
            </p>
            <p className="text-xs text-rose-700 mt-0.5">
              Please review your manager's feedback below and submit an updated
              report when ready.
            </p>
            {latestReport?.review_comment && (
              <div className="mt-2.5 p-3 bg-white/80 rounded-lg border border-rose-200 text-xs font-medium text-rose-900">
                "{latestReport.review_comment}"
              </div>
            )}
          </div>
        </div>
      )}

      {/* Report Submission Form (Visible when in_progress or rejected) */}
      {canSubmit && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 sm:p-8">
          <div className="flex items-center space-x-2 pb-4 mb-4 border-b border-slate-100">
            <Send className="w-5 h-5 text-indigo-600" />
            <h2 className="text-lg font-bold text-slate-900">
              {task.status === "rejected" ? "Revise & Resubmit Report" : "Submit Work Report"}
            </h2>
          </div>

          {submitError && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-800 text-sm rounded-lg flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0" />
              <span>{submitError}</span>
            </div>
          )}

          {submitSuccess && (
            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm rounded-lg flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>{submitSuccess}</span>
            </div>
          )}

          <form onSubmit={handleSubmitReport} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Written Report / Summary of Work <span className="text-rose-500">*</span>
              </label>
              <textarea
                required
                rows={5}
                value={reportText}
                onChange={(e) => setReportText(e.target.value)}
                placeholder="Explain the work completed, findings, methodology, and any relevant outcomes..."
                className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Optional Attachment / Deliverable File
              </label>
              <div className="flex items-center space-x-3">
                <input
                  type="file"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setSelectedFile(e.target.files[0]);
                    }
                  }}
                  className="text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                />
                {selectedFile && (
                  <span className="text-xs text-slate-600">
                    ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Upload PDFs, spreadsheets, documents, or screenshots up to 50MB.
              </p>
            </div>

            {uploadProgress && (
              <p className="text-xs text-indigo-600 animate-pulse font-medium">
                {uploadProgress}
              </p>
            )}

            <div className="flex justify-end pt-4 border-t border-slate-100">
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm rounded-lg shadow-sm transition-colors disabled:opacity-50"
              >
                <Send className="w-4 h-4 mr-2" />
                {isSubmitting
                  ? "Submitting Report..."
                  : task.status === "rejected"
                  ? "Resubmit Report"
                  : "Submit Report"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Submission History */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 sm:p-8">
        <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
          <Clock className="w-5 h-5 mr-2 text-slate-500" />
          Submission History ({reports.length})
        </h2>

        {reports.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-sm">
            No submissions recorded yet. Once you submit a report, it will be logged here.
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

                <div className="pt-4 text-sm text-slate-800 whitespace-pre-wrap">
                  {report.report_text}
                </div>

                {report.attachment_url && (
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center">
                    <button
                      onClick={() => getDownloadUrl(report.attachment_url!)}
                      className="inline-flex items-center text-xs font-medium text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      <Paperclip className="w-3.5 h-3.5 mr-1.5" />
                      Attachment: {report.attachment_url.split("/").pop()}
                      <Download className="w-3.5 h-3.5 ml-2" />
                    </button>
                  </div>
                )}

                {report.reviewed_at && (
                  <div className="mt-4 p-3.5 rounded-lg bg-white border border-slate-200">
                    <div className="flex items-center space-x-1.5 text-xs font-semibold text-slate-700 mb-1">
                      <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
                      <span>Manager Feedback</span>
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
