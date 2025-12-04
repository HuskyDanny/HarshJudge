# 15. Testing Strategy

## 15.1 Testing Pyramid

```
        E2E Tests
       (Manual + CI)
      /            \
    Integration Tests
   (MCP tool workflows)
  /                    \
 MCP Unit Tests    Dashboard Unit Tests
(handlers, utils)  (components, hooks)
```

## 15.2 Test Organization

### MCP Server Tests
```
packages/mcp-server/tests/
├── handlers/
│   ├── initProject.test.ts
│   ├── saveScenario.test.ts
│   ├── startRun.test.ts
│   ├── recordEvidence.test.ts
│   ├── completeRun.test.ts
│   └── getStatus.test.ts
├── services/
│   └── FileSystemService.test.ts
├── integration/
│   └── full-workflow.test.ts
└── fixtures/
    └── sample-data/
```

### Dashboard Tests
```
packages/ux/tests/
├── components/
│   ├── ProjectListPanel.test.tsx
│   ├── ScenarioListPanel.test.tsx
│   └── ScreenshotTimeline.test.tsx
├── hooks/
│   ├── useProjects.test.ts
│   └── useFileWatcher.test.ts
└── services/
    └── DataService.test.ts
```

## 15.3 Test Examples

### MCP Handler Test
```typescript
// packages/mcp-server/tests/handlers/initProject.test.ts
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { vol } from 'memfs';
import { handleInitProject } from '../../src/handlers/initProject';

vi.mock('fs/promises', async () => {
  const memfs = await import('memfs');
  return memfs.fs.promises;
});

describe('initProject handler', () => {
  beforeEach(() => {
    vol.reset();
  });

  it('creates .harshJudge directory structure', async () => {
    const result = await handleInitProject({
      projectName: 'Test Project',
      baseUrl: 'http://localhost:3000',
    });

    expect(result.success).toBe(true);
    expect(vol.existsSync('.harshJudge')).toBe(true);
    expect(vol.existsSync('.harshJudge/scenarios')).toBe(true);
    expect(vol.existsSync('.harshJudge/config.yaml')).toBe(true);
  });

  it('rejects if already initialized', async () => {
    vol.mkdirSync('.harshJudge');

    await expect(
      handleInitProject({ projectName: 'Test' })
    ).rejects.toThrow('already initialized');
  });

  it('validates projectName is required', async () => {
    await expect(
      handleInitProject({})
    ).rejects.toThrow();
  });
});
```

### Dashboard Component Test
```typescript
// packages/ux/tests/components/ProjectListPanel.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ProjectListPanel } from '../../src/components/panels/ProjectListPanel';

describe('ProjectListPanel', () => {
  const mockProjects = [
    { path: '/app1', name: 'App 1', scenarioCount: 5, overallStatus: 'pass' },
    { path: '/app2', name: 'App 2', scenarioCount: 3, overallStatus: 'fail' },
  ];

  it('renders project list', () => {
    render(
      <ProjectListPanel
        projects={mockProjects}
        selectedProject={null}
        onSelect={() => {}}
      />
    );

    expect(screen.getByText('App 1')).toBeInTheDocument();
    expect(screen.getByText('App 2')).toBeInTheDocument();
    expect(screen.getByText('Projects (2)')).toBeInTheDocument();
  });

  it('calls onSelect when project clicked', () => {
    const onSelect = vi.fn();
    render(
      <ProjectListPanel
        projects={mockProjects}
        selectedProject={null}
        onSelect={onSelect}
      />
    );

    fireEvent.click(screen.getByText('App 1'));
    expect(onSelect).toHaveBeenCalledWith('/app1');
  });

  it('shows empty state when no projects', () => {
    render(
      <ProjectListPanel
        projects={[]}
        selectedProject={null}
        onSelect={() => {}}
      />
    );

    expect(screen.getByText('No projects found')).toBeInTheDocument();
  });
});
```

### Integration Test
```typescript
// packages/mcp-server/tests/integration/full-workflow.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { vol } from 'memfs';
import { handleInitProject } from '../../src/handlers/initProject';
import { handleSaveScenario } from '../../src/handlers/saveScenario';
import { handleStartRun } from '../../src/handlers/startRun';
import { handleRecordEvidence } from '../../src/handlers/recordEvidence';
import { handleCompleteRun } from '../../src/handlers/completeRun';
import { handleGetStatus } from '../../src/handlers/getStatus';

describe('Full workflow integration', () => {
  beforeEach(() => {
    vol.reset();
  });

  it('completes a full test run workflow', async () => {
    // 1. Initialize project
    await handleInitProject({ projectName: 'Test App' });

    // 2. Save scenario
    await handleSaveScenario({
      slug: 'login-test',
      title: 'Login Test',
      content: '## Steps\n1. Go to login page',
      tags: ['auth'],
    });

    // 3. Start run
    const runResult = await handleStartRun({ scenarioSlug: 'login-test' });
    expect(runResult.runId).toBeDefined();

    // 4. Record evidence
    await handleRecordEvidence({
      runId: runResult.runId,
      step: 1,
      type: 'screenshot',
      name: 'login-page',
      data: 'base64-screenshot-data',
    });

    // 5. Complete run
    const completeResult = await handleCompleteRun({
      runId: runResult.runId,
      status: 'pass',
      duration: 1500,
    });
    expect(completeResult.updatedMeta.totalRuns).toBe(1);
    expect(completeResult.updatedMeta.passCount).toBe(1);

    // 6. Get status
    const status = await handleGetStatus({});
    expect(status.scenarios).toHaveLength(1);
    expect(status.scenarios[0].lastResult).toBe('pass');
  });
});
```

---
