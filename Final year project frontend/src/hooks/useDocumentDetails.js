import { useState, useEffect, useCallback } from "react";
import {
  getDocument,
  getAnalysisRecords,
  analyzeDocument,
  downloadDocument,
  deleteDocument,
} from "../api/documents";
import { extractErrorMessage } from "../api/client";
import { triggerFileDownload } from "../lib/utils";
import { useToast } from "../context/ToastContext";

export function useDocumentDetails(documentId) {
  const { showToast } = useToast();
  const [document, setDocument] = useState(null);
  const [records, setRecords] = useState([]);
  const [latestAnalysis, setLatestAnalysis] = useState(null);

  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState(null);

  const loadData = useCallback(async () => {
    if (!documentId) return;
    try {
      setLoading(true);
      setError(null);
      const [docData, recordsData] = await Promise.all([
        getDocument(documentId),
        getAnalysisRecords(documentId).catch(() => []),
      ]);
      setDocument(docData);
      setRecords(recordsData);
    } catch (err) {
      const msg = extractErrorMessage(err);
      setError(msg);
      setDocument(null);
    } finally {
      setLoading(false);
    }
  }, [documentId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const runAnalysis = useCallback(async () => {
    if (!documentId || analyzing) return null;
    try {
      setAnalyzing(true);
      const res = await analyzeDocument(documentId);
      setLatestAnalysis(res);

      if (res.status === "COMPLETED") {
        showToast("success", "Analysis Complete", res.message || "Vision & OCR pipeline finished successfully.");
      } else if (res.status === "PENDING_ANALYSIS") {
        showToast(
          res.mlServiceReachable ? "info" : "warning",
          res.mlServiceReachable ? "Queued for Analysis" : "ML Service Offline",
          res.message || "Document status updated to PENDING_ANALYSIS."
        );
      } else if (res.status === "FAILED") {
        showToast("error", "Analysis Failed", res.message || "Pipeline encountered an error.");
      } else {
        showToast("info", `Status: ${res.status}`, res.message);
      }

      await loadData();
      return res;
    } catch (err) {
      const msg = extractErrorMessage(err);
      showToast("error", "Analysis Trigger Failed", msg);
      return null;
    } finally {
      setAnalyzing(false);
    }
  }, [documentId, analyzing, loadData, showToast]);

  const downloadFile = useCallback(async () => {
    if (!documentId || !document || downloading) return;
    try {
      setDownloading(true);
      const blob = await downloadDocument(documentId);
      triggerFileDownload(blob, document.originalFilename || `blueprint-${documentId}`);
      showToast("success", "Download Started", `Downloading ${document.originalFilename}`);
    } catch (err) {
      showToast("error", "Download Failed", extractErrorMessage(err));
    } finally {
      setDownloading(false);
    }
  }, [documentId, document, downloading, showToast]);

  const removeDocument = useCallback(async () => {
    if (!documentId || deleting) return false;
    try {
      setDeleting(true);
      await deleteDocument(documentId);
      showToast("success", "Document Deleted", `Removed "${document?.originalFilename || documentId}"`);
      return true;
    } catch (err) {
      showToast("error", "Delete Failed", extractErrorMessage(err));
      return false;
    } finally {
      setDeleting(false);
    }
  }, [documentId, document, deleting, showToast]);

  return {
    document,
    records,
    latestAnalysis,
    loading,
    analyzing,
    downloading,
    deleting,
    error,
    refresh: loadData,
    runAnalysis,
    downloadFile,
    removeDocument,
  };
}
