import React from "react";
import { TaskStatus, ReviewStatus } from "@/types/database";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: TaskStatus | ReviewStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const configs: Record<
    string,
    { label: string; bg: string; text: string; border: string }
  > = {
    assigned: {
      label: "Assigned",
      bg: "bg-blue-50",
      text: "text-blue-700",
      border: "border-blue-200",
    },
    in_progress: {
      label: "In Progress",
      bg: "bg-amber-50",
      text: "text-amber-700",
      border: "border-amber-200",
    },
    submitted: {
      label: "Submitted",
      bg: "bg-purple-50",
      text: "text-purple-700",
      border: "border-purple-200",
    },
    pending: {
      label: "Awaiting Review",
      bg: "bg-purple-50",
      text: "text-purple-700",
      border: "border-purple-200",
    },
    approved: {
      label: "Approved",
      bg: "bg-emerald-50",
      text: "text-emerald-700",
      border: "border-emerald-200",
    },
    rejected: {
      label: "Rejected",
      bg: "bg-rose-50",
      text: "text-rose-700",
      border: "border-rose-200",
    },
  };

  const config = configs[status] || {
    label: status,
    bg: "bg-slate-50",
    text: "text-slate-700",
    border: "border-slate-200",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
        config.bg,
        config.text,
        config.border,
        className
      )}
    >
      <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-current opacity-70" />
      {config.label}
    </span>
  );
}
