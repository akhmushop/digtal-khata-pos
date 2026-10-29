import { useState, useEffect, useCallback, useRef } from "react";
import type { AxiosResponse } from "axios";

interface UseReportDataResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useReportData<T>(
  fetcher: () => Promise<AxiosResponse<{ success: boolean; data: T }>>,
  deps: unknown[] = []
): UseReportDataResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const requestId = useRef(0);

  const fetch = useCallback(async () => {
    const id = ++requestId.current;
    setLoading(true);
    setError(null);
    try {
      const response = await fetcher();
      if (requestId.current !== id) return;
      setData(response.data.data);
    } catch (err: unknown) {
      if (requestId.current !== id) return;
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load report data from server"
      );
    } finally {
      if (requestId.current === id) setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    void fetch();
  }, [fetch]);

  return { data, loading, error, refetch: fetch };
}

