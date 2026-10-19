import { apiClient, unwrapApiResponse } from "./client";

/**
 * Fetch health of Java backend and Python ML service connectivity
 * GET /api/health
 */
export async function getHealth() {
  const response = await apiClient.get("/health");
  return unwrapApiResponse(response);
}

/**
 * List all blueprint documents
 * GET /api/documents
 */
export async function getDocuments() {
  const response = await apiClient.get("/documents");
  return unwrapApiResponse(response);
}

/**
 * Get single blueprint document details by ID
 * GET /api/documents/{id}
 */
export async function getDocument(id) {
  const response = await apiClient.get(`/documents/${id}`);
  return unwrapApiResponse(response);
}

/**
 * Upload a blueprint/circuit file (PDF, PNG, JPG, JPEG)
 * POST /api/documents/upload
 * Content-Type: multipart/form-data (browser auto-sets boundary)
 * Field name: "file"
 */
export async function uploadDocument(file, onProgress) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await apiClient.post(
    "/documents/upload",
    formData,
    {
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total && onProgress) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percentCompleted);
        }
      },
    }
  );

  return unwrapApiResponse(response);
}

/**
 * Trigger analysis on a document
 * POST /api/documents/{id}/analyze
 */
export async function analyzeDocument(id) {
  const response = await apiClient.post(`/documents/${id}/analyze`);
  return unwrapApiResponse(response);
}

/**
 * Download original uploaded file as Blob
 * GET /api/documents/{id}/download
 */
export async function downloadDocument(id) {
  const response = await apiClient.get(`/documents/${id}/download`, {
    responseType: "blob",
  });
  return response.data;
}

/**
 * Get historical analysis records for a document
 * GET /api/documents/{id}/records
 */
export async function getAnalysisRecords(id) {
  const response = await apiClient.get(`/documents/${id}/records`);
  return unwrapApiResponse(response);
}

/**
 * Delete a document and its stored file
 * DELETE /api/documents/{id}
 */
export async function deleteDocument(id) {
  await apiClient.delete(`/documents/${id}`);
}
