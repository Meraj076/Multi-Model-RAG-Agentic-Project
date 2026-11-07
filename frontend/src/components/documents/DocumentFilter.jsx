import React from "react";
import { Search, Filter, ArrowUpDown } from "lucide-react";

export const DocumentFilter = ({
  filterOptions,
  onFilterChange,
  totalCount,
  filteredCount,
}) => {
  const statusOptions = [
    { value: "ALL", label: "All Statuses" },
    { value: "UPLOADED", label: "Uploaded" },
    { value: "PENDING_ANALYSIS", label: "Pending" },
    { value: "ANALYZING", label: "Analyzing" },
    { value: "COMPLETED", label: "Completed" },
    { value: "FAILED", label: "Failed" },
  ];

  return (
    <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-4 rounded-xl border border-slate-800 bg-slate-900/50 backdrop-blur-md">
      {/* Search Bar */}
      <div className="relative flex-1 min-w-[240px]">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={filterOptions.searchQuery}
          onChange={(e) => onFilterChange({ searchQuery: e.target.value })}
          placeholder="Search by blueprint filename or UUID..."
          className="w-full pl-10 pr-4 py-2 rounded-lg bg-slate-950/80 border border-slate-700/80 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
        />
        {filterOptions.searchQuery && (
          <button
            onClick={() => onFilterChange({ searchQuery: "" })}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
          >
            Clear
          </button>
        )}
      </div>

      {/* Filter and Sort Controls */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Status Filter */}
        <div className="flex items-center gap-1.5 bg-slate-950/80 border border-slate-700/80 rounded-lg px-2.5 py-1.5">
          <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <select
            value={filterOptions.statusFilter}
            onChange={(e) =>
              onFilterChange({ statusFilter: e.target.value })
            }
            className="bg-transparent text-xs text-slate-200 focus:outline-none cursor-pointer"
          >
            {statusOptions.map((opt) => (
              <option key={opt.value} value={opt.value} className="bg-slate-900 text-slate-200">
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Sort By Field */}
        <div className="flex items-center gap-1.5 bg-slate-950/80 border border-slate-700/80 rounded-lg px-2.5 py-1.5">
          <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <select
            value={filterOptions.sortBy}
            onChange={(e) =>
              onFilterChange({
                sortBy: e.target.value,
              })
            }
            className="bg-transparent text-xs text-slate-200 focus:outline-none cursor-pointer"
          >
            <option value="createdAt" className="bg-slate-900 text-slate-200">
              Upload Date
            </option>
            <option value="originalFilename" className="bg-slate-900 text-slate-200">
              Filename
            </option>
            <option value="fileSizeBytes" className="bg-slate-900 text-slate-200">
              File Size
            </option>
          </select>

          {/* Toggle Sort Order */}
          <button
            type="button"
            onClick={() =>
              onFilterChange({
                sortOrder: filterOptions.sortOrder === "asc" ? "desc" : "asc",
              })
            }
            className="text-[11px] font-mono font-bold text-cyan-400 hover:text-cyan-300 px-1"
            title={`Sort order: ${filterOptions.sortOrder === "asc" ? "Ascending" : "Descending"}`}
          >
            {filterOptions.sortOrder.toUpperCase()}
          </button>
        </div>

        {/* Results Counter */}
        <div className="text-xs text-slate-400 px-2 py-1 font-mono">
          Showing <span className="text-slate-100 font-semibold">{filteredCount}</span> of {totalCount}
        </div>
      </div>
    </div>
  );
};
