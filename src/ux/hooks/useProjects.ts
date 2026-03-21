import { useState, useEffect, useCallback, useMemo } from 'react';
import { ApiDataService, type ProjectSummary } from '@/services/ApiDataService';
import { useFileWatcherOptional } from '@/contexts/FileWatcherContext';

interface UseProjectsResult {
  projects: ProjectSummary[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useProjects(basePath: string = '.'): UseProjectsResult {
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fileWatcher = useFileWatcherOptional();
  const dataService = useMemo(() => new ApiDataService(), []);

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await dataService.getProjects();
      setProjects(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load projects');
      setProjects([]);
    } finally {
      setLoading(false);
    }
  }, [dataService]);

  // Initial fetch and refetch on basePath change
  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  // Refetch when file watcher detects changes
  useEffect(() => {
    if (fileWatcher?.lastUpdate) {
      fetchProjects();
    }
  }, [fileWatcher?.lastUpdate, fetchProjects]);

  return {
    projects,
    loading,
    error,
    refetch: fetchProjects,
  };
}
