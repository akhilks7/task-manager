import React from "react";
import { cn } from "@/lib/utils";

interface ShinyTextProps {
  text: string;
  disabled?: boolean;
  speed?: number;
  className?: string;
}

export function ShinyText({
  text,
  disabled = false,
  speed = 5,
  className = "",
}: ShinyTextProps) {
  const animationDuration = `${speed}s`;

  return (
    <span
      className={cn(
        "inline-block bg-clip-text text-transparent bg-gradient-to-r from-slate-900 via-indigo-600 to-slate-900 bg-[length:200%_100%]",
        !disabled && "animate-shine",
        className
      )}
      style={{
        animationDuration,
      }}
    >
      {text}
    </span>
  );
}
