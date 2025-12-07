import { useState, useEffect, useCallback, useMemo } from 'react';
import { ApiDataService } from '@/services/ApiDataService';
import { useFileWatcherOptional } from '@/contexts/FileWatcherContext';
import type { ScenarioDetail } from '@harshjudge/shared';

interface UseScenarioDetailResult {
  scenarioDetail: ScenarioDetail | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useScenarioDetail(
  projectPath: string | null,
  scenarioSlug: string | null
): UseScenarioDetailResult {
  const [scenarioDetail, setScenarioDetail] = useState<ScenarioDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileWatcher = useFileWatcherOptional();
  const dataService = useMemo(() => new ApiDataService(), []);

  const fetchScenarioDetail = useCallback(async () => {
    if (!projectPath || !scenarioSlug) {
      setScenarioDetail(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await dataService.getScenarioDetail(projectPath, scenarioSlug);
      setScenarioDetail(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load scenario detail');
      setScenarioDetail(null);
    } finally {
      setLoading(false);
    }
  }, [dataService, projectPath, scenarioSlug]);

  // Initial fetch and refetch on parameters change
  useEffect(() => {
    fetchScenarioDetail();
  }, [fetchScenarioDetail]);

  // Refetch when file watcher detects changes
  useEffect(() => {
    if (fileWatcher?.lastUpdate) {
      fetchScenarioDetail();
    }
  }, [fileWatcher?.lastUpdate, fetchScenarioDetail]);

  return {
    scenarioDetail,
    loading,
    error,
    refetch: fetchScenarioDetail,
  };
}
