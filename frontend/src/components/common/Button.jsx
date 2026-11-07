import React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "../../lib/utils";

export const Button = ({
  children,
  variant = "primary",
  size = "md",
  loading = false,
  icon = null,
  disabled = false,
  className = "",
  ...props
}) => {
  const baseStyles =
    "inline-flex items-center justify-center font-medium transition-all duration-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-950 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none cursor-pointer";

  const sizeStyles = {
    sm: "px-2.5 py-1.5 text-xs gap-1.5",
    md: "px-4 py-2 text-sm gap-2",
    lg: "px-5 py-2.5 text-base gap-2.5",
  };

  const variantStyles = {
    primary:
      "bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg shadow-cyan-950/40 focus:ring-cyan-500 border border-cyan-500/30 hover:border-cyan-400",
    secondary:
      "bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 focus:ring-slate-500",
    outline:
      "bg-transparent hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 hover:border-slate-600 focus:ring-slate-500",
    danger:
      "bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/40 focus:ring-rose-500",
    ghost:
      "bg-transparent hover:bg-slate-800/60 text-slate-400 hover:text-slate-200 focus:ring-slate-600",
  };

  return (
    <button
      disabled={disabled || loading}
      className={cn(baseStyles, sizeStyles[size], variantStyles[variant], className)}
      {...props}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin shrink-0" />
      ) : (
        icon && <span className="shrink-0">{icon}</span>
      )}
      <span>{children}</span>
    </button>
  );
};
