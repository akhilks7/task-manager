import React from "react";
import { LucideIcon, Inbox } from "lucide-react";
import { cn } from "@/lib/utils";
import { SpotlightCard } from "@/components/react-bits/SpotlightCard";

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  title,
  description,
  icon: Icon = Inbox,
  action,
  className,
}: EmptyStateProps) {
  return (
    <SpotlightCard
      spotlightColor="rgba(99, 102, 241, 0.12)"
      className={cn(
        "flex flex-col items-center justify-center text-center p-10 border border-dashed rounded-2xl bg-white/90 border-slate-200/90 shadow-xs",
        className
      )}
    >
      <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-50 to-slate-100 border border-indigo-100/60 flex items-center justify-center text-indigo-600 mb-4 shadow-xs">
        <Icon className="w-7 h-7 stroke-[1.8]" />
      </div>
      <h3 className="text-base font-semibold text-slate-800">{title}</h3>
      {description && (
        <p className="mt-1 text-sm text-slate-500 max-w-sm leading-relaxed">
          {description}
        </p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </SpotlightCard>
  );
}
