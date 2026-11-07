import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  FileText,
  Image as ImageIcon,
  Download,
  Play,
  Trash2,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  FolderOpen,
} from "lucide-react";
import { formatBytes, formatDateTime } from "../../lib/utils";
import { StatusPill } from "../common/StatusPill";
import { Button } from "../common/Button";
import { DocumentCard } from "./DocumentCard";

export const DocumentTable = ({
  documents = [],
  onAnalyze = null,
  onDownload = null,
  onDelete = null,
  analyzingId = null,
  pageSize = 10,
}) => {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(documents.length / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedDocs = documents.slice(startIndex, startIndex + pageSize);

  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(1, prev - 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(totalPages, prev + 1));
  };

  if (documents.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-12 text-center flex flex-col items-center justify-center">
        <div className="w-12 h-12 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-500 mb-4">
          <FolderOpen className="w-6 h-6" />
        </div>
        <h4 className="text-base font-bold text-slate-200">No Blueprint Documents Found</h4>
        <p className="mt-1 text-xs text-slate-400 max-w-sm">
          No engineering schematics match your current query. Upload a new file or clear your filters to view documents.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Mobile Card Grid (below md) */}
      <div className="grid grid-cols-1 gap-3 md:hidden">
        {paginatedDocs.map((doc) => (
          <DocumentCard
            key={doc.id}
            document={doc}
            onAnalyze={onAnalyze}
            onDownload={onDownload}
            onDelete={onDelete}
            isAnalyzing={analyzingId === doc.id}
          />
        ))}
      </div>

      {/* Desktop Table (md and above) */}
      <div className="hidden md:block rounded-xl border border-slate-800 bg-slate-900/40 backdrop-blur-md overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-950/80 text-xs uppercase font-semibold text-slate-400 border-b border-slate-800 tracking-wider">
              <tr>
                <th scope="col" className="px-5 py-3.5">
                  Blueprint / Circuit Name
                </th>
                <th scope="col" className="px-4 py-3.5">
                  Type
                </th>
                <th scope="col" className="px-4 py-3.5">
                  File Size
                </th>
                <th scope="col" className="px-4 py-3.5">
                  Uploaded Date
                </th>
                <th scope="col" className="px-4 py-3.5">
                  Last Updated
                </th>
                <th scope="col" className="px-4 py-3.5">
                  Status
                </th>
                <th scope="col" className="px-5 py-3.5 text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-xs">
              {paginatedDocs.map((doc) => {
                const isPdf =
                  doc.contentType === "application/pdf" ||
                  doc.originalFilename.endsWith(".pdf");
                const isAnalyzing = analyzingId === doc.id;

                return (
                  <tr
                    key={doc.id}
                    className="hover:bg-slate-800/40 transition-colors group"
                  >
                    {/* Original Filename & UUID */}
                    <td className="px-5 py-3.5 max-w-xs">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-slate-800/80 border border-slate-700/80 shrink-0">
                          {isPdf ? (
                            <FileText className="w-4 h-4 text-rose-400" />
                          ) : (
                            <ImageIcon className="w-4 h-4 text-cyan-400" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <Link
                            to={`/documents/${doc.id}`}
                            className="font-sans font-semibold text-slate-100 hover:text-cyan-400 transition-colors truncate block text-sm"
                            title={doc.originalFilename}
                          >
                            {doc.originalFilename}
                          </Link>
                          <span
                            className="text-[11px] text-slate-400 truncate block select-all"
                            title={doc.id}
                          >
                            {doc.id}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* File Type */}
                    <td className="px-4 py-3.5 text-slate-300">
                      <span className="px-2 py-0.5 rounded bg-slate-800/90 border border-slate-700 text-[11px]">
                        {isPdf ? "PDF Document" : "Raster Image"}
                      </span>
                    </td>

                    {/* File Size */}
                    <td className="px-4 py-3.5 text-slate-300">
                      {formatBytes(doc.fileSizeBytes)}
                    </td>

                    {/* Upload Date */}
                    <td
                      className="px-4 py-3.5 text-slate-400 font-sans text-xs"
                      title={doc.createdAt}
                    >
                      {formatDateTime(doc.createdAt)}
                    </td>

                    {/* Last Updated Date */}
                    <td
                      className="px-4 py-3.5 text-slate-400 font-sans text-xs"
                      title={doc.updatedAt}
                    >
                      {formatDateTime(doc.updatedAt)}
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3.5">
                      <StatusPill status={doc.status} />
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* View Details Page */}
                        <Link
                          to={`/documents/${doc.id}`}
                          className="p-1.5 text-slate-400 hover:text-cyan-400 hover:bg-slate-800 rounded-lg transition-colors border border-transparent hover:border-slate-700"
                          title="View Document Details & Analysis"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Link>

                        {/* Download Binary */}
                        {onDownload && (
                          <button
                            onClick={() => onDownload(doc)}
                            className="p-1.5 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-lg transition-colors border border-transparent hover:border-slate-700"
                            title="Download original file"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                        )}

                        {/* Trigger Analysis */}
                        {onAnalyze && (
                          <Button
                            variant="outline"
                            size="sm"
                            loading={isAnalyzing}
                            onClick={() => onAnalyze(doc.id)}
                            icon={<Play className="w-3.5 h-3.5 text-cyan-400" />}
                            className="h-8 px-2 text-xs"
                          >
                            Analyze
                          </Button>
                        )}

                        {/* Delete with confirmation */}
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
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-2 py-3 text-xs text-slate-400">
          <div>
            Showing <span className="font-semibold text-slate-200">{startIndex + 1}</span> to{" "}
            <span className="font-semibold text-slate-200">
              {Math.min(startIndex + pageSize, documents.length)}
            </span>{" "}
            of <span className="font-semibold text-slate-200">{documents.length}</span> documents
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-slate-800 bg-slate-900 text-slate-300 disabled:opacity-40 disabled:pointer-events-none hover:bg-slate-800 transition-colors"
              aria-label="Previous page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 py-1 font-mono text-slate-200 bg-slate-900 border border-slate-800 rounded-lg">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-slate-800 bg-slate-900 text-slate-300 disabled:opacity-40 disabled:pointer-events-none hover:bg-slate-800 transition-colors"
              aria-label="Next page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
