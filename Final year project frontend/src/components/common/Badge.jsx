import React from "react";
import { cn } from "../../lib/utils";

export const Badge = ({
  children,
  variant = "default",
  className = "",
  size = "md",
}) => {
  const variantStyles = {
    default: "bg-slate-800 text-slate-300 border-slate-700",
    success: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
    warning: "bg-amber-500/10 text-amber-400 border-amber-500/30",
    danger: "bg-rose-500/10 text-rose-400 border-rose-500/30",
    info: "bg-sky-500/10 text-sky-400 border-sky-500/30",
    purple: "bg-purple-500/10 text-purple-400 border-purple-500/30",
  };

  const sizeStyles = {
    sm: "px-2 py-0.5 text-xs font-medium",
    md: "px-2.5 py-1 text-xs font-semibold",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border font-mono tracking-tight",
        variantStyles[variant] || variantStyles.default,
        sizeStyles[size] || sizeStyles.md,
        className
      )}
    >
      {children}
    </span>
  );
};
