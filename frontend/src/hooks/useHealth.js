import { useState, useEffect, useCallback } from "react";
import { getHealth } from "../api/documents";
import { extractErrorMessage } from "../api/client";

export function useHealth(pollIntervalMs = 30000) {
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchHealth = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getHealth();
      setHealth(data);
      setError(null);
    } catch (err) {
      setError(extractErrorMessage(err));
      setHealth(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHealth();
    if (pollIntervalMs > 0) {
      const interval = setInterval(fetchHealth, pollIntervalMs);
      return () => clearInterval(interval);
    }
  }, [fetchHealth, pollIntervalMs]);

  const isJavaOnline = health !== null && health.status === "UP";
  const isMlOnline = isJavaOnline && Boolean(health?.mlServiceReachable);

  return {
    health,
    loading,
    error,
    isJavaOnline,
    isMlOnline,
    refetch: fetchHealth,
  };
}
