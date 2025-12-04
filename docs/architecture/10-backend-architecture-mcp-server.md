# 10. Backend Architecture (MCP Server)

## 10.1 Service Architecture

Since HarshJudge MCP is a lightweight file-operations server, it uses a simple handler-based architecture rather than full serverless or traditional server patterns.

### Handler Organization
```
packages/mcp-server/src/
├── handlers/
│   ├── initProject.ts
│   ├── saveScenario.ts
│   ├── startRun.ts
│   ├── recordEvidence.ts
│   ├── completeRun.ts
│   └── getStatus.ts
├── services/
│   └── FileSystemService.ts
├── utils/
│   ├── slugify.ts
│   ├── validation.ts
│   └── paths.ts
├── types/
│   └── index.ts              # Re-exports from @harshjudge/shared
├── server.ts                 # MCP server setup
└── index.ts                  # Entry point
```

### Handler Template
```typescript
// packages/mcp-server/src/handlers/initProject.ts
import { z } from 'zod';
import { FileSystemService } from '../services/FileSystemService';
import { InitProjectParams, InitProjectResult } from '@harshjudge/shared';

const fs = new FileSystemService();

export async function handleInitProject(
  params: unknown
): Promise<InitProjectResult> {
  // 1. Validate input
  const validated = InitProjectParams.parse(params);

  // 2. Check if already initialized
  const harshJudgePath = '.harshJudge';
  if (await fs.exists(harshJudgePath)) {
    throw new Error('Project already initialized. Use a different directory or remove existing .harshJudge folder.');
  }

  // 3. Create directory structure
  await fs.ensureDir(harshJudgePath);
  await fs.ensureDir(`${harshJudgePath}/scenarios`);

  // 4. Write config
  const config = {
    projectName: validated.projectName,
    baseUrl: validated.baseUrl || '',
    version: '1.0',
    createdAt: new Date().toISOString(),
  };
  await fs.writeYaml(`${harshJudgePath}/config.yaml`, config);

  // 5. Write gitignore
  const gitignore = `# HarshJudge
# Ignore large evidence files in CI
scenarios/*/runs/*/evidence/*.png
scenarios/*/runs/*/evidence/*.html
`;
  await fs.writeFile(`${harshJudgePath}/.gitignore`, gitignore);

  // 6. Return result
  return {
    success: true,
    projectPath: harshJudgePath,
    configPath: `${harshJudgePath}/config.yaml`,
    scenariosPath: `${harshJudgePath}/scenarios`,
  };
}
```

## 10.2 File System Service

```typescript
// packages/mcp-server/src/services/FileSystemService.ts
import { mkdir, writeFile, readFile, access, readdir } from 'fs/promises';
import { dirname, join } from 'path';
import yaml from 'js-yaml';

export class FileSystemService {
  private basePath: string;

  constructor(basePath: string = process.cwd()) {
    this.basePath = basePath;
  }

  private resolve(path: string): string {
    return join(this.basePath, path);
  }

  async ensureDir(path: string): Promise<void> {
    await mkdir(this.resolve(path), { recursive: true });
  }

  async exists(path: string): Promise<boolean> {
    try {
      await access(this.resolve(path));
      return true;
    } catch {
      return false;
    }
  }

  async writeYaml(path: string, data: object): Promise<void> {
    const content = yaml.dump(data, { indent: 2 });
    await this.writeFile(path, content);
  }

  async readYaml<T>(path: string): Promise<T> {
    const content = await readFile(this.resolve(path), 'utf-8');
    return yaml.load(content) as T;
  }

  async writeJson(path: string, data: object): Promise<void> {
    const content = JSON.stringify(data, null, 2);
    await this.writeFile(path, content);
  }

  async readJson<T>(path: string): Promise<T> {
    const content = await readFile(this.resolve(path), 'utf-8');
    return JSON.parse(content) as T;
  }

  async writeFile(path: string, data: string | Buffer): Promise<void> {
    const fullPath = this.resolve(path);
    await mkdir(dirname(fullPath), { recursive: true });
    await writeFile(fullPath, data);
  }

  async readFile(path: string): Promise<string> {
    return readFile(this.resolve(path), 'utf-8');
  }

  async listDirs(path: string): Promise<string[]> {
    const entries = await readdir(this.resolve(path), { withFileTypes: true });
    return entries.filter((e) => e.isDirectory()).map((e) => e.name);
  }
}
```

## 10.3 MCP Server Entry Point

```typescript
// packages/mcp-server/src/server.ts
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { handleInitProject } from './handlers/initProject';
import { handleSaveScenario } from './handlers/saveScenario';
import { handleStartRun } from './handlers/startRun';
import { handleRecordEvidence } from './handlers/recordEvidence';
import { handleCompleteRun } from './handlers/completeRun';
import { handleGetStatus } from './handlers/getStatus';

const server = new Server(
  { name: 'harshjudge', version: '1.0.0' },
  { capabilities: { tools: {} } }
);

// Register tool list handler
server.setRequestHandler('tools/list', async () => ({
  tools: [
    { name: 'initProject', description: '...', inputSchema: { /* ... */ } },
    { name: 'saveScenario', description: '...', inputSchema: { /* ... */ } },
    { name: 'startRun', description: '...', inputSchema: { /* ... */ } },
    { name: 'recordEvidence', description: '...', inputSchema: { /* ... */ } },
    { name: 'completeRun', description: '...', inputSchema: { /* ... */ } },
    { name: 'getStatus', description: '...', inputSchema: { /* ... */ } },
  ],
}));

// Register tool call handler
server.setRequestHandler('tools/call', async (request) => {
  const { name, arguments: args } = request.params;

  try {
    let result;
    switch (name) {
      case 'initProject':
        result = await handleInitProject(args);
        break;
      case 'saveScenario':
        result = await handleSaveScenario(args);
        break;
      case 'startRun':
        result = await handleStartRun(args);
        break;
      case 'recordEvidence':
        result = await handleRecordEvidence(args);
        break;
      case 'completeRun':
        result = await handleCompleteRun(args);
        break;
      case 'getStatus':
        result = await handleGetStatus(args);
        break;
      default:
        throw new Error(`Unknown tool: ${name}`);
    }

    return { content: [{ type: 'text', text: JSON.stringify(result) }] };
  } catch (error) {
    return {
      content: [{ type: 'text', text: JSON.stringify({ error: error.message }) }],
      isError: true,
    };
  }
});

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('HarshJudge MCP server running on stdio');
}

main().catch(console.error);
```

---
