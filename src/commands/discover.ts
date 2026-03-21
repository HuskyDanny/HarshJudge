import { Command } from 'commander';
import { readdir, readFile, stat } from 'fs/promises';
import { join, relative } from 'path';
import yaml from 'js-yaml';
import { withErrorHandling } from '../utils/cli-helpers.js';

// Metadata fields to extract per known file type
const META_YAML_FIELDS = [
  'title',
  'slug',
  'starred',
  'tags',
  'totalRuns',
  'passCount',
  'failCount',
  'lastRun',
  'lastResult',
  'avgDuration',
];
const CONFIG_YAML_FIELDS = ['projectName', 'baseUrl', 'version', 'createdAt'];
const RESULT_JSON_FIELDS = ['status', 'duration', 'runId'];

function pickFields(
  obj: Record<string, unknown>,
  fields: string[]
): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const key of fields) {
    if (key in obj) result[key] = obj[key];
  }
  return result;
}

async function walkDir(
  dirPath: string,
  basePath: string,
  _fileName: string
): Promise<Record<string, unknown>> {
  const entries = await readdir(dirPath, { withFileTypes: true });
  const node: Record<string, unknown> = {};

  for (const entry of entries) {
    const fullPath = join(dirPath, entry.name);

    if (entry.isDirectory()) {
      node[`${entry.name}/`] = await walkDir(fullPath, basePath, entry.name);
    } else {
      // Parse known structured files; others just appear by name (set to true as a marker)
      if (entry.name === 'meta.yaml') {
        try {
          const raw = yaml.load(await readFile(fullPath, 'utf8')) as Record<
            string,
            unknown
          >;
          node[entry.name] = pickFields(raw, META_YAML_FIELDS);
        } catch {
          node[entry.name] = {};
        }
      } else if (entry.name === 'config.yaml') {
        try {
          const raw = yaml.load(await readFile(fullPath, 'utf8')) as Record<
            string,
            unknown
          >;
          node[entry.name] = pickFields(raw, CONFIG_YAML_FIELDS);
        } catch {
          node[entry.name] = {};
        }
      } else if (entry.name === 'result.json') {
        try {
          const raw = JSON.parse(await readFile(fullPath, 'utf8')) as Record<
            string,
            unknown
          >;
          node[entry.name] = pickFields(raw, RESULT_JSON_FIELDS);
        } catch {
          node[entry.name] = {};
        }
      } else {
        // For step files, evidence files, prd.md, etc — just list by name
        node[entry.name] = true;
      }
    }
  }

  return node;
}

/**
 * Build a tree of .harshJudge/ with metadata extracted from YAML/JSON.
 * @param basePath  Project root (parent of .harshJudge/)
 * @param subPath   Optional relative path within .harshJudge/ to scope the tree
 */
export async function buildTree(
  basePath: string,
  subPath?: string
): Promise<{ root: string; tree: Record<string, unknown> }> {
  const rootPath = subPath
    ? join(basePath, '.harshJudge', subPath)
    : join(basePath, '.harshJudge');

  const dirStat = await stat(rootPath);
  if (!dirStat.isDirectory()) {
    throw new Error(`Path is not a directory: ${rootPath}`);
  }

  const tree = await walkDir(rootPath, basePath, '');
  const rootLabel = relative(basePath, rootPath) + '/';

  return { root: rootLabel, tree };
}

const SEARCHABLE_EXTENSIONS = new Set(['.yaml', '.yml', '.json', '.md']);

async function* walkForSearch(dirPath: string): AsyncGenerator<string> {
  const entries = await readdir(dirPath, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = join(dirPath, entry.name);
    if (entry.isDirectory()) {
      yield* walkForSearch(fullPath);
    } else {
      const ext = entry.name.slice(entry.name.lastIndexOf('.'));
      if (SEARCHABLE_EXTENSIONS.has(ext)) {
        yield fullPath;
      }
    }
  }
}

/**
 * Search for pattern in file content within .harshJudge/ (or a subpath).
 * @param basePath  Project root (parent of .harshJudge/)
 * @param pattern   Case-insensitive string to search for
 * @param subPath   Optional relative path within .harshJudge/ to restrict search
 */
export async function searchFiles(
  basePath: string,
  pattern: string,
  subPath?: string
): Promise<{ matches: Array<{ file: string; match: string }> }> {
  const searchRoot = subPath
    ? join(basePath, '.harshJudge', subPath)
    : join(basePath, '.harshJudge');

  const lowerPattern = pattern.toLowerCase();
  const matches: Array<{ file: string; match: string }> = [];

  for await (const filePath of walkForSearch(searchRoot)) {
    let content: string;
    try {
      content = await readFile(filePath, 'utf8');
    } catch {
      continue;
    }

    const lines = content.split('\n');
    for (const line of lines) {
      if (line.toLowerCase().includes(lowerPattern)) {
        matches.push({ file: filePath, match: line.trim() });
      }
    }
  }

  return { matches };
}

export function register(program: Command): void {
  const discover = program
    .command('discover')
    .description('Explore .harshJudge/ structure');

  discover
    .command('tree [path]')
    .description('Show folder structure with metadata')
    .action(
      withErrorHandling(async (subPath: string | undefined, cmd: Command) => {
        const cwd = cmd.parent?.parent?.opts()['cwd'] ?? process.cwd();
        const result = await buildTree(cwd, subPath);
        console.log(JSON.stringify(result, null, 2));
      })
    );

  discover
    .command('search <pattern>')
    .description('Search file content in .harshJudge/')
    .option('--path <folder>', 'Restrict search to subfolder')
    .action(
      withErrorHandling(
        async (pattern: string, opts: { path?: string }, cmd: Command) => {
          const cwd = cmd.parent?.parent?.opts()['cwd'] ?? process.cwd();
          const result = await searchFiles(cwd, pattern, opts.path);
          console.log(JSON.stringify(result, null, 2));
        }
      )
    );
}
