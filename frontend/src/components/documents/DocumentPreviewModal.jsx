import React, { useState, useEffect } from "react";
import { Download, Loader2, AlertCircle, FileText, Cpu, Eye, EyeOff } from "lucide-react";
import { downloadDocument } from "../../api/documents";
import { Modal } from "../common/Modal";
import { Button } from "../common/Button";
import { formatBytes, triggerFileDownload } from "../../lib/utils";
import { extractErrorMessage } from "../../api/client";
import { BoundingBoxOverlay } from "../analysis/BoundingBoxOverlay";

export const DocumentPreviewModal = ({
  document: doc,
  isOpen,
  onClose,
  detections = [],
}) => {
  const [blobUrl, setBlobUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [rawBlob, setRawBlob] = useState(null);
  const [showOverlay, setShowOverlay] = useState(true);

  useEffect(() => {
    let activeUrl = null;

    if (isOpen && doc) {
      setLoading(true);
      setError(null);

      downloadDocument(doc.id)
        .then((blob) => {
          setRawBlob(blob);
          const url = URL.createObjectURL(blob);
          activeUrl = url;
          setBlobUrl(url);
        })
        .catch((err) => {
          setError(extractErrorMessage(err));
        })
        .finally(() => {
          setLoading(false);
        });
    }

    return () => {
      if (activeUrl) {
        URL.revokeObjectURL(activeUrl);
      }
      setBlobUrl(null);
      setRawBlob(null);
    };
  }, [isOpen, doc]);

  if (!doc) return null;

  const isPdf =
    doc.contentType === "application/pdf" || doc.originalFilename.endsWith(".pdf");
  const isImage =
    doc.contentType.startsWith("image/") ||
    doc.originalFilename.match(/\.(png|jpe?g|webp)$/i);

  const validDetections = detections.filter(
    (d) => Array.isArray(d.bbox_xyxy) && d.bbox_xyxy.length === 4
  );
  const hasDetections = validDetections.length > 0;

  const handleDownload = () => {
    if (rawBlob) {
      triggerFileDownload(rawBlob, doc.originalFilename);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Preview: ${doc.originalFilename}`}
      description={`${formatBytes(doc.fileSizeBytes)} • ${doc.contentType} • ID: ${doc.id}`}
      size="full"
      footer={
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 w-full">
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-400 font-mono">
              Status: <span className="text-slate-200 font-bold">{doc.status}</span>
            </span>

            {isImage && hasDetections && (
              <button
                type="button"
                onClick={() => setShowOverlay(!showOverlay)}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono font-semibold transition-all border ${
                  showOverlay
                    ? "bg-cyan-500/15 border-cyan-500/40 text-cyan-300"
                    : "bg-slate-900 border-slate-700 text-slate-400 hover:text-slate-200"
                }`}
              >
                <Cpu className="w-3.5 h-3.5" />
                {showOverlay ? (
                  <>
                    <EyeOff className="w-3 h-3" /> Hide BBoxes ({validDetections.length})
                  </>
                ) : (
                  <>
                    <Eye className="w-3 h-3" /> Show BBoxes ({validDetections.length})
                  </>
                )}
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onClose}>
              Close
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleDownload}
              icon={<Download className="w-4 h-4" />}
            >
              Download Original
            </Button>
          </div>
        </div>
      }
    >
      <div className="min-h-[400px] flex items-center justify-center bg-slate-950/80 rounded-xl border border-slate-800/80 p-2 overflow-hidden">
        {loading && (
          <div className="flex flex-col items-center gap-3 text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
            <p className="text-xs font-mono">Loading file stream from backend...</p>
          </div>
        )}

        {error && (
          <div className="flex flex-col items-center gap-3 text-center p-6 max-w-md">
            <AlertCircle className="w-10 h-10 text-rose-400" />
            <h4 className="text-sm font-bold text-rose-300">Preview Unavailable</h4>
            <p className="text-xs text-slate-400">{error}</p>
            <Button variant="secondary" size="sm" onClick={handleDownload} className="mt-2">
              Try Direct Download
            </Button>
          </div>
        )}

        {!loading && !error && blobUrl && (
          <>
            {isImage ? (
              <div className="max-h-[65vh] overflow-auto flex items-center justify-center p-2 w-full">
                {showOverlay && hasDetections ? (
                  <BoundingBoxOverlay
                    imageSrc={blobUrl}
                    detections={validDetections}
                  />
                ) : (
                  <img
                    src={blobUrl}
                    alt={doc.originalFilename}
                    className="max-h-[60vh] max-w-full object-contain rounded-lg shadow-lg border border-slate-800"
                  />
                )}
              </div>
            ) : isPdf ? (
              <div className="w-full h-[65vh] flex flex-col">
                <iframe
                  src={`${blobUrl}#toolbar=0`}
                  title={doc.originalFilename}
                  className="w-full flex-1 rounded-lg border border-slate-800 bg-white"
                />
                <div className="mt-2 text-center text-xs text-slate-400">
                  <span>If PDF preview does not render in your browser, </span>
                  <button
                    onClick={handleDownload}
                    className="text-cyan-400 underline font-medium hover:text-cyan-300"
                  >
                    click here to download
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3 text-center p-8">
                <FileText className="w-12 h-12 text-cyan-400" />
                <h4 className="text-sm font-semibold text-slate-200">
                  Binary Preview Not Supported for this Format
                </h4>
                <p className="text-xs text-slate-400">
                  Content-Type: {doc.contentType}
                </p>
                <Button variant="primary" size="sm" onClick={handleDownload} className="mt-2">
                  Download File
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </Modal>
  );
};
