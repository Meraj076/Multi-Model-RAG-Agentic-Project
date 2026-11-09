import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * Format bytes to readable string (e.g. 50.1 KB, 1.2 MB)
 */
export function formatBytes(bytes, decimals = 1) {
  if (bytes === 0) return "0 B";
  if (!bytes || isNaN(bytes)) return "0 B";

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["B", "KB", "MB", "GB", "TB"];

  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const index = Math.min(i, sizes.length - 1);

  return `${parseFloat((bytes / Math.pow(k, index)).toFixed(dm))} ${sizes[index]}`;
}

/**
 * Format ISO date string into locale-friendly date & time
 */
export function formatDateTime(isoString) {
  if (!isoString) return "N/A";
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString;
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(d);
  } catch {
    return isoString;
  }
}

/**
 * Format relative time (e.g. "5m ago", "Just now")
 */
export function formatRelativeTime(isoString) {
  if (!isoString) return "N/A";
  try {
    const d = new Date(isoString);
    const now = new Date();
    const diffSec = Math.floor((now.getTime() - d.getTime()) / 1000);

    if (diffSec < 60) return "Just now";
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d ago`;

    return formatDateTime(isoString);
  } catch {
    return isoString;
  }
}

/**
 * Safely parse rawResponseJson from AnalysisRecord
 */
export function parseRawAnalysisReport(rawJson) {
  if (!rawJson) {
    return { report: null, isParsed: false };
  }

  if (typeof rawJson === "object" && rawJson !== null) {
    return { report: rawJson, isParsed: true };
  }

  if (typeof rawJson !== "string" || rawJson.trim() === "") {
    return { report: null, isParsed: false };
  }

  try {
    const parsed = JSON.parse(rawJson);
    if (typeof parsed === "object" && parsed !== null) {
      return { report: parsed, isParsed: true };
    }
    return { report: null, isParsed: false, error: "Parsed JSON is not an object" };
  } catch (err) {
    return {
      report: null,
      isParsed: false,
      error: err instanceof Error ? err.message : "Malformed JSON string",
    };
  }
}

/**
 * Normalizes bounding box format into [x1, y1, x2, y2]
 */
function normalizeBbox(bbox) {
  if (!bbox) return null;
  if (Array.isArray(bbox) && bbox.length >= 4) {
    return bbox.slice(0, 4).map((n) => Number(n) || 0);
  }
  if (typeof bbox === "object") {
    if ("x1" in bbox && "y1" in bbox && "x2" in bbox && "y2" in bbox) {
      return [Number(bbox.x1) || 0, Number(bbox.y1) || 0, Number(bbox.x2) || 0, Number(bbox.y2) || 0];
    }
    if ("xmin" in bbox && "ymin" in bbox && "xmax" in bbox && "ymax" in bbox) {
      return [Number(bbox.xmin) || 0, Number(bbox.ymin) || 0, Number(bbox.xmax) || 0, Number(bbox.ymax) || 0];
    }
    if ("x" in bbox && "y" in bbox && "width" in bbox && "height" in bbox) {
      const x = Number(bbox.x) || 0;
      const y = Number(bbox.y) || 0;
      const w = Number(bbox.width) || 0;
      const h = Number(bbox.height) || 0;
      return [x, y, x + w, y + h];
    }
  }
  return null;
}

/**
 * Normalizes confidence score between 0.0 and 1.0
 */
function normalizeConfidence(conf) {
  if (conf === undefined || conf === null || isNaN(conf)) return 1.0;
  const num = Number(conf);
  if (num > 1) return Math.min(1.0, num / 100);
  return Math.max(0, num);
}

/**
 * Intelligently extracts component detections and OCR texts from ANY payload structure:
 * - Flat YOLO structure: { detections: [...], ocr_blocks: [...], ocr_text: "..." }
 * - Multi-page PDF structure: { pages: [ { components: [...], extracted_text: "..." } ] }
 * - Nested or alternate keys: components, objects, predictions, text, transcript
 */
export function extractAnalysisDetails(report) {
  if (!report || typeof report !== "object") {
    return {
      components: [],
      ocrTexts: [],
      fullOcrTranscript: "",
      totalDetections: 0,
      totalOcrCount: 0,
      isMultiPage: false,
      pageCount: 0,
      displaySummary: "No Analysis Data",
    };
  }

  // Unwrap potential wrapper keys like data, result, payload
  const root = report.data || report.result || report.payload || report.analysis || report;

  const components = [];
  const ocrTexts = [];
  let isMultiPage = false;
  let pageCount = 0;

  // 1. Check for Multi-page PDF structure
  if (Array.isArray(root.pages) && root.pages.length > 0) {
    isMultiPage = true;
    pageCount = root.pages.length;

    root.pages.forEach((page, pIdx) => {
      const pageNum = page.page_number || page.page || pIdx + 1;

      // Extract components from page
      const pageComps = page.components || page.detections || page.objects || [];
      if (Array.isArray(pageComps)) {
        pageComps.forEach((c, cIdx) => {
          components.push({
            class_name: c.class_name || c.className || c.name || c.label || c.class || `Component ${cIdx + 1}`,
            class_id: c.class_id ?? c.classId ?? c.id ?? cIdx,
            confidence: normalizeConfidence(c.confidence ?? c.conf ?? c.score),
            bbox_xyxy: normalizeBbox(c.bbox_xyxy || c.bbox || c.box || c.coordinates),
            page: pageNum,
          });
        });
      }

      // Extract OCR text from page
      const pageText = page.extracted_text || page.ocr_text || page.text || page.transcript || "";
      if (typeof pageText === "string" && pageText.trim() !== "") {
        ocrTexts.push({
          page: pageNum,
          text: pageText.trim(),
          confidence: null,
          bbox: null,
        });
      }

      // Extract OCR blocks from page if present
      const pageOcrBlocks = page.ocr_blocks || page.ocrBlocks || [];
      if (Array.isArray(pageOcrBlocks)) {
        pageOcrBlocks.forEach((block) => {
          if (typeof block === "string" && block.trim()) {
            ocrTexts.push({ page: pageNum, text: block.trim(), confidence: null, bbox: null });
          } else if (typeof block === "object" && block !== null) {
            const blockText = block.text || block.content || block.word || block.token || "";
            if (blockText.trim()) {
              ocrTexts.push({
                page: pageNum,
                text: blockText.trim(),
                confidence: normalizeConfidence(block.confidence ?? block.conf),
                bbox: normalizeBbox(block.bbox || block.box),
              });
            }
          }
        });
      }
    });
  }

  // 2. Extract Flat Component Detections
  const flatComps =
    root.detections ||
    root.components ||
    root.objects ||
    root.predictions ||
    root.results ||
    root.detected_components ||
    [];

  if (Array.isArray(flatComps) && flatComps.length > 0) {
    flatComps.forEach((c, idx) => {
      components.push({
        class_name: c.class_name || c.className || c.name || c.label || c.class || `Component ${idx + 1}`,
        class_id: c.class_id ?? c.classId ?? c.id ?? idx,
        confidence: normalizeConfidence(c.confidence ?? c.conf ?? c.score),
        bbox_xyxy: normalizeBbox(c.bbox_xyxy || c.bbox || c.box || c.coordinates),
        page: c.page || 1,
      });
    });
  }

  // 3. Extract Flat OCR Blocks / Text
  const flatOcrBlocks = root.ocr_blocks || root.ocrBlocks || root.ocr_tokens || root.tokens || [];
  if (Array.isArray(flatOcrBlocks) && flatOcrBlocks.length > 0) {
    flatOcrBlocks.forEach((block, idx) => {
      if (typeof block === "string" && block.trim()) {
        ocrTexts.push({ page: 1, text: block.trim(), confidence: null, bbox: null });
      } else if (typeof block === "object" && block !== null) {
        const textVal = block.text || block.content || block.word || block.token || block.transcript || "";
        if (textVal.trim()) {
          ocrTexts.push({
            page: block.page || 1,
            text: textVal.trim(),
            confidence: normalizeConfidence(block.confidence ?? block.conf),
            bbox: normalizeBbox(block.bbox || block.box),
          });
        }
      }
    });
  }

  // Check top-level textual strings
  const directText =
    root.ocr_text ||
    root.extracted_text ||
    root.text ||
    root.transcript ||
    root.ocrText ||
    root.ocr_content ||
    "";

  if (typeof directText === "string" && directText.trim() !== "") {
    const trimmed = directText.trim();
    const alreadyIncluded = ocrTexts.some((item) => item.text === trimmed);
    if (!alreadyIncluded) {
      ocrTexts.unshift({
        page: 1,
        text: trimmed,
        confidence: null,
        bbox: null,
      });
    }
  }

  // Also check if root has an "ocr" object or map
  if (root.ocr && typeof root.ocr === "object") {
    if (typeof root.ocr.text === "string" && root.ocr.text.trim()) {
      ocrTexts.push({ page: 1, text: root.ocr.text.trim(), confidence: null, bbox: null });
    }
    if (Array.isArray(root.ocr.blocks)) {
      root.ocr.blocks.forEach((b) => {
        const t = typeof b === "string" ? b : b?.text;
        if (t && t.trim()) {
          ocrTexts.push({ page: 1, text: t.trim(), confidence: null, bbox: null });
        }
      });
    }
  }

  // Build a consolidated full transcript string
  const fullOcrTranscript = ocrTexts.map((o) => o.text).filter(Boolean).join("\n");

  const totalDetections = components.length || root.detection_count || root.detectionCount || 0;
  const totalOcrCount = ocrTexts.length || root.ocr_count || root.ocrCount || 0;

  // Generate a friendly, accurate label for record viewer
  let displaySummary = "";
  if (isMultiPage && pageCount > 0) {
    displaySummary = `${pageCount} ${pageCount === 1 ? "Page" : "Pages"} Analyzed`;
  } else if (components.length > 0 || ocrTexts.length > 0) {
    displaySummary = `Schematic Analysis (${components.length} Detections, ${ocrTexts.length} OCR Blocks)`;
  } else if (totalDetections > 0 || totalOcrCount > 0) {
    displaySummary = `Schematic Analysis (${totalDetections} Detections, ${totalOcrCount} OCR Tokens)`;
  } else {
    displaySummary = "Blueprint Analysis Report";
  }

  return {
    components,
    ocrTexts,
    fullOcrTranscript,
    totalDetections,
    totalOcrCount,
    isMultiPage,
    pageCount: pageCount || 1,
    displaySummary,
  };
}

/**
 * Download a Blob or File directly in browser with specific filename
 */
export function triggerFileDownload(blob, filename) {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.style.display = "none";
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
}
