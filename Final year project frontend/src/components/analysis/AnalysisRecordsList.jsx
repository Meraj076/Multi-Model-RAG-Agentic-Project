import React from "react";
import { History, Cpu, FileSearch, Calendar, Code } from "lucide-react";
import { formatDateTime, parseRawAnalysisReport } from "../../lib/utils";
import { JsonViewer } from "../common/JsonViewer";
import { Badge } from "../common/Badge";

export const AnalysisRecordsList = ({
  records = [],
  className = "",
}) => {
  if (records.length === 0) {
    return (
      <div className="rounded-xl border border-slate-800 bg-slate-900/30 p-8 text-center">
        <History className="w-8 h-8 text-slate-500 mx-auto mb-2" />
        <h5 className="text-xs font-bold text-slate-300">No Previous Analysis Records</h5>
        <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
          Past execution logs and pipeline results for this blueprint will appear here once analyzed.
        </p>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-cyan-400" />
          <h4 className="text-sm font-bold text-slate-200">Analysis Execution History</h4>
        </div>
        <Badge variant="default">{records.length} {records.length === 1 ? "Record" : "Records"}</Badge>
      </div>

      <div className="space-y-3">
        {records.map((rec) => {
          const { isParsed, report, error } = parseRawAnalysisReport(rec.rawResponseJson);

          return (
            <div
              key={rec.id}
              className="rounded-xl border border-slate-800 bg-slate-900/50 p-4.5 backdrop-blur-md space-y-3 font-mono text-xs"
            >
              {/* Top row */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/60 pb-3">
                <div className="flex items-center gap-2">
                  <span className="font-sans font-bold text-slate-100">{rec.modelName || "Standard Model"}</span>
                  <span className="text-[11px] text-slate-400">ID: {rec.id}</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-400 text-[11px] font-sans">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>{formatDateTime(rec.analyzedAt)}</span>
                </div>
              </div>

              {/* Counts */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-950/60 border border-slate-800">
                  <Cpu className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span className="text-slate-400">Detections:</span>
                  <span className="font-bold text-slate-100">{rec.detectionCount}</span>
                </div>

                <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-950/60 border border-slate-800">
                  <FileSearch className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                  <span className="text-slate-400">OCR Tokens:</span>
                  <span className="font-bold text-slate-100">{rec.ocrCount}</span>
                </div>

                <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-950/60 border border-slate-800 col-span-2 sm:col-span-1">
                  <Code className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span className="text-slate-400">Raw Payload:</span>
                  <span className="text-slate-300">
                    {rec.rawResponseJson ? `${rec.rawResponseJson.length} bytes` : "None"}
                  </span>
                </div>
              </div>

              {/* Raw JSON viewer */}
              {rec.rawResponseJson && (
                <div className="pt-1">
                  <JsonViewer
                    data={isParsed ? report : rec.rawResponseJson}
                    title={
                      isParsed
                        ? `Parsed Payload (${report?.pages?.length || 0} Pages Analyzed)`
                        : error
                        ? `Raw Response (Non-JSON or Truncated)`
                        : "Raw Response JSON"
                    }
                    defaultExpanded={false}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
