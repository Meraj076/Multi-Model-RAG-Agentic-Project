import axios from "axios";
import { API_BASE_URL } from "../lib/constants";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000,
  headers: {
    Accept: "application/json",
  },
});

export function extractErrorMessage(error) {
  if (axios.isAxiosError(error)) {
    if (error.response) {
      const data = error.response.data;
      if (data) {
        if (typeof data === "string") return data;
        if (data.message && typeof data.message === "string") return data.message;
        if (data.error && typeof data.error === "string") return data.error;
      }
      return `Server error (${error.response.status}): ${error.response.statusText || "Request failed"}`;
    }
    if (error.code === "ECONNABORTED") {
      return "Request timed out while contacting Java Spring Boot backend.";
    }
    if (error.message === "Network Error") {
      return (
        "Cannot connect to Java Spring Boot backend at " +
        API_BASE_URL +
        ". Ensure the server is running on port 8080."
      );
    }
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "An unknown error occurred.";
}

export function unwrapApiResponse(response) {
  const data = response.data;
  if (data && typeof data === "object" && "success" in data && "data" in data) {
    return data.data;
  }
  return data;
}
