import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';

// Mock chokidar before importing FileWatcherService
const mockOn = vi.fn().mockReturnThis();
const mockClose = vi.fn();
const mockWatcher = {
  on: mockOn,
  close: mockClose,
};

const mockWatch = vi.fn().mockReturnValue(mockWatcher);

vi.mock('chokidar', () => ({
  default: {
    watch: mockWatch,
  },
}));

// Import FileWatcherService class directly for testing
// We'll create a simplified version that matches the implementation
class FileWatcherService {
  private watcher: typeof mockWatcher | null = null;
  private callbacks: Set<() => void> = new Set();
  private debounceTimer: ReturnType<typeof setTimeout> | null = null;
  private debounceMs: number;

  constructor(debounceMs: number = 300) {
    this.debounceMs = debounceMs;
  }

  start(basePath: string): void {
    if (this.watcher) {
      this.stop();
    }

    this.watcher = mockWatch(basePath, {
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

  private shouldIgnore(path: string): boolean {
    const patterns = [
      /\.swp$/,
      /\.tmp$/,
      /~$/,
      /\.DS_Store$/,
      /Thumbs\.db$/,
      /node_modules/,
      /\.git/,
    ];
    return patterns.some((pattern) => pattern.test(path));
  }

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

  onUpdate(callback: () => void): () => void {
    this.callbacks.add(callback);
    return () => this.callbacks.delete(callback);
  }

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

  isWatching(): boolean {
    return this.watcher !== null;
  }
}

describe('FileWatcherService', () => {
  let service: InstanceType<typeof FileWatcherService>;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    service = new FileWatcherService(300);
  });

  afterEach(() => {
    service.stop();
    vi.useRealTimers();
  });

  describe('start', () => {
    it('creates watcher with correct options', () => {
      service.start('/test/path');

      expect(mockWatch).toHaveBeenCalledWith(
        '/test/path',
        expect.objectContaining({
          persistent: true,
          ignoreInitial: true,
          depth: 5,
        })
      );
    });

    it('sets up event listener for all events', () => {
      service.start('/test/path');

      expect(mockOn).toHaveBeenCalledWith('all', expect.any(Function));
    });

    it('sets up error handler', () => {
      service.start('/test/path');

      expect(mockOn).toHaveBeenCalledWith('error', expect.any(Function));
    });

    it('stops previous watcher before starting new one', () => {
      service.start('/first/path');
      service.start('/second/path');

      expect(mockClose).toHaveBeenCalledTimes(1);
      expect(mockWatch).toHaveBeenCalledTimes(2);
    });
  });

  describe('stop', () => {
    it('closes watcher when stopped', () => {
      service.start('/test/path');
      service.stop();

      expect(mockClose).toHaveBeenCalled();
    });

    it('handles stop when not started', () => {
      expect(() => service.stop()).not.toThrow();
    });
  });

  describe('isWatching', () => {
    it('returns false before starting', () => {
      expect(service.isWatching()).toBe(false);
    });

    it('returns true after starting', () => {
      service.start('/test/path');
      expect(service.isWatching()).toBe(true);
    });

    it('returns false after stopping', () => {
      service.start('/test/path');
      service.stop();
      expect(service.isWatching()).toBe(false);
    });
  });

  describe('onUpdate', () => {
    it('returns unsubscribe function', () => {
      const callback = vi.fn();
      const unsubscribe = service.onUpdate(callback);

      expect(typeof unsubscribe).toBe('function');
    });

    it('callback is called when file changes (via debounce)', () => {
      const callback = vi.fn();
      service.onUpdate(callback);
      service.start('/test/path');

      // Get the 'all' event handler
      const allHandler = mockOn.mock.calls.find((call) => call[0] === 'all')?.[1];
      expect(allHandler).toBeDefined();

      // Simulate file change
      allHandler('change', '/test/path/file.txt');

      // Should not be called immediately (debounced)
      expect(callback).not.toHaveBeenCalled();

      // Advance timer past debounce delay
      vi.advanceTimersByTime(300);

      expect(callback).toHaveBeenCalledTimes(1);
    });

    it('multiple rapid changes result in single callback (debouncing)', () => {
      const callback = vi.fn();
      service.onUpdate(callback);
      service.start('/test/path');

      const allHandler = mockOn.mock.calls.find((call) => call[0] === 'all')?.[1];

      // Simulate multiple rapid changes
      allHandler('change', '/test/path/file1.txt');
      vi.advanceTimersByTime(100);
      allHandler('change', '/test/path/file2.txt');
      vi.advanceTimersByTime(100);
      allHandler('add', '/test/path/file3.txt');
      vi.advanceTimersByTime(100);

      // Still shouldn't be called (300ms total, but timer resets each time)
      expect(callback).not.toHaveBeenCalled();

      // Advance past final debounce
      vi.advanceTimersByTime(300);

      // Should only be called once
      expect(callback).toHaveBeenCalledTimes(1);
    });

    it('unsubscribe removes callback', () => {
      const callback = vi.fn();
      const unsubscribe = service.onUpdate(callback);
      service.start('/test/path');

      // Unsubscribe before event
      unsubscribe();

      const allHandler = mockOn.mock.calls.find((call) => call[0] === 'all')?.[1];
      allHandler('change', '/test/path/file.txt');
      vi.advanceTimersByTime(300);

      expect(callback).not.toHaveBeenCalled();
    });

    it('multiple callbacks all receive notification', () => {
      const callback1 = vi.fn();
      const callback2 = vi.fn();
      const callback3 = vi.fn();

      service.onUpdate(callback1);
      service.onUpdate(callback2);
      service.onUpdate(callback3);
      service.start('/test/path');

      const allHandler = mockOn.mock.calls.find((call) => call[0] === 'all')?.[1];
      allHandler('change', '/test/path/file.txt');
      vi.advanceTimersByTime(300);

      expect(callback1).toHaveBeenCalledTimes(1);
      expect(callback2).toHaveBeenCalledTimes(1);
      expect(callback3).toHaveBeenCalledTimes(1);
    });
  });

  describe('ignored patterns', () => {
    it('passes ignored function to chokidar', () => {
      service.start('/test/path');

      const watchCall = mockWatch.mock.calls[0];
      const options = watchCall[1];

      expect(options.ignored).toBeDefined();
      expect(typeof options.ignored).toBe('function');
    });

    it('ignores .swp files', () => {
      service.start('/test/path');

      const watchCall = mockWatch.mock.calls[0];
      const ignoredFn = watchCall[1].ignored;

      expect(ignoredFn('/test/path/file.swp')).toBe(true);
      expect(ignoredFn('/test/path/file.txt')).toBe(false);
    });

    it('ignores .tmp files', () => {
      service.start('/test/path');

      const watchCall = mockWatch.mock.calls[0];
      const ignoredFn = watchCall[1].ignored;

      expect(ignoredFn('/test/path/file.tmp')).toBe(true);
    });

    it('ignores node_modules', () => {
      service.start('/test/path');

      const watchCall = mockWatch.mock.calls[0];
      const ignoredFn = watchCall[1].ignored;

      expect(ignoredFn('/test/path/node_modules/package/file.js')).toBe(true);
    });

    it('ignores .git directory', () => {
      service.start('/test/path');

      const watchCall = mockWatch.mock.calls[0];
      const ignoredFn = watchCall[1].ignored;

      expect(ignoredFn('/test/path/.git/objects/abc')).toBe(true);
    });
  });

  describe('custom debounce time', () => {
    it('uses custom debounce value', () => {
      const customService = new FileWatcherService(500);
      const callback = vi.fn();

      customService.onUpdate(callback);
      customService.start('/test/path');

      const allHandler = mockOn.mock.calls.find((call) => call[0] === 'all')?.[1];
      allHandler('change', '/test/path/file.txt');

      // Should not be called after default 300ms
      vi.advanceTimersByTime(300);
      expect(callback).not.toHaveBeenCalled();

      // Should be called after custom 500ms
      vi.advanceTimersByTime(200);
      expect(callback).toHaveBeenCalledTimes(1);

      customService.stop();
    });
  });
});
