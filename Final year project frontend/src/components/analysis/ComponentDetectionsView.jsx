import React, { useMemo } from "react";
import {
  Cpu,
  Layers,
  FileText,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { KNOWN_COMPONENT_CLASSES } from "../../lib/constants";
import { Badge } from "../common/Badge";

export const ComponentDetectionsView = ({
  parsedReport = null,
  directDetections = null,
  directOcrText = null,
}) => {
  const pages = parsedReport?.pages || [];

  const allComponents = useMemo(() => {
    if (directDetections && directDetections.length > 0) {
      return directDetections;
    }
    const comps = [];
    pages.forEach((page) => {
      if (page.components && Array.isArray(page.components)) {
        comps.push(...page.components);
      }
    });
    return comps;
  }, [directDetections, pages]);

  const allOcrTexts = useMemo(() => {
    if (directOcrText) {
      return [{ page: 1, text: directOcrText }];
    }
    const texts = [];
    pages.forEach((page) => {
      if (page.extracted_text && page.extracted_text.trim() !== "") {
        texts.push({ page: page.page_number || 1, text: page.extracted_text });
      }
    });
    return texts;
  }, [directOcrText, pages]);

  const hasDetailedDetections = allComponents.length > 0;
  const hasOcrText = allOcrTexts.length > 0;

  return (
    <div className="space-y-6">
      {/* 14 Known Model Component Reference Palette */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4 backdrop-blur-md">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-cyan-400" />
            <h5 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              Trained Model Label Taxonomy (14 Configured Classes)
            </h5>
          </div>
          <span className="text-[11px] font-mono text-slate-400">
            YOLOv8 Architecture Classes
          </span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {KNOWN_COMPONENT_CLASSES.map((classNameStr, idx) => {
            const isDetected = allComponents.some(
              (c) => c.class_name && c.class_name.toLowerCase() === classNameStr.toLowerCase()
            );

            return (
              <span
                key={classNameStr}
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-mono border transition-colors ${
                  isDetected
                    ? "bg-cyan-500/15 border-cyan-500/40 text-cyan-300 font-semibold"
                    : "bg-slate-950/40 border-slate-800/80 text-slate-400"
                }`}
              >
                <span className="text-[10px] text-slate-400">{idx + 1}.</span>
                <span>{classNameStr}</span>
                {isDetected && <CheckCircle className="w-3 h-3 text-cyan-400 ml-0.5" />}
              </span>
            );
          })}
        </div>
      </div>

      {/* Extracted Component Detections */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 backdrop-blur-md space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Cpu className="w-5 h-5 text-cyan-400" />
            <h4 className="text-sm font-bold text-slate-100">
              Electronic Component Detections
            </h4>
          </div>
          {hasDetailedDetections && (
            <Badge variant="info">
              {allComponents.length} {allComponents.length === 1 ? "Item" : "Items"}
            </Badge>
          )}
        </div>

        {hasDetailedDetections ? (
          <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/60">
            <table className="w-full text-left text-xs font-mono text-slate-300">
              <thead className="bg-slate-900/80 text-slate-400 uppercase text-[11px] border-b border-slate-800 tracking-wider font-sans">
                <tr>
                  <th className="px-4 py-2.5">#</th>
                  <th className="px-4 py-2.5">Class Name</th>
                  <th className="px-4 py-2.5">Class ID</th>
                  <th className="px-4 py-2.5">Confidence Score</th>
                  <th className="px-4 py-2.5">Bounding Box [X1, Y1, X2, Y2]</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {allComponents.map((comp, idx) => {
                  const confPercent = (comp.confidence * 100).toFixed(1);
                  const isHighConf = comp.confidence >= 0.7;
                  const isMedConf = comp.confidence >= 0.4 && comp.confidence < 0.7;

                  return (
                    <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                      <td className="px-4 py-2.5 text-slate-400">{idx + 1}</td>
                      <td className="px-4 py-2.5 font-sans font-semibold text-slate-100">
                        {comp.class_name}
                      </td>
                      <td className="px-4 py-2.5 text-slate-400">{comp.class_id}</td>
                      <td className="px-4 py-2.5">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded font-bold ${
                            isHighConf
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                              : isMedConf
                              ? "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                              : "bg-slate-800 text-slate-400"
                          }`}
                        >
                          {confPercent}%
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-slate-400">
                        {Array.isArray(comp.bbox_xyxy) ? (
                          <span>
                            [{comp.bbox_xyxy.map((n) => Math.round(n)).join(", ")}]
                          </span>
                        ) : (
                          "N/A"
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-6 rounded-xl border border-dashed border-slate-800 bg-slate-950/40 text-center space-y-2">
            <AlertCircle className="w-7 h-7 text-slate-400 mx-auto" />
            <h5 className="text-xs font-semibold text-slate-300">
              Detailed Component Coordinates Not Available Through Current API
            </h5>
            <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
              The Java backend currently stores summary counts (detectionCount).
              Individual component bounding boxes and confidence scores are rendered whenever
              detailed Python report payloads are preserved in rawResponseJson.
            </p>
          </div>
        )}
      </div>

      {/* Extracted OCR Text */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 backdrop-blur-md space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <FileText className="w-5 h-5 text-purple-400" />
            <h4 className="text-sm font-bold text-slate-100">
              Extracted OCR Blueprint Text
            </h4>
          </div>
          {hasOcrText && (
            <Badge variant="purple">
              {allOcrTexts.length} {allOcrTexts.length === 1 ? "Section" : "Sections"}
            </Badge>
          )}
        </div>

        {hasOcrText ? (
          <div className="space-y-3">
            {allOcrTexts.map((item, idx) => (
              <div
                key={idx}
                className="rounded-xl border border-slate-800 bg-slate-950/70 p-4 font-mono text-xs space-y-2"
              >
                <div className="flex items-center justify-between text-slate-400 border-b border-slate-800/60 pb-2">
                  <span className="font-semibold text-purple-400">Page {item.page}</span>
                  <span className="text-[11px]">Tesseract OCR Engine</span>
                </div>
                <div className="text-slate-200 whitespace-pre-wrap leading-relaxed select-text">
                  {item.text}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 rounded-xl border border-dashed border-slate-800 bg-slate-950/40 text-center space-y-2">
            <FileText className="w-7 h-7 text-slate-400 mx-auto" />
            <h5 className="text-xs font-semibold text-slate-300">
              OCR Text Content Not Exposed by Current Endpoint
            </h5>
            <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
              The backend returns ocrCount representing extracted tokens. Full textual transcripts
              are displayed dynamically when returned by the pipeline in raw response records.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
