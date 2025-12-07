import { useState, useEffect, useCallback, useMemo } from 'react';
import { ApiDataService } from '@/services/ApiDataService';
import { useFileWatcherOptional } from '@/contexts/FileWatcherContext';
import type { ScenarioSummary } from '@harshjudge/shared';

interface UseScenariosResult {
  scenarios: ScenarioSummary[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useScenarios(projectPath: string | null): UseScenariosResult {
  const [scenarios, setScenarios] = useState<ScenarioSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileWatcher = useFileWatcherOptional();
  const dataService = useMemo(() => new ApiDataService(), []);

  const fetchScenarios = useCallback(async () => {
    if (!projectPath) {
      setScenarios([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await dataService.getScenarios(projectPath);
      setScenarios(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load scenarios');
      setScenarios([]);
    } finally {
      setLoading(false);
    }
  }, [dataService, projectPath]);

  // Initial fetch and refetch on projectPath change
  useEffect(() => {
    fetchScenarios();
  }, [fetchScenarios]);

  // Refetch when file watcher detects changes
  useEffect(() => {
    if (fileWatcher?.lastUpdate) {
      fetchScenarios();
    }
  }, [fileWatcher?.lastUpdate, fetchScenarios]);

  return {
    scenarios,
    loading,
    error,
    refetch: fetchScenarios,
  };
}
