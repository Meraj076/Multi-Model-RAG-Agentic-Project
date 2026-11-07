import React, { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  Download,
  Play,
  Trash2,
  RefreshCw,
  FileText,
  Image as ImageIcon,
  HardDrive,
  Calendar,
  AlertCircle,
  Eye,
  Layers,
  Cpu,
} from "lucide-react";
import { useDocumentDetails } from "../hooks/useDocumentDetails";
import { StatusPill } from "../components/common/StatusPill";
import { Button } from "../components/common/Button";
import { Modal } from "../components/common/Modal";
import { DocumentPreviewModal } from "../components/documents/DocumentPreviewModal";
import { AnalysisSummaryCard } from "../components/analysis/AnalysisSummaryCard";
import { ComponentDetectionsView } from "../components/analysis/ComponentDetectionsView";
import { AnalysisRecordsList } from "../components/analysis/AnalysisRecordsList";
import { formatBytes, formatDateTime, parseRawAnalysisReport } from "../lib/utils";

export const DocumentDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const {
    document: doc,
    records,
    latestAnalysis,
    loading,
    analyzing,
    downloading,
    deleting,
    error,
    refresh,
    runAnalysis,
    downloadFile,
    removeDocument,
  } = useDocumentDetails(id);

  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const handleDelete = async () => {
    const success = await removeDocument();
    if (success) {
      navigate("/documents");
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center space-y-4">
        <RefreshCw className="w-8 h-8 animate-spin text-cyan-400 mx-auto" />
        <p className="text-sm font-mono text-slate-400">
          Loading blueprint metadata and analysis history...
        </p>
      </div>
    );
  }

  if (error || !doc) {
    return (
      <div className="p-8 rounded-2xl border border-rose-500/30 bg-rose-950/20 text-center max-w-xl mx-auto space-y-4 my-10">
        <AlertCircle className="w-10 h-10 text-rose-400 mx-auto" />
        <h3 className="text-base font-bold text-rose-300">Document Not Found</h3>
        <p className="text-xs text-slate-300">{error || "Could not retrieve document."}</p>
        <Link to="/documents">
          <Button variant="outline" size="sm" icon={<ArrowLeft className="w-4 h-4" />}>
            Back to Documents
          </Button>
        </Link>
      </div>
    );
  }

  const isPdf =
    doc.contentType === "application/pdf" || doc.originalFilename.endsWith(".pdf");

  const latestRecord = records.length > 0 ? records[0] : null;
  const rawJson = latestRecord?.rawResponseJson;
  const { report: parsedReport } = parseRawAnalysisReport(rawJson);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Navigation & Breadcrumbs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-900">
        <div className="flex items-center gap-3">
          <Link
            to="/documents"
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition-colors"
            title="Back to Documents"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-100 tracking-tight">
                {doc.originalFilename}
              </h1>
              <StatusPill status={doc.status} />
            </div>
            <p className="text-xs font-mono text-slate-400 mt-0.5 select-all">
              UUID: {doc.id}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refresh()}
            icon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Refresh
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setIsPreviewOpen(true)}
            icon={<Eye className="w-4 h-4" />}
          >
            Preview
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={downloadFile}
            loading={downloading}
            icon={<Download className="w-4 h-4" />}
          >
            Download
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={runAnalysis}
            loading={analyzing}
            icon={<Play className="w-4 h-4" />}
          >
            Trigger Analysis
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => setIsDeleteModalOpen(true)}
            icon={<Trash2 className="w-4 h-4" />}
          >
            Delete
          </Button>
        </div>
      </div>

      {/* Document Specification Metadata Panel */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/50 backdrop-blur-xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-slate-100">Document Metadata & Storage</h3>
          </div>
          <span className="text-xs font-mono text-slate-400">
            Stored File: {doc.storedFilename || "Standard Store"}
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 font-mono text-xs">
          <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/60">
            <span className="text-[11px] uppercase tracking-wider text-slate-400">
              Format & Type
            </span>
            <div className="flex items-center gap-2 mt-2">
              {isPdf ? (
                <FileText className="w-4 h-4 text-rose-400 shrink-0" />
              ) : (
                <ImageIcon className="w-4 h-4 text-cyan-400 shrink-0" />
              )}
              <span className="font-semibold text-slate-100 truncate">
                {doc.contentType || "Unknown"}
              </span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/60">
            <span className="text-[11px] uppercase tracking-wider text-slate-400">
              File Size
            </span>
            <div className="flex items-center gap-2 mt-2">
              <HardDrive className="w-4 h-4 text-slate-400 shrink-0" />
              <span className="font-semibold text-slate-100">
                {formatBytes(doc.fileSizeBytes)}
              </span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/60">
            <span className="text-[11px] uppercase tracking-wider text-slate-400">
              Upload Timestamp
            </span>
            <div className="flex items-center gap-2 mt-2">
              <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
              <span className="font-semibold text-slate-100 truncate">
                {formatDateTime(doc.createdAt)}
              </span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/60">
            <span className="text-[11px] uppercase tracking-wider text-slate-400">
              Last State Update
            </span>
            <div className="flex items-center gap-2 mt-2">
              <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
              <span className="font-semibold text-slate-100 truncate">
                {formatDateTime(doc.updatedAt)}
              </span>
            </div>
          </div>
        </div>

        {doc.errorMessage && (
          <div className="p-3.5 rounded-xl border border-rose-500/30 bg-rose-950/20 text-rose-300 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Recorded Error: </span>
              {doc.errorMessage}
            </div>
          </div>
        )}
      </div>

      {/* Analysis Results Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Cpu className="w-5 h-5 text-cyan-400" />
            <h2 className="text-lg font-bold text-slate-100">Multimodal Pipeline Analysis</h2>
          </div>
        </div>

        {/* Summary Card */}
        <AnalysisSummaryCard
          analysis={latestAnalysis}
          record={latestRecord}
        />

        {/* Detailed Component Detections & OCR Section */}
        <ComponentDetectionsView
          parsedReport={parsedReport}
        />

        {/* Historical Analysis Execution Records */}
        <AnalysisRecordsList records={records} />
      </div>

      {/* Document Binary Preview Modal */}
      <DocumentPreviewModal
        document={doc}
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
      />

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirm Document Deletion"
        description="This action cannot be undone. All database records and uploaded files will be permanently purged."
        size="sm"
        footer={
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsDeleteModalOpen(false)}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={handleDelete}
              loading={deleting}
            >
              Delete Permanently
            </Button>
          </>
        }
      >
        <div className="space-y-2 text-xs">
          <p className="text-slate-300">Confirm deletion of:</p>
          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 font-mono text-slate-200">
            <p className="font-bold text-rose-300">{doc.originalFilename}</p>
            <p className="text-[11px] text-slate-400 mt-1">UUID: {doc.id}</p>
          </div>
        </div>
      </Modal>
    </div>
  );
};
