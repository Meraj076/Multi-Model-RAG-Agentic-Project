import React, { useState } from "react";
import { FolderOpen, RefreshCw, UploadCloud } from "lucide-react";
import { useDocuments } from "../hooks/useDocuments";
import { DocumentFilter } from "../components/documents/DocumentFilter";
import { DocumentTable } from "../components/documents/DocumentTable";
import { DocumentPreviewModal } from "../components/documents/DocumentPreviewModal";
import { Modal } from "../components/common/Modal";
import { Button } from "../components/common/Button";
import { useToast } from "../context/ToastContext";
import { deleteDocument, analyzeDocument, downloadDocument } from "../api/documents";
import { triggerFileDownload } from "../lib/utils";
import { extractErrorMessage } from "../api/client";

export const DocumentsPage = () => {
  const { showToast } = useToast();
  const {
    documents,
    allDocuments,
    loading,
    error,
    filterOptions,
    updateFilter,
    refreshDocuments,
  } = useDocuments();

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

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-900">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
              <FolderOpen className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-100 tracking-tight">
                Blueprint & Circuit Document Repository
              </h1>
              <p className="text-xs text-slate-400">
                Browse, search, inspect, analyze, and manage uploaded engineering schematics
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refreshDocuments()}
            loading={loading}
            icon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Refresh
          </Button>
          <a href="/#blueprint-file-input">
            <Button variant="primary" size="sm" icon={<UploadCloud className="w-4 h-4" />}>
              Upload New
            </Button>
          </a>
        </div>
      </div>

      {/* Backend Error Banner */}
      {error && (
        <div className="p-4 rounded-xl border border-rose-500/30 bg-rose-950/20 text-rose-300 text-sm flex items-start justify-between gap-3">
          <div>
            <p className="font-bold">Error Loading Documents</p>
            <p className="text-xs text-rose-400 mt-0.5">{error}</p>
          </div>
          <Button variant="danger" size="sm" onClick={() => refreshDocuments()}>
            Retry
          </Button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <DocumentFilter
        filterOptions={filterOptions}
        onFilterChange={updateFilter}
        totalCount={allDocuments.length}
        filteredCount={documents.length}
      />

      {/* Documents Table / Mobile Cards */}
      <DocumentTable
        documents={documents}
        onDownload={handleDownload}
        onAnalyze={handleAnalyze}
        onDelete={(doc) => setDocToDelete(doc)}
        analyzingId={analyzingId}
        pageSize={10}
      />

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
        description="This will permanently delete the file from backend storage and purge all historical OCR/YOLO analysis records."
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
            Please confirm deletion of the following blueprint:
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
