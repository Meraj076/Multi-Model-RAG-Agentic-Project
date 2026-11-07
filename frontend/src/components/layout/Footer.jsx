import React from "react";
import { Cpu, Server, Database, ShieldCheck } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="w-full border-t border-slate-900 bg-slate-950/60 py-8 mt-16 text-slate-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-300">
              Multimodal Agentic RAG for Complex Blueprint & Circuit Analysis
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-slate-400">
            <span className="flex items-center gap-1.5">
              <Server className="w-3.5 h-3.5 text-cyan-400" />
              Java Spring Boot (Orchestrator)
            </span>
            <span className="text-slate-700">•</span>
            <span className="flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-purple-400" />
              Python FastAPI (OCR + YOLO)
            </span>
            <span className="text-slate-700">•</span>
            <span className="flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-blue-400" />
              H2 / SQLite Document Store
            </span>
            <span className="text-slate-700">•</span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Strict Contract Integrity
            </span>
          </div>

          <div className="text-slate-400">
            Final Year Project • Production Dashboard
          </div>
        </div>
      </div>
    </footer>
  );
};
