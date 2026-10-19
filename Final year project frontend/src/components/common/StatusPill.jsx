import React from "react";
import { Loader2 } from "lucide-react";
import { STATUS_CONFIG } from "../../lib/constants";
import { cn } from "../../lib/utils";

export const StatusPill = ({
  status,
  showIcon = true,
  className = "",
}) => {
  const config = STATUS_CONFIG[status] || {
    label: status,
    badgeBg: "bg-slate-800",
    badgeText: "text-slate-300",
    border: "border-slate-700",
    dotColor: "bg-slate-400",
  };

  const isAnalyzing = status === "ANALYZING";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold tracking-wide border transition-colors",
        config.badgeBg,
        config.badgeText,
        config.border,
        className
      )}
      title={config.label}
    >
      {showIcon && (
        <>
          {isAnalyzing ? (
            <Loader2 className="w-3 h-3 animate-spin text-purple-400 shrink-0" />
          ) : (
            <span className={cn("w-2 h-2 rounded-full shrink-0", config.dotColor)} />
          )}
        </>
      )}
      <span>{config.label}</span>
    </span>
  );
};
