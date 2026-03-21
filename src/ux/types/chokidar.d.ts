// Type declarations for chokidar
// This file provides type definitions for build when chokidar isn't installed yet

declare module 'chokidar' {
  export interface WatchOptions {
    ignored?: RegExp | string | ((path: string) => boolean);
    persistent?: boolean;
    ignoreInitial?: boolean;
    depth?: number;
    awaitWriteFinish?: boolean | {
      stabilityThreshold?: number;
      pollInterval?: number;
    };
  }

  export interface FSWatcher {
    on(event: 'all', callback: (eventName: string, path: string) => void): this;
    on(event: 'add' | 'change' | 'unlink' | 'addDir' | 'unlinkDir', callback: (path: string) => void): this;
    on(event: 'error', callback: (error: Error) => void): this;
    on(event: 'ready', callback: () => void): this;
    close(): Promise<void>;
  }

  function watch(paths: string | string[], options?: WatchOptions): FSWatcher;

  export default {
    watch,
  };
}
