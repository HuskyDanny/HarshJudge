import { useState, useEffect, useCallback, useMemo } from 'react';
import { ApiDataService, type RunDetail } from '@/services/ApiDataService';
import { useFileWatcherOptional } from '@/contexts/FileWatcherContext';

interface UseRunDetailResult {
  runDetail: RunDetail | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useRunDetail(
  projectPath: string | null,
  scenarioSlug: string | null,
  runId: string | null
): UseRunDetailResult {
  const [runDetail, setRunDetail] = useState<RunDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileWatcher = useFileWatcherOptional();
  const dataService = useMemo(() => new ApiDataService(), []);

  const fetchRunDetail = useCallback(async () => {
    if (!projectPath || !scenarioSlug || !runId) {
      setRunDetail(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await dataService.getRunDetail(projectPath, scenarioSlug, runId);
      setRunDetail(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load run detail');
      setRunDetail(null);
    } finally {
      setLoading(false);
    }
  }, [dataService, projectPath, scenarioSlug, runId]);

  // Initial fetch and refetch on parameters change
  useEffect(() => {
    fetchRunDetail();
  }, [fetchRunDetail]);

  // Refetch when file watcher detects changes
  useEffect(() => {
    if (fileWatcher?.lastUpdate) {
      fetchRunDetail();
    }
  }, [fileWatcher?.lastUpdate, fetchRunDetail]);

  return {
    runDetail,
    loading,
    error,
    refetch: fetchRunDetail,
  };
}
