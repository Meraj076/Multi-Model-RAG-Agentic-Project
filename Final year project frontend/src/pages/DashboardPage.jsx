import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  FileText,
  CheckCircle2,
  Clock,
  AlertOctagon,
  ArrowRight,
  Server,
  Cpu,
  Layers,
  RefreshCw,
  FolderOpen,
} from "lucide-react";
import { useDocuments } from "../hooks/useDocuments";
import { useHealth } from "../hooks/useHealth";
import { StatCard } from "../components/common/StatCard";
import { UploadDropzone } from "../components/upload/UploadDropzone";
import { DocumentTable } from "../components/documents/DocumentTable";
import { DocumentPreviewModal } from "../components/documents/DocumentPreviewModal";
import { Modal } from "../components/common/Modal";
import { Button } from "../components/common/Button";
import { useToast } from "../context/ToastContext";
import { deleteDocument, analyzeDocument, downloadDocument } from "../api/documents";
import { triggerFileDownload } from "../lib/utils";
import { extractErrorMessage } from "../api/client";

export const DashboardPage = () => {
  const { showToast } = useToast();
  const { allDocuments, stats, loading, error, refreshDocuments } = useDocuments();
  const { health, isJavaOnline, isMlOnline, refetch: refetchHealth } = useHealth();

  const [previewDoc, setPreviewDoc] = useState(null);
  const [docToDelete, setDocToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [analyzingId, setAnalyzingId] = useState(null);

  const handleDownload = async (doc) => {
    try {
      const blob = await downloadDocument(doc.id);
      triggerFileDownload(blob, doc.originalFilename);
      showToast("success", "Download Started", `Downloading ${doc.originalFilename}`);
    } catch (err) {
      showToast("error", "Download Failed", extractErrorMessage(err));
    }
  };

  const handleAnalyze = async (id) => {
    try {
      setAnalyzingId(id);
      const res = await analyzeDocument(id);
      if (res.status === "COMPLETED") {
        showToast("success", "Analysis Finished", res.message);
      } else if (res.status === "PENDING_ANALYSIS") {
        showToast("warning", "Analysis Queued / ML Offline", res.message);
      } else {
        showToast("info", `Status: ${res.status}`, res.message);
      }
      refreshDocuments();
    } catch (err) {
      showToast("error", "Analysis Failed", extractErrorMessage(err));
    } finally {
      setAnalyzingId(null);
    }
  };

  const confirmDelete = async () => {
    if (!docToDelete) return;
    try {
      setIsDeleting(true);
      await deleteDocument(docToDelete.id);
      showToast("success", "Document Deleted", `Removed "${docToDelete.originalFilename}"`);
      setDocToDelete(null);
      refreshDocuments();
    } catch (err) {
      showToast("error", "Delete Failed", extractErrorMessage(err));
    } finally {
      setIsDeleting(false);
    }
  };

  // 5 Most recent uploads
  const recentDocs = [...allDocuments]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Hero / Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-900">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
            Engineering Blueprint & Circuit Intelligence
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Real-time multimodal document analysis with Tesseract OCR & YOLOv8 component detection
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              refreshDocuments();
              refetchHealth();
            }}
            loading={loading}
            icon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Refresh Dashboard
          </Button>
          <Link to="/documents">
            <Button variant="primary" size="sm" icon={<FolderOpen className="w-4 h-4" />}>
              All Documents
            </Button>
          </Link>
        </div>
      </div>

      {/* Backend Error Banner if unreachable */}
      {error && (
        <div className="p-4 rounded-xl border border-rose-500/30 bg-rose-950/20 text-rose-300 text-sm flex items-start justify-between gap-3">
          <div>
            <p className="font-bold">Backend Connection Notice</p>
            <p className="text-xs text-rose-400 mt-0.5">{error}</p>
          </div>
          <Button variant="danger" size="sm" onClick={() => refreshDocuments()}>
            Retry
          </Button>
        </div>
      )}

      {/* Overview Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Documents"
          value={loading ? "..." : stats.total}
          icon={<FileText className="w-5 h-5 text-cyan-400" />}
          description="Stored blueprint schematics & circuit PDFs"
          variant="blue"
        />
        <StatCard
          title="Completed Analysis"
          value={loading ? "..." : stats.completed}
          icon={<CheckCircle2 className="w-5 h-5 text-emerald-400" />}
          description="Analyzed with OCR & YOLO detections"
          variant="emerald"
        />
        <StatCard
          title="Pending / Queued"
          value={loading ? "..." : stats.pending + stats.uploaded}
          icon={<Clock className="w-5 h-5 text-amber-400" />}
          description="Awaiting processing or ML pipeline"
          variant="amber"
        />
        <StatCard
          title="Failed Processing"
          value={loading ? "..." : stats.failed}
          icon={<AlertOctagon className="w-5 h-5 text-rose-400" />}
          description="Pipeline halted due to runtime errors"
          variant="rose"
        />
      </div>

      {/* Split Section: Drag & Drop Upload and System Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <UploadDropzone
            onUploadSuccess={() => {
              refreshDocuments();
            }}
          />
        </div>

        {/* System Architecture Connectivity Card */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 backdrop-blur-xl p-6 shadow-xl flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-bold text-slate-100">Pipeline Connectivity</h3>
              </div>
              <Link to="/health" className="text-xs text-cyan-400 hover:underline">
                Diagnostics
              </Link>
            </div>

            <div className="space-y-3 font-mono text-xs">
              {/* Java Spring Boot */}
              <div className="p-3 rounded-xl border border-slate-800 bg-slate-950/60 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Server className="w-4 h-4 text-cyan-400" />
                  <div>
                    <p className="font-sans font-bold text-slate-200">Java Spring Boot</p>
                    <p className="text-[11px] text-slate-400">Port 8080 (REST API)</p>
                  </div>
                </div>
                <span
                  className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                    isJavaOnline
                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                      : "bg-rose-500/10 text-rose-400 border border-rose-500/30"
                  }`}
                >
                  {isJavaOnline ? "ONLINE" : "OFFLINE"}
                </span>
              </div>

              {/* Python FastAPI ML Service */}
              <div className="p-3 rounded-xl border border-slate-800 bg-slate-950/60 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Cpu className="w-4 h-4 text-purple-400" />
                  <div>
                    <p className="font-sans font-bold text-slate-200">Python AI Service</p>
                    <p className="text-[11px] text-slate-400">
                      {health?.mlServiceUrl || "http://localhost:8000"}
                    </p>
                  </div>
                </div>
                <span
                  className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                    !isJavaOnline
                      ? "bg-slate-800 text-slate-400 border border-slate-700"
                      : isMlOnline
                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                      : "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                  }`}
                >
                  {!isJavaOnline ? "UNKNOWN" : isMlOnline ? "REACHABLE" : "OFFLINE"}
                </span>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
              Frontend talks strictly to the Java Spring Boot orchestrator. Model inference is executed via Python FastAPI with YOLOv8 circuit weights.
            </p>
          </div>

          <div className="pt-4 border-t border-slate-800/80">
            <div className="text-[11px] font-mono text-slate-400 flex justify-between">
              <span>Storage Directory:</span>
              <span className="text-slate-300 truncate max-w-[160px]" title={health?.storageDirectory}>
                {health?.storageDirectory || "./data/uploads"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Uploads Section */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-100">Recent Blueprint Uploads</h3>
            <p className="text-xs text-slate-400">
              Latest engineering schematics submitted for multimodal extraction
            </p>
          </div>
          <Link
            to="/documents"
            className="inline-flex items-center gap-1 text-xs font-semibold text-cyan-400 hover:text-cyan-300"
          >
            View all ({allDocuments.length}) <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <DocumentTable
          documents={recentDocs}
          onDownload={handleDownload}
          onAnalyze={handleAnalyze}
          onDelete={(doc) => setDocToDelete(doc)}
          analyzingId={analyzingId}
          pageSize={5}
        />
      </div>

      {/* Preview Modal */}
      <DocumentPreviewModal
        document={previewDoc}
        isOpen={Boolean(previewDoc)}
        onClose={() => setPreviewDoc(null)}
      />

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={Boolean(docToDelete)}
        onClose={() => setDocToDelete(null)}
        title="Confirm Document Deletion"
        description="This action will permanently delete the blueprint and all related analysis records from the Java backend."
        size="sm"
        footer={
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDocToDelete(null)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={confirmDelete}
              loading={isDeleting}
            >
              Delete Permanently
            </Button>
          </>
        }
      >
        <div className="space-y-2 text-xs">
          <p className="text-slate-300">
            Are you sure you want to delete:
          </p>
          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 font-mono text-slate-200">
            <p className="font-bold text-rose-300">{docToDelete?.originalFilename}</p>
            <p className="text-[11px] text-slate-400 mt-1">UUID: {docToDelete?.id}</p>
          </div>
        </div>
      </Modal>
    </div>
  );
};
