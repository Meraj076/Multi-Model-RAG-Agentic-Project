import React, { useMemo } from "react";
import {
  Sparkles,
  Cpu,
  FileSearch,
  Clock,
  AlertTriangle,
  Info,
  CheckCircle2,
} from "lucide-react";
import { formatDateTime, parseRawAnalysisReport, extractAnalysisDetails } from "../../lib/utils";
import { StatusPill } from "../common/StatusPill";

export const AnalysisSummaryCard = ({
  analysis = null,
  record = null,
}) => {
  const details = useMemo(() => {
    if (record?.rawResponseJson) {
      const { report } = parseRawAnalysisReport(record.rawResponseJson);
      if (report) {
        return extractAnalysisDetails(report);
      }
    }
    return null;
  }, [record]);

  if (!analysis && !record) {
    return (
      <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/40 text-center">
        <Sparkles className="w-8 h-8 text-slate-500 mx-auto mb-2" />
        <h4 className="text-sm font-bold text-slate-300">No Analysis Executed Yet</h4>
        <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
          Trigger analysis above to run OCR text extraction and YOLO electronic component detection.
        </p>
      </div>
    );
  }

  const detectionCount =
    analysis?.detectionCount ??
    record?.detectionCount ??
    details?.totalDetections ??
    null;

  const ocrCount =
    analysis?.ocrCount ??
    record?.ocrCount ??
    details?.totalOcrCount ??
    null;

  const timestamp = analysis?.timestamp ?? record?.analyzedAt ?? null;
  const modelName = record?.modelName || "circuit_yolov8n_preliminary (Python Vision Engine)";
  const status = analysis?.status || "COMPLETED";
  const message = analysis?.message;
  const isMlReachable = analysis?.mlServiceReachable ?? true;

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/50 backdrop-blur-xl p-4 sm:p-6 shadow-xl space-y-4 sm:space-y-5">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-slate-800/80">
        <div className="flex items-center gap-3 min-w-0">
          <div className="p-2 sm:p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 shrink-0">
            <Sparkles className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div className="min-w-0">
            <h4 className="text-sm sm:text-base font-bold text-slate-100 truncate">
              Vision Pipeline Analysis Summary
            </h4>
            <p className="text-xs text-slate-400 truncate">
              Multimodal Agentic Blueprint & Circuit Inference
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 self-start sm:self-center">
          <StatusPill status={status} />
        </div>
      </div>

      {/* Message Notice */}
      {message && (
        <div
          className={`flex items-start gap-2.5 sm:gap-3 p-3 sm:p-3.5 rounded-xl border text-xs leading-relaxed ${
            !isMlReachable
              ? "bg-amber-950/20 border-amber-500/30 text-amber-300"
              : status === "FAILED"
              ? "bg-rose-950/20 border-rose-500/30 text-rose-300"
              : "bg-cyan-950/20 border-cyan-500/30 text-cyan-200"
          }`}
        >
          {!isMlReachable ? (
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          ) : (
            <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
          )}
          <div className="min-w-0">
            <span className="font-semibold">Backend Notice: </span>
            {message}
          </div>
        </div>
      )}

      {/* Metrics Grid (Responsive 2x2 on Mobile/Tablet, 4 across on Desktop) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3 font-mono text-xs">
        {/* Detection Count */}
        <div className="p-3.5 sm:p-4 rounded-xl border border-slate-800 bg-slate-950/60 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] sm:text-[11px] uppercase tracking-wider">Components</span>
            <Cpu className="w-4 h-4 text-cyan-400 shrink-0" />
          </div>
          <div className="mt-2.5 sm:mt-3">
            <p className="text-xl sm:text-2xl font-bold text-slate-100">
              {detectionCount !== null ? detectionCount : "—"}
            </p>
            <p className="text-[10px] text-slate-400 mt-1 font-sans">
              YOLO Detected Units
            </p>
          </div>
        </div>

        {/* OCR Count */}
        <div className="p-3.5 sm:p-4 rounded-xl border border-slate-800 bg-slate-950/60 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] sm:text-[11px] uppercase tracking-wider">OCR Count</span>
            <FileSearch className="w-4 h-4 text-purple-400 shrink-0" />
          </div>
          <div className="mt-2.5 sm:mt-3">
            <p className="text-xl sm:text-2xl font-bold text-slate-100">
              {ocrCount !== null ? ocrCount : "—"}
            </p>
            <p className="text-[10px] text-slate-400 mt-1 font-sans">
              Extracted Text Tokens
            </p>
          </div>
        </div>

        {/* Model Spec */}
        <div className="p-3.5 sm:p-4 rounded-xl border border-slate-800 bg-slate-950/60 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] sm:text-[11px] uppercase tracking-wider">Model</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          </div>
          <div className="mt-2.5 sm:mt-3">
            <p className="text-xs font-bold text-slate-100 truncate" title={modelName}>
              {modelName}
            </p>
            <p className="text-[10px] text-slate-400 mt-1 font-sans">
              Vision Architecture
            </p>
          </div>
        </div>

        {/* Timestamp */}
        <div className="p-3.5 sm:p-4 rounded-xl border border-slate-800 bg-slate-950/60 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] sm:text-[11px] uppercase tracking-wider">Analyzed At</span>
            <Clock className="w-4 h-4 text-amber-400 shrink-0" />
          </div>
          <div className="mt-2.5 sm:mt-3">
            <p className="text-xs font-bold text-slate-100 truncate">
              {formatDateTime(timestamp)}
            </p>
            <p className="text-[10px] text-slate-400 mt-1 font-sans">
              Server Processing Time
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
