import React, { useState, useRef, useCallback } from "react";
import {
  UploadCloud,
  FileText,
  Image as ImageIcon,
  CheckCircle2,
  AlertTriangle,
  X,
  ArrowRight,
} from "lucide-react";
import { uploadDocument } from "../../api/documents";
import { MAX_FILE_SIZE_BYTES, ALLOWED_FILE_TYPES, ALLOWED_EXTENSIONS } from "../../lib/constants";
import { formatBytes, cn } from "../../lib/utils";
import { extractErrorMessage } from "../../api/client";
import { useToast } from "../../context/ToastContext";
import { Button } from "../common/Button";

export const UploadDropzone = ({
  onUploadSuccess = null,
  className = "",
}) => {
  const { showToast } = useToast();
  const fileInputRef = useRef(null);

  const [selectedFile, setSelectedFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedDoc, setUploadedDoc] = useState(null);
  const [validationError, setValidationError] = useState(null);

  const validateFile = (file) => {
    setValidationError(null);

    // Validate size (50MB)
    if (file.size > MAX_FILE_SIZE_BYTES) {
      const err = `File size (${formatBytes(file.size)}) exceeds the maximum allowed limit of 50 MB.`;
      setValidationError(err);
      showToast("error", "File Too Large", err);
      return false;
    }

    // Validate mime/extension
    const ext = "." + file.name.split(".").pop()?.toLowerCase();
    const isAllowedExt = ALLOWED_EXTENSIONS.includes(ext);
    const isAllowedMime = ALLOWED_FILE_TYPES.includes(file.type);

    if (!isAllowedExt && !isAllowedMime) {
      const err = `Invalid file format "${file.type || ext}". Only PDF, PNG, JPG, and JPEG files are supported.`;
      setValidationError(err);
      showToast("error", "Unsupported File Type", err);
      return false;
    }

    return true;
  };

  const handleFileSelection = (file) => {
    if (validateFile(file)) {
      setSelectedFile(file);
      setUploadedDoc(null);
      setUploadProgress(0);
    }
  };

  const onDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const onDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelection(e.dataTransfer.files[0]);
    }
  }, []);

  const handleInputChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileSelection(e.target.files[0]);
    }
  };

  const clearSelection = () => {
    setSelectedFile(null);
    setValidationError(null);
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || isUploading) return;

    try {
      setIsUploading(true);
      setUploadProgress(0);

      const createdDoc = await uploadDocument(selectedFile, (percent) => {
        setUploadProgress(percent);
      });

      setUploadedDoc(createdDoc);
      showToast(
        "success",
        "Upload Successful",
        `"${createdDoc.originalFilename}" uploaded successfully. Assigned UUID: ${createdDoc.id}`
      );

      if (onUploadSuccess) {
        onUploadSuccess(createdDoc);
      }
    } catch (err) {
      const errorMsg = extractErrorMessage(err);
      setValidationError(errorMsg);
      showToast("error", "Upload Failed", errorMsg);
    } finally {
      setIsUploading(false);
    }
  };

  const getFileIcon = (file) => {
    if (file.type === "application/pdf" || file.name.endsWith(".pdf")) {
      return <FileText className="w-8 h-8 text-rose-400" />;
    }
    return <ImageIcon className="w-8 h-8 text-cyan-400" />;
  };

  return (
    <div
      className={cn(
        "relative rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-xl p-6 transition-all duration-300 shadow-xl",
        isDragging && "border-cyan-500 bg-cyan-950/20 ring-2 ring-cyan-500/30",
        className
      )}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.png,.jpg,.jpeg,application/pdf,image/png,image/jpeg"
        onChange={handleInputChange}
        className="hidden"
        id="blueprint-file-input"
        disabled={isUploading}
      />

      {!selectedFile && !uploadedDoc ? (
        <div
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          onClick={() => fileInputRef.current?.click()}
          className="cursor-pointer border-2 border-dashed border-slate-700/80 hover:border-cyan-500/70 rounded-xl p-8 flex flex-col items-center justify-center text-center transition-all group bg-slate-950/30 hover:bg-slate-950/60"
        >
          <div className="w-14 h-14 rounded-2xl bg-slate-800/80 border border-slate-700/80 flex items-center justify-center text-cyan-400 group-hover:scale-110 group-hover:bg-cyan-950/40 group-hover:border-cyan-500/40 transition-all shadow-inner">
            <UploadCloud className="w-7 h-7" />
          </div>
          <h4 className="mt-4 text-base font-bold text-slate-100 group-hover:text-cyan-300 transition-colors">
            Upload Engineering Blueprint or Circuit Diagram
          </h4>
          <p className="mt-1.5 text-xs text-slate-400 max-w-sm">
            Drag and drop your PDF or schematic image file here, or click to browse.
          </p>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-slate-800 text-slate-300 border border-slate-700">
              PDF
            </span>
            <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-slate-800 text-slate-300 border border-slate-700">
              PNG
            </span>
            <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-slate-800 text-slate-300 border border-slate-700">
              JPG / JPEG
            </span>
            <span className="text-slate-500 text-xs">•</span>
            <span className="text-[11px] text-slate-400">Max size 50 MB</span>
          </div>
        </div>
      ) : selectedFile && !uploadedDoc ? (
        <div className="space-y-4">
          <div className="flex items-start justify-between p-4 rounded-xl border border-slate-800 bg-slate-950/60">
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 shrink-0">
                {getFileIcon(selectedFile)}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-100 truncate" title={selectedFile.name}>
                  {selectedFile.name}
                </p>
                <div className="flex items-center gap-2 mt-1 text-xs text-slate-400 font-mono">
                  <span>{formatBytes(selectedFile.size)}</span>
                  <span>•</span>
                  <span>{selectedFile.type || "Document"}</span>
                </div>
              </div>
            </div>

            {!isUploading && (
              <button
                onClick={clearSelection}
                className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
                title="Remove selected file"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Upload Progress Bar */}
          {isUploading && (
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-mono text-slate-300">
                <span>Uploading to Java backend...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Validation or Upload Error Banner */}
          {validationError && (
            <div className="flex items-start gap-2.5 p-3 rounded-lg border border-rose-500/30 bg-rose-950/20 text-rose-300 text-xs">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{validationError}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={clearSelection}
              disabled={isUploading}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleUpload}
              loading={isUploading}
              icon={<UploadCloud className="w-4 h-4" />}
            >
              Upload to Backend
            </Button>
          </div>
        </div>
      ) : uploadedDoc ? (
        /* Upload Success State with Returned Document UUID */
        <div className="p-5 rounded-xl border border-emerald-500/40 bg-emerald-950/20 text-slate-200 space-y-4 animate-in fade-in">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h5 className="text-sm font-bold text-emerald-300">
                  Upload Complete & Document Registered
                </h5>
                <p className="text-xs text-slate-300 mt-0.5">
                  {uploadedDoc.originalFilename}
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                setUploadedDoc(null);
                setSelectedFile(null);
              }}
              className="text-slate-400 hover:text-white p-1"
              title="Upload another file"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="bg-slate-950/80 rounded-lg p-3 border border-slate-800 text-xs space-y-1.5 font-mono">
            <div className="flex items-center justify-between text-slate-400">
              <span>Document UUID:</span>
              <span className="text-cyan-400 select-all font-semibold">
                {uploadedDoc.id}
              </span>
            </div>
            <div className="flex items-center justify-between text-slate-400">
              <span>Status:</span>
              <span className="text-blue-400 font-semibold">{uploadedDoc.status}</span>
            </div>
            <div className="flex items-center justify-between text-slate-400">
              <span>Size:</span>
              <span className="text-slate-200">{formatBytes(uploadedDoc.fileSizeBytes)}</span>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-1">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setUploadedDoc(null);
                setSelectedFile(null);
              }}
            >
              Upload Another
            </Button>
            <a
              href={`/documents/${uploadedDoc.id}`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white transition-colors"
            >
              View Document & Analyze <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      ) : null}
    </div>
  );
};
