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
  if (!rawJson || typeof rawJson !== "string" || rawJson.trim() === "") {
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
