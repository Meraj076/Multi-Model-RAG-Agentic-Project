import React from "react";
import { cn } from "../../lib/utils";

export const StatCard = ({
  title,
  value,
  icon,
  description = "",
  badge = null,
  variant = "slate",
  onClick = null,
  className = "",
}) => {
  const variantStyles = {
    slate: "from-slate-900 to-slate-950 border-slate-800 text-slate-400",
    blue: "from-blue-950/40 to-slate-950 border-blue-900/50 text-blue-400",
    amber: "from-amber-950/40 to-slate-950 border-amber-900/50 text-amber-400",
    emerald: "from-emerald-950/40 to-slate-950 border-emerald-900/50 text-emerald-400",
    rose: "from-rose-950/40 to-slate-950 border-rose-900/50 text-rose-400",
    purple: "from-purple-950/40 to-slate-950 border-purple-900/50 text-purple-400",
  };

  return (
    <div
      onClick={onClick}
      className={cn(
        "relative overflow-hidden rounded-xl border bg-gradient-to-b p-5 backdrop-blur-md shadow-lg transition-all duration-300",
        variantStyles[variant] || variantStyles.slate,
        onClick && "cursor-pointer hover:border-slate-600 hover:-translate-y-0.5",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          {title}
        </span>
        <div className="p-2 rounded-lg bg-slate-900/80 border border-slate-800 shrink-0">
          {icon}
        </div>
      </div>
      <div className="mt-4 flex items-baseline justify-between">
        <p className="text-3xl font-extrabold text-slate-100 font-mono tracking-tight">
          {value}
        </p>
        {badge}
      </div>
      {description && (
        <p className="mt-2 text-xs text-slate-400 line-clamp-1">{description}</p>
      )}
    </div>
  );
};
