import React from "react";
import { cn } from "../../lib/utils";

export const Skeleton = ({ className = "" }) => {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-slate-800/60 border border-slate-700/20",
        className
      )}
    />
  );
};

export const TableSkeleton = ({ rows = 5 }) => {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="flex items-center justify-between p-4 rounded-xl border border-slate-800 bg-slate-900/40"
        >
          <div className="flex items-center gap-3 w-1/3">
            <Skeleton className="w-8 h-8 rounded-lg" />
            <div className="space-y-1.5 flex-1">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-6 w-24 rounded-full" />
          <Skeleton className="h-8 w-28 rounded-lg" />
        </div>
      ))}
    </div>
  );
};
