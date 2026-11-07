export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api";

export const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024; // 50 MB

export const ALLOWED_FILE_TYPES = [
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/jpg",
];

export const ALLOWED_EXTENSIONS = [".pdf", ".png", ".jpg", ".jpeg"];

export const STATUS_CONFIG = {
  UPLOADED: {
    label: "Uploaded",
    badgeBg: "bg-blue-500/10",
    badgeText: "text-blue-400",
    border: "border-blue-500/30",
    dotColor: "bg-blue-400",
    description: "Document stored in Java repository and awaiting pipeline processing.",
  },
  PENDING_ANALYSIS: {
    label: "Pending Analysis",
    badgeBg: "bg-amber-500/10",
    badgeText: "text-amber-400",
    border: "border-amber-500/30",
    dotColor: "bg-amber-400",
    description: "Analysis queued or awaiting ML service availability.",
  },
  ANALYZING: {
    label: "Analyzing",
    badgeBg: "bg-purple-500/10",
    badgeText: "text-purple-400",
    border: "border-purple-500/30",
    dotColor: "bg-purple-400 animate-pulse",
    description: "OCR extraction & YOLO model inference currently in progress.",
  },
  COMPLETED: {
    label: "Completed",
    badgeBg: "bg-emerald-500/10",
    badgeText: "text-emerald-400",
    border: "border-emerald-500/30",
    dotColor: "bg-emerald-400",
    description: "Analysis successfully completed with vision & OCR data.",
  },
  FAILED: {
    label: "Failed",
    badgeBg: "bg-rose-500/10",
    badgeText: "text-rose-400",
    border: "border-rose-500/30",
    dotColor: "bg-rose-400",
    description: "Analysis halted due to an unrecoverable pipeline error.",
  },
};

export const KNOWN_COMPONENT_CLASSES = [
  "Resistor",
  "Capacitor",
  "Diode",
  "LED",
  "Transistor",
  "Switch",
  "Battery",
  "Ground",
  "Connector",
  "Fuse",
  "IC",
  "Inductor",
  "Transformer",
  "Bridge Rectifier",
];
