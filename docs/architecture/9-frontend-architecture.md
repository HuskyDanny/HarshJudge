# 9. Frontend Architecture

## 9.1 Component Architecture

### Component Organization
```
packages/ux/src/
├── components/
│   ├── layout/
│   │   ├── Header.tsx
│   │   ├── ThreeColumnLayout.tsx
│   │   └── ResizablePanel.tsx
│   ├── panels/
│   │   ├── ProjectListPanel.tsx
│   │   ├── ScenarioListPanel.tsx
│   │   └── DetailPanel.tsx
│   ├── viewers/
│   │   ├── ScreenshotTimeline.tsx
│   │   ├── ScreenshotViewer.tsx
│   │   ├── LogViewer.tsx
│   │   └── MarkdownRenderer.tsx
│   ├── common/
│   │   ├── StatusBadge.tsx
│   │   ├── EmptyState.tsx
│   │   ├── LoadingSpinner.tsx
│   │   └── ErrorBoundary.tsx
│   └── index.ts
├── hooks/
│   ├── useProjects.ts
│   ├── useScenarios.ts
│   ├── useScenarioDetail.ts
│   ├── useRunDetail.ts
│   ├── useFileWatcher.ts
│   └── useTheme.ts
├── services/
│   ├── FileWatcherService.ts
│   └── DataService.ts
├── types/
│   └── index.ts                # Re-exports from @harshjudge/shared
├── lib/
│   ├── parsers.ts
│   └── formatters.ts
├── styles/
│   └── globals.css
├── App.tsx
└── main.tsx
```

### Component Template
```typescript
// packages/ux/src/components/panels/ProjectListPanel.tsx
import { type FC } from 'react';
import { type ProjectSummary } from '@harshjudge/shared';
import { StatusBadge } from '../common/StatusBadge';
import { EmptyState } from '../common/EmptyState';

interface ProjectListPanelProps {
  projects: ProjectSummary[];
  selectedProject: string | null;
  onSelect: (projectPath: string) => void;
}

export const ProjectListPanel: FC<ProjectListPanelProps> = ({
  projects,
  selectedProject,
  onSelect,
}) => {
  if (projects.length === 0) {
    return (
      <EmptyState
        title="No projects found"
        description="Initialize a project with /harshjudge:setup"
      />
    );
  }

  return (
    <div className="flex flex-col h-full">
      <header className="p-3 border-b border-gray-700">
        <h2 className="text-sm font-medium text-gray-400">
          Projects ({projects.length})
        </h2>
      </header>
      <ul className="flex-1 overflow-y-auto">
        {projects.map((project) => (
          <li
            key={project.path}
            className={`
              p-3 cursor-pointer border-b border-gray-800
              hover:bg-gray-800
              ${selectedProject === project.path ? 'bg-gray-800' : ''}
            `}
            onClick={() => onSelect(project.path)}
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{project.name}</span>
              <StatusBadge status={project.overallStatus} />
            </div>
            <span className="text-xs text-gray-500">
              {project.scenarioCount} scenarios
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};
```

## 9.2 State Management Architecture

### State Structure
```typescript
// packages/ux/src/hooks/useAppState.ts
import { useState, useCallback } from 'react';

interface AppState {
  projects: ProjectSummary[];
  selectedProject: string | null;
  scenarios: ScenarioSummary[];
  selectedScenario: string | null;
  scenarioDetail: ScenarioDetail | null;
  selectedRun: string | null;
  runDetail: RunDetail | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: AppState = {
  projects: [],
  selectedProject: null,
  scenarios: [],
  selectedScenario: null,
  scenarioDetail: null,
  selectedRun: null,
  runDetail: null,
  isLoading: true,
  error: null,
};
```

### State Management Patterns
- **React useState + useReducer:** Simple state, no external library needed
- **Derived State:** Computed from base state, not stored
- **Lift State Up:** App.tsx holds primary state, passes down via props
- **Custom Hooks:** Encapsulate data fetching and subscription logic
- **Optimistic Updates:** Not applicable (read-only dashboard)

## 9.3 Routing Architecture

### Route Organization
```
/ (root)
└── Dashboard (single page app, no routing needed)
```

Since the dashboard is a single-page application with panel-based navigation, no router is required. Selection state is managed via React state.

### URL State Sync (Future Enhancement)
```typescript
// Future: Sync selection to URL for deep linking
// packages/ux/src/hooks/useUrlState.ts
export function useUrlState() {
  // ?project=myapp&scenario=login&run=abc123
}
```

## 9.4 Frontend Services Layer

### File Watcher Setup
```typescript
// packages/ux/src/services/FileWatcherService.ts
import chokidar from 'chokidar';

export class FileWatcherService {
  private watcher: chokidar.FSWatcher | null = null;
  private callbacks: Set<() => void> = new Set();
  private debounceTimer: NodeJS.Timeout | null = null;

  start(basePath: string): void {
    if (this.watcher) {
      this.stop();
    }

    this.watcher = chokidar.watch(basePath, {
      ignored: /(^|[\/\\])\../, // ignore dotfiles except .harshJudge
      persistent: true,
      ignoreInitial: true,
      depth: 5,
    });

    this.watcher.on('all', (event, path) => {
      this.debouncedNotify();
    });
  }

  private debouncedNotify(): void {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }
    this.debounceTimer = setTimeout(() => {
      this.callbacks.forEach((cb) => cb());
    }, 300);
  }

  onUpdate(callback: () => void): () => void {
    this.callbacks.add(callback);
    return () => this.callbacks.delete(callback);
  }

  stop(): void {
    if (this.watcher) {
      this.watcher.close();
      this.watcher = null;
    }
  }
}

export const fileWatcher = new FileWatcherService();
```

### Data Service
```typescript
// packages/ux/src/services/DataService.ts
import { readFile, readdir } from 'fs/promises';
import { join } from 'path';
import yaml from 'js-yaml';
import { marked } from 'marked';
import type { ProjectStatus, ScenarioDetail, RunDetail } from '@harshjudge/shared';

export class DataService {
  constructor(private basePath: string) {}

  async getProjects(): Promise<ProjectSummary[]> {
    // Find all .harshJudge directories
    // Parse config.yaml from each
    // Calculate aggregate status
  }

  async getScenarios(projectPath: string): Promise<ScenarioSummary[]> {
    const scenariosPath = join(projectPath, 'scenarios');
    const dirs = await readdir(scenariosPath, { withFileTypes: true });

    return Promise.all(
      dirs
        .filter((d) => d.isDirectory())
        .map(async (d) => {
          const metaPath = join(scenariosPath, d.name, 'meta.yaml');
          const meta = yaml.load(await readFile(metaPath, 'utf-8'));
          return {
            slug: d.name,
            ...meta,
          };
        })
    );
  }

  async getScenarioDetail(projectPath: string, slug: string): Promise<ScenarioDetail> {
    const scenarioPath = join(projectPath, 'scenarios', slug);
    const [scenarioMd, metaYaml] = await Promise.all([
      readFile(join(scenarioPath, 'scenario.md'), 'utf-8'),
      readFile(join(scenarioPath, 'meta.yaml'), 'utf-8'),
    ]);

    // Parse frontmatter + content
    // Get recent runs
    return { /* ... */ };
  }

  async getRunDetail(runPath: string): Promise<RunDetail> {
    const resultJson = await readFile(join(runPath, 'result.json'), 'utf-8');
    const evidence = await this.loadEvidence(join(runPath, 'evidence'));
    return { /* ... */ };
  }
}
```

---
