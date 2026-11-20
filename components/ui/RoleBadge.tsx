import React from "react";
import { UserRole } from "@/types/database";
import { cn } from "@/lib/utils";

interface RoleBadgeProps {
  role: UserRole;
  className?: string;
}

export function RoleBadge({ role, className }: RoleBadgeProps) {
  const configs: Record<UserRole, { label: string; bg: string; text: string; border: string }> = {
    admin: {
      label: "Admin",
      bg: "bg-indigo-50",
      text: "text-indigo-700",
      border: "border-indigo-200",
    },
    manager: {
      label: "Manager",
      bg: "bg-teal-50",
      text: "text-teal-700",
      border: "border-teal-200",
    },
    employee: {
      label: "Employee",
      bg: "bg-sky-50",
      text: "text-sky-700",
      border: "border-sky-200",
    },
  };

  const config = configs[role] || {
    label: role,
    bg: "bg-gray-50",
    text: "text-gray-700",
    border: "border-gray-200",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold tracking-wide uppercase border",
        config.bg,
        config.text,
        config.border,
        className
      )}
    >
      {config.label}
    </span>
  );
}
