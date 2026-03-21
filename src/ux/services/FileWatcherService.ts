/**
 * Browser-safe FileWatcherService that uses polling instead of chokidar
 * For server-side file watching, see the server module
 */

/**
 * Service for watching file system changes via polling
 * Works in browser environment without Node.js dependencies
 */
export class FileWatcherService {
  private callbacks: Set<() => void> = new Set();
  private pollInterval: ReturnType<typeof setInterval> | null = null;
  private pollMs: number;
  private isActive: boolean = false;

  constructor(pollMs: number = 3000) {
    this.pollMs = pollMs;
  }

  /**
   * Start polling for changes
   * If pollMs is 0 or negative, auto-polling is disabled
   */
  start(_basePath: string): void {
    if (this.pollInterval) {
      this.stop();
    }

    this.isActive = true;

    // Only start polling if pollMs > 0, otherwise disable auto-refresh
    if (this.pollMs > 0) {
      this.pollInterval = setInterval(() => {
        this.notifyCallbacks();
      }, this.pollMs);
    }
  }

  /**
   * Notify all callbacks
   */
  private notifyCallbacks(): void {
    this.callbacks.forEach((cb) => {
      try {
        cb();
      } catch (error) {
        console.error('FileWatcher callback error:', error);
      }
    });
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
   * Stop polling and clean up
   */
  stop(): void {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }
    this.isActive = false;
  }

  /**
   * Check if watcher is currently active
   */
  isWatching(): boolean {
    return this.isActive;
  }
}

// Default singleton instance - disabled auto-polling (0) to prevent UI flashing
// Users can manually refresh with the triggerRefresh context method
export const fileWatcher = new FileWatcherService(0);
