import React from "react";
import { Link } from "react-router-dom";
import {
  FileText,
  Image as ImageIcon,
  Download,
  Play,
  Trash2,
  ExternalLink,
  Calendar,
  HardDrive,
} from "lucide-react";
import { formatBytes, formatDateTime } from "../../lib/utils";
import { StatusPill } from "../common/StatusPill";
import { Button } from "../common/Button";

export const DocumentCard = ({
  document: doc,
  onAnalyze = null,
  onDownload = null,
  onDelete = null,
  isAnalyzing = false,
}) => {
  const isPdf = doc.contentType === "application/pdf" || doc.originalFilename.endsWith(".pdf");

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-md shadow-lg hover:border-slate-700 transition-all flex flex-col justify-between gap-4">
      <div className="space-y-3">
        {/* Header with Type Icon & Status */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700 shrink-0">
              {isPdf ? (
                <FileText className="w-5 h-5 text-rose-400" />
              ) : (
                <ImageIcon className="w-5 h-5 text-cyan-400" />
              )}
            </div>
            <div className="min-w-0">
              <Link
                to={`/documents/${doc.id}`}
                className="text-sm font-bold text-slate-100 hover:text-cyan-400 transition-colors truncate block"
                title={doc.originalFilename}
              >
                {doc.originalFilename}
              </Link>
              <p className="text-[11px] font-mono text-slate-400 truncate mt-0.5">
                ID: {doc.id}
              </p>
            </div>
          </div>
          <StatusPill status={doc.status} />
        </div>

        {/* Metadata Details */}
        <div className="grid grid-cols-2 gap-2 text-xs text-slate-400 font-mono bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/60">
          <div className="flex items-center gap-1.5">
            <HardDrive className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>{formatBytes(doc.fileSizeBytes)}</span>
          </div>
          <div className="flex items-center gap-1.5 truncate">
            <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span title={doc.createdAt}>{formatDateTime(doc.createdAt)}</span>
          </div>
        </div>

        {/* Error message if present */}
        {doc.errorMessage && (
          <p className="text-xs text-rose-400 bg-rose-950/20 p-2 rounded border border-rose-900/40 line-clamp-2">
            {doc.errorMessage}
          </p>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-800/80 gap-2">
        <Link
          to={`/documents/${doc.id}`}
          className="inline-flex items-center gap-1 text-xs font-semibold text-cyan-400 hover:text-cyan-300 py-1"
        >
          Details <ExternalLink className="w-3 h-3" />
        </Link>

        <div className="flex items-center gap-1.5">
          {onDownload && (
            <button
              onClick={() => onDownload(doc)}
              className="p-1.5 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-lg transition-colors border border-transparent hover:border-slate-700"
              title="Download original file"
            >
              <Download className="w-4 h-4" />
            </button>
          )}

          {onAnalyze && (
            <Button
              variant="outline"
              size="sm"
              loading={isAnalyzing}
              onClick={() => onAnalyze(doc.id)}
              icon={<Play className="w-3.5 h-3.5 text-cyan-400" />}
            >
              Analyze
            </Button>
          )}

          {onDelete && (
            <button
              onClick={() => onDelete(doc)}
              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 rounded-lg transition-colors border border-transparent hover:border-rose-900/40"
              title="Delete document"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
