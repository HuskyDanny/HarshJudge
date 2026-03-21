import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from 'react';
import { fileWatcher } from '@/services/FileWatcherService';

interface FileWatcherContextValue {
  /** Timestamp of the last detected file change */
  lastUpdate: Date | null;
  /** Manually trigger a refresh */
  triggerRefresh: () => void;
  /** Whether the watcher is currently active */
  isWatching: boolean;
}

const FileWatcherContext = createContext<FileWatcherContextValue | null>(null);

interface FileWatcherProviderProps {
  /** Base path to watch for changes */
  basePath: string;
  /** Child components */
  children: ReactNode;
}

/**
 * Provider component that starts file watching and notifies consumers of changes
 */
export function FileWatcherProvider({
  basePath,
  children,
}: FileWatcherProviderProps) {
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [isWatching, setIsWatching] = useState(false);

  useEffect(() => {
    // Start watching
    fileWatcher.start(basePath);
    setIsWatching(true);

    // Subscribe to updates
    const unsubscribe = fileWatcher.onUpdate(() => {
      setLastUpdate(new Date());
    });

    // Cleanup on unmount
    return () => {
      unsubscribe();
      fileWatcher.stop();
      setIsWatching(false);
    };
  }, [basePath]);

  const triggerRefresh = useCallback(() => {
    setLastUpdate(new Date());
  }, []);

  return (
    <FileWatcherContext.Provider value={{ lastUpdate, triggerRefresh, isWatching }}>
      {children}
    </FileWatcherContext.Provider>
  );
}

/**
 * Hook to access file watcher state
 * Must be used within a FileWatcherProvider
 */
export function useFileWatcher(): FileWatcherContextValue {
  const context = useContext(FileWatcherContext);

  if (!context) {
    throw new Error('useFileWatcher must be used within a FileWatcherProvider');
  }

  return context;
}

/**
 * Optional hook that returns null when not in a provider
 * Useful for components that may or may not have file watching
 */
export function useFileWatcherOptional(): FileWatcherContextValue | null {
  return useContext(FileWatcherContext);
}
