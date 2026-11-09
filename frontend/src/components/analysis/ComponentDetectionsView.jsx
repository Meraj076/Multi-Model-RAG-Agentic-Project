import React, { useMemo, useState } from "react";
import {
  Cpu,
  Layers,
  FileText,
  AlertCircle,
  CheckCircle,
  Copy,
  Check,
  Tag,
  Maximize2,
} from "lucide-react";
import { KNOWN_COMPONENT_CLASSES } from "../../lib/constants";
import { Badge } from "../common/Badge";
import { extractAnalysisDetails } from "../../lib/utils";

export const ComponentDetectionsView = ({
  parsedReport = null,
  directDetections = null,
  directOcrText = null,
  detectionCount = null,
  ocrCount = null,
}) => {
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [allCopied, setAllCopied] = useState(false);

  // Extract all details using universal extractor
  const analysisData = useMemo(() => {
    return extractAnalysisDetails(parsedReport);
  }, [parsedReport]);

  const allComponents = useMemo(() => {
    if (directDetections && Array.isArray(directDetections) && directDetections.length > 0) {
      return directDetections;
    }
    return analysisData.components;
  }, [directDetections, analysisData]);

  const allOcrTexts = useMemo(() => {
    if (directOcrText) {
      return [{ page: 1, text: directOcrText }];
    }
    return analysisData.ocrTexts;
  }, [directOcrText, analysisData]);

  const hasDetailedDetections = allComponents.length > 0;
  const hasOcrText = allOcrTexts.length > 0;

  const handleCopyText = (text, idx) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleCopyAllOcr = () => {
    const fullText = allOcrTexts.map((item) => item.text).join("\n\n");
    if (!fullText) return;
    navigator.clipboard.writeText(fullText);
    setAllCopied(true);
    setTimeout(() => setAllCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* 14 Known Model Component Reference Palette */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4 sm:p-5 backdrop-blur-md space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-2.5">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-cyan-400 shrink-0" />
            <h5 className="text-xs sm:text-sm font-bold text-slate-200 uppercase tracking-wider">
              Trained Model Label Taxonomy (14 Configured Classes)
            </h5>
          </div>
          <span className="text-[11px] font-mono text-slate-400">
            YOLOv8 Vision Architecture
          </span>
        </div>

        <div className="flex flex-wrap gap-1.5 sm:gap-2">
          {KNOWN_COMPONENT_CLASSES.map((classNameStr, idx) => {
            const matches = allComponents.filter(
              (c) => c.class_name && c.class_name.toLowerCase() === classNameStr.toLowerCase()
            );
            const isDetected = matches.length > 0;

            return (
              <span
                key={classNameStr}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono border transition-all ${
                  isDetected
                    ? "bg-cyan-500/15 border-cyan-400/50 text-cyan-300 font-semibold shadow-[0_0_12px_rgba(6,182,212,0.15)]"
                    : "bg-slate-950/40 border-slate-800/80 text-slate-400 hover:border-slate-700"
                }`}
              >
                <span className="text-[10px] text-slate-400">{idx + 1}.</span>
                <span>{classNameStr}</span>
                {isDetected && (
                  <span className="inline-flex items-center gap-0.5 ml-0.5 text-cyan-400 font-bold text-[11px]">
                    <CheckCircle className="w-3.5 h-3.5" />
                    {matches.length > 1 && <span>×{matches.length}</span>}
                  </span>
                )}
              </span>
            );
          })}
        </div>
      </div>

      {/* Extracted Component Detections */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4 sm:p-6 backdrop-blur-md space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Cpu className="w-5 h-5 text-cyan-400 shrink-0" />
            <div>
              <h4 className="text-sm sm:text-base font-bold text-slate-100">
                Electronic Component Detections
              </h4>
              <p className="text-xs text-slate-400 hidden sm:block">
                YOLOv8 detected discrete components and bounding coordinates
              </p>
            </div>
          </div>
          {hasDetailedDetections ? (
            <Badge variant="info">
              {allComponents.length} {allComponents.length === 1 ? "Component" : "Components"} Found
            </Badge>
          ) : detectionCount && detectionCount > 0 ? (
            <Badge variant="info">{detectionCount} Units Counted</Badge>
          ) : null}
        </div>

        {hasDetailedDetections ? (
          <>
            {/* Desktop / Tablet Table View (hidden on small mobile) */}
            <div className="hidden sm:block overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/60 shadow-inner">
              <table className="w-full text-left text-xs font-mono text-slate-300">
                <thead className="bg-slate-900/80 text-slate-400 uppercase text-[11px] border-b border-slate-800 tracking-wider font-sans">
                  <tr>
                    <th className="px-4 py-3">#</th>
                    <th className="px-4 py-3">Class Name</th>
                    <th className="px-4 py-3">Class ID</th>
                    <th className="px-4 py-3">Confidence Score</th>
                    <th className="px-4 py-3">Bounding Box [X1, Y1, X2, Y2]</th>
                    {analysisData.isMultiPage && <th className="px-4 py-3">Page</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {allComponents.map((comp, idx) => {
                    const confPercent = (comp.confidence * 100).toFixed(1);
                    const isHighConf = comp.confidence >= 0.7;
                    const isMedConf = comp.confidence >= 0.4 && comp.confidence < 0.7;

                    return (
                      <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                        <td className="px-4 py-2.5 text-slate-400 font-sans">{idx + 1}</td>
                        <td className="px-4 py-2.5 font-sans font-semibold text-slate-100 flex items-center gap-1.5">
                          <Tag className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                          <span>{comp.class_name}</span>
                        </td>
                        <td className="px-4 py-2.5 text-slate-400">{comp.class_id ?? "—"}</td>
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
                        <td className="px-4 py-2.5 text-slate-400 font-mono">
                          {Array.isArray(comp.bbox_xyxy) && comp.bbox_xyxy.length === 4 ? (
                            <span className="text-cyan-300/90">
                              [{comp.bbox_xyxy.map((n) => Math.round(n)).join(", ")}]
                            </span>
                          ) : (
                            <span className="text-slate-400 italic">Not coordinate indexed</span>
                          )}
                        </td>
                        {analysisData.isMultiPage && (
                          <td className="px-4 py-2.5 text-slate-400">Page {comp.page || 1}</td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards View (sm:hidden) */}
            <div className="grid grid-cols-1 gap-2.5 sm:hidden">
              {allComponents.map((comp, idx) => {
                const confPercent = (comp.confidence * 100).toFixed(1);
                const isHighConf = comp.confidence >= 0.7;
                return (
                  <div
                    key={idx}
                    className="p-3 rounded-xl border border-slate-800 bg-slate-950/70 space-y-2 text-xs font-mono"
                  >
                    <div className="flex items-center justify-between border-b border-slate-800/60 pb-1.5">
                      <div className="flex items-center gap-1.5 font-sans font-bold text-slate-100">
                        <span className="text-slate-400">#{idx + 1}</span>
                        <Tag className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                        <span>{comp.class_name}</span>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                          isHighConf
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                            : "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                        }`}
                      >
                        {confPercent}%
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400 pt-1">
                      <div>
                        <span className="text-slate-400">Class ID: </span>
                        <span className="text-slate-300 font-semibold">{comp.class_id ?? "—"}</span>
                      </div>
                      <div>
                        <span className="text-slate-400">Sheet: </span>
                        <span className="text-slate-300">Page {comp.page || 1}</span>
                      </div>
                      <div className="col-span-2">
                        <span className="text-slate-400">BBox: </span>
                        <span className="text-cyan-300 font-mono">
                          {Array.isArray(comp.bbox_xyxy)
                            ? `[${comp.bbox_xyxy.map((n) => Math.round(n)).join(", ")}]`
                            : "N/A"}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <div className="p-6 rounded-xl border border-dashed border-slate-800 bg-slate-950/40 text-center space-y-2">
            <AlertCircle className="w-7 h-7 text-slate-400 mx-auto" />
            <h5 className="text-xs font-semibold text-slate-300">
              {detectionCount && detectionCount > 0
                ? `${detectionCount} Components Detected by Model (Coordinates in Summary)`
                : "No Electronic Components Detected in this Schematic"}
            </h5>
            <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
              {detectionCount && detectionCount > 0
                ? "The connected vision model registered electronic detections. When individual bounding boxes are streamed in rawResponseJson, detailed coordinate metrics render here."
                : "Verify the uploaded blueprint contains recognized electronic components such as resistors, capacitors, ICs, or diodes, then re-trigger analysis."}
            </p>
          </div>
        )}
      </div>

      {/* Extracted OCR Text */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4 sm:p-6 backdrop-blur-md space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <FileText className="w-5 h-5 text-purple-400 shrink-0" />
            <div>
              <h4 className="text-sm sm:text-base font-bold text-slate-100">
                Extracted OCR Blueprint Text
              </h4>
              <p className="text-xs text-slate-400 hidden sm:block">
                Tesseract OCR textual transcript and technical design annotations
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-center">
            {hasOcrText && (
              <>
                <Badge variant="purple">
                  {allOcrTexts.length} {allOcrTexts.length === 1 ? "Section" : "Sections"}
                </Badge>
                <button
                  onClick={handleCopyAllOcr}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
                  title="Copy full extracted OCR text"
                >
                  {allCopied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400 font-semibold">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-slate-400" />
                      <span>Copy Full OCR</span>
                    </>
                  )}
                </button>
              </>
            )}
          </div>
        </div>

        {hasOcrText ? (
          <div className="space-y-3">
            {allOcrTexts.map((item, idx) => (
              <div
                key={idx}
                className="rounded-xl border border-slate-800 bg-slate-950/70 p-4 font-mono text-xs space-y-2.5 transition-all hover:border-slate-700/80"
              >
                <div className="flex items-center justify-between text-slate-400 border-b border-slate-800/60 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-purple-400 font-sans">
                      {allOcrTexts.length > 1 ? `Block ${idx + 1}` : "Transcript"}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      • Sheet Page {item.page || 1}
                    </span>
                    {item.confidence && (
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-purple-500/10 text-purple-300 border border-purple-500/30">
                        {Math.round(item.confidence * 100)}% match
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => handleCopyText(item.text, idx)}
                    className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 transition-colors"
                    title="Copy block text"
                  >
                    {copiedIndex === idx ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>

                <div className="text-slate-200 whitespace-pre-wrap leading-relaxed select-text font-mono text-xs bg-slate-900/40 p-3 rounded-lg border border-slate-800/60">
                  {item.text}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 rounded-xl border border-dashed border-slate-800 bg-slate-950/40 text-center space-y-2">
            <FileText className="w-7 h-7 text-slate-400 mx-auto" />
            <h5 className="text-xs font-semibold text-slate-300">
              {ocrCount && ocrCount > 0
                ? `${ocrCount} OCR Text Tokens Extracted`
                : "No Textual Annotations Detected by OCR Engine"}
            </h5>
            <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
              {ocrCount && ocrCount > 0
                ? `Tesseract OCR registered ${ocrCount} text token(s). Full textual transcripts render dynamically when streamed in rawResponseJson records.`
                : "The OCR engine did not find readable schematic labels, pin numbers, or engineering annotations on this blueprint."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
