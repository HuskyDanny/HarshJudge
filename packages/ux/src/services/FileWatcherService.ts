import chokidar, { type FSWatcher } from 'chokidar';

/**
 * Ignored file patterns for file watching
 */
const IGNORED_PATTERNS = [
  /\.swp$/,           // Vim swap files
  /\.tmp$/,           // Temp files
  /~$/,               // Backup files
  /\.DS_Store$/,      // macOS
  /Thumbs\.db$/,      // Windows
  /node_modules/,     // Dependencies
  /\.git/,            // Git directory
];

/**
 * Service for watching file system changes with debouncing
 */
export class FileWatcherService {
  private watcher: FSWatcher | null = null;
  private callbacks: Set<() => void> = new Set();
  private debounceTimer: ReturnType<typeof setTimeout> | null = null;
  private debounceMs: number;

  constructor(debounceMs: number = 300) {
    this.debounceMs = debounceMs;
  }

  /**
   * Start watching a directory for changes
   */
  start(basePath: string): void {
    if (this.watcher) {
      this.stop();
    }

    this.watcher = chokidar.watch(basePath, {
      ignored: (path: string) => this.shouldIgnore(path),
      persistent: true,
      ignoreInitial: true,
      depth: 5,
      awaitWriteFinish: {
        stabilityThreshold: 100,
        pollInterval: 50,
      },
    });

    this.watcher.on('all', (_event: string, _path: string) => {
      this.debouncedNotify();
    });

    this.watcher.on('error', (error: Error) => {
      console.error('FileWatcher error:', error);
    });
  }

  /**
   * Check if a path should be ignored
   */
  private shouldIgnore(path: string): boolean {
    return IGNORED_PATTERNS.some((pattern) => pattern.test(path));
  }

  /**
   * Notify callbacks with debouncing
   */
  private debouncedNotify(): void {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }

    this.debounceTimer = setTimeout(() => {
      this.callbacks.forEach((cb) => {
        try {
          cb();
        } catch (error) {
          console.error('FileWatcher callback error:', error);
        }
      });
    }, this.debounceMs);
  }

  /**
   * Subscribe to file change notifications
   * @returns Unsubscribe function
   */
  onUpdate(callback: () => void): () => void {
    this.callbacks.add(callback);
    return () => this.callbacks.delete(callback);
  }

  /**
   * Stop watching and clean up
   */
  stop(): void {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
    }

    if (this.watcher) {
      this.watcher.close();
      this.watcher = null;
    }
  }

  /**
   * Check if watcher is currently active
   */
  isWatching(): boolean {
    return this.watcher !== null;
  }
}

// Default singleton instance
export const fileWatcher = new FileWatcherService();
