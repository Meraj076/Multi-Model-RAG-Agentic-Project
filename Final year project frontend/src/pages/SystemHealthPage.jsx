import React from "react";
import {
  Activity,
  Server,
  Cpu,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";
import { useHealth } from "../hooks/useHealth";
import { Button } from "../components/common/Button";
import { formatDateTime } from "../lib/utils";
import { API_BASE_URL } from "../lib/constants";

export const SystemHealthPage = () => {
  const { health, loading, isJavaOnline, isMlOnline, refetch } = useHealth(0);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-900">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-100 tracking-tight">
              System Health & Architecture Diagnostics
            </h1>
            <p className="text-xs text-slate-400">
              Real-time connectivity monitoring between Frontend, Java Orchestrator, and Python ML
            </p>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          loading={loading}
          icon={<RefreshCw className="w-3.5 h-3.5" />}
        >
          Re-check Health
        </Button>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Java Spring Boot Service Card */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 backdrop-blur-xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
                <Server className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-100">Java Spring Boot Backend</h3>
                <p className="text-xs text-slate-400">REST API & Workflow Orchestrator</p>
              </div>
            </div>

            <span
              className={`px-2.5 py-1 rounded-full text-xs font-mono font-bold border flex items-center gap-1.5 ${
                isJavaOnline
                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                  : "bg-rose-500/10 text-rose-400 border-rose-500/30"
              }`}
            >
              {isJavaOnline ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" /> UP
                </>
              ) : (
                <>
                  <XCircle className="w-3.5 h-3.5" /> UNREACHABLE
                </>
              )}
            </span>
          </div>

          <div className="space-y-2.5 text-xs font-mono">
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
              <span className="text-slate-400">Endpoint URL:</span>
              <span className="text-cyan-400 font-semibold">{API_BASE_URL}</span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
              <span className="text-slate-400">Application Name:</span>
              <span className="text-slate-200">
                {health?.applicationName || (isJavaOnline ? "blueprint-analysis-service" : "—")}
              </span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
              <span className="text-slate-400">Java Runtime Version:</span>
              <span className="text-slate-200">{health?.javaVersion || "—"}</span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
              <span className="text-slate-400">Storage Root:</span>
              <span className="text-slate-200">{health?.storageDirectory || "—"}</span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
              <span className="text-slate-400">Reported Timestamp:</span>
              <span className="text-slate-200">{formatDateTime(health?.timestamp)}</span>
            </div>
          </div>
        </div>

        {/* Python FastAPI Service Card */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 backdrop-blur-xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
                <Cpu className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-100">Python AI Vision Engine</h3>
                <p className="text-xs text-slate-400">FastAPI • PyMuPDF • OCR • YOLOv8</p>
              </div>
            </div>

            <span
              className={`px-2.5 py-1 rounded-full text-xs font-mono font-bold border flex items-center gap-1.5 ${
                !isJavaOnline
                  ? "bg-slate-800 text-slate-400 border-slate-700"
                  : isMlOnline
                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                  : "bg-amber-500/10 text-amber-400 border-amber-500/30"
              }`}
            >
              {!isJavaOnline ? (
                "UNKNOWN"
              ) : isMlOnline ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" /> REACHABLE
                </>
              ) : (
                <>
                  <AlertTriangle className="w-3.5 h-3.5" /> OFFLINE
                </>
              )}
            </span>
          </div>

          <div className="space-y-2.5 text-xs font-mono">
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
              <span className="text-slate-400">Configured ML Target:</span>
              <span className="text-purple-400 font-semibold">
                {health?.mlServiceUrl || "http://localhost:8000"}
              </span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
              <span className="text-slate-400">Java Connectivity Check:</span>
              <span
                className={`font-semibold ${
                  health?.mlServiceReachable ? "text-emerald-400" : "text-amber-400"
                }`}
              >
                {health?.mlServiceReachable ? "Reachable by Java" : "Not Reachable"}
              </span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
              <span className="text-slate-400">OCR Framework:</span>
              <span className="text-slate-200">Tesseract OCR (pytesseract)</span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
              <span className="text-slate-400">Vision Detector:</span>
              <span className="text-slate-200">Ultralytics YOLOv8 (14 Classes)</span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
              <span className="text-slate-400">PDF Rasterizer:</span>
              <span className="text-slate-200">PyMuPDF / pdf2image (150 DPI)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Architecture Information Banner */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 space-y-4">
        <h4 className="text-sm font-bold text-slate-200">
          Strict Architectural Guarantee & Contract Separation
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs leading-relaxed text-slate-300">
          <div className="p-4 rounded-xl border border-slate-800/80 bg-slate-950/40 space-y-2">
            <span className="font-semibold text-cyan-400">1. Browser-to-Java Only</span>
            <p className="text-slate-400">
              The frontend communicates solely with Java Spring Boot. No direct requests are sent to Python, ensuring security and centralized access control.
            </p>
          </div>
          <div className="p-4 rounded-xl border border-slate-800/80 bg-slate-950/40 space-y-2">
            <span className="font-semibold text-purple-400">2. Real ML Reporting</span>
            <p className="text-slate-400">
              Detections, confidence scores, and OCR text are rendered only when returned by the backend. When ML is offline, documents are queued in PENDING_ANALYSIS.
            </p>
          </div>
          <div className="p-4 rounded-xl border border-slate-800/80 bg-slate-950/40 space-y-2">
            <span className="font-semibold text-emerald-400">3. Binary Integrity</span>
            <p className="text-slate-400">
              Uploads and downloads operate via raw byte streams with checksum preservation and multipart boundary management.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
