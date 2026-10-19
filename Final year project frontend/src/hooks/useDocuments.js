import { useState, useEffect, useCallback, useMemo } from "react";
import { getDocuments } from "../api/documents";
import { extractErrorMessage } from "../api/client";

export function useDocuments() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [filterOptions, setFilterOptions] = useState({
    searchQuery: "",
    statusFilter: "ALL",
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  const fetchDocuments = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getDocuments();
      setDocuments(data || []);
      setError(null);
    } catch (err) {
      setError(extractErrorMessage(err));
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  // Compute filtered & sorted documents
  const filteredDocuments = useMemo(() => {
    return documents
      .filter((doc) => {
        // Search by original filename or ID
        if (filterOptions.searchQuery.trim() !== "") {
          const query = filterOptions.searchQuery.toLowerCase();
          const matchName = doc.originalFilename?.toLowerCase().includes(query);
          const matchId = doc.id?.toLowerCase().includes(query);
          if (!matchName && !matchId) return false;
        }

        // Filter by status
        if (filterOptions.statusFilter !== "ALL") {
          if (doc.status !== filterOptions.statusFilter) return false;
        }

        return true;
      })
      .sort((a, b) => {
        let comp = 0;
        if (filterOptions.sortBy === "createdAt") {
          comp = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        } else if (filterOptions.sortBy === "originalFilename") {
          comp = (a.originalFilename || "").localeCompare(b.originalFilename || "");
        } else if (filterOptions.sortBy === "fileSizeBytes") {
          comp = (b.fileSizeBytes || 0) - (a.fileSizeBytes || 0);
        }

        return filterOptions.sortOrder === "asc" ? -comp : comp;
      });
  }, [documents, filterOptions]);

  // Real aggregate statistics calculated strictly from retrieved documents
  const stats = useMemo(() => {
    return {
      total: documents.length,
      completed: documents.filter((d) => d.status === "COMPLETED").length,
      pending: documents.filter((d) => d.status === "PENDING_ANALYSIS").length,
      analyzing: documents.filter((d) => d.status === "ANALYZING").length,
      failed: documents.filter((d) => d.status === "FAILED").length,
      uploaded: documents.filter((d) => d.status === "UPLOADED").length,
    };
  }, [documents]);

  const updateFilter = useCallback((updates) => {
    setFilterOptions((prev) => ({ ...prev, ...updates }));
  }, []);

  return {
    documents: filteredDocuments,
    allDocuments: documents,
    stats,
    loading,
    error,
    filterOptions,
    updateFilter,
    refreshDocuments: fetchDocuments,
  };
}
