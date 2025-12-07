/**
 * init command - Initialize HarshJudge in a project
 *
 * This command:
 * 1. Copies skills to .claude/skills/harshjudge/
 * 2. Creates .harshJudge/ directory with config.yaml
 */

import { mkdir, writeFile, readFile, readdir, stat, copyFile, access } from 'fs/promises';
import { join, dirname, basename } from 'path';
import { fileURLToPath } from 'url';
import yaml from 'js-yaml';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

interface InitOptions {
  name?: string;
  url?: string;
  skipSkills?: boolean;
}

/**
 * Recursively copy a directory
 */
async function copyDir(src: string, dest: string): Promise<void> {
  await mkdir(dest, { recursive: true });
  const entries = await readdir(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = join(src, entry.name);
    const destPath = join(dest, entry.name);

    if (entry.isDirectory()) {
      await copyDir(srcPath, destPath);
    } else {
      await copyFile(srcPath, destPath);
    }
  }
}

/**
 * Check if a path exists
 */
async function exists(path: string): Promise<boolean> {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

/**
 * Get the skills source directory from the installed package
 */
function getSkillsSourcePath(): string {
  // When installed, skills are at ../../skills/harshjudge relative to dist/commands/
  // When developing, they're at ../../../../skills/harshjudge
  const possiblePaths = [
    join(__dirname, '../../skills/harshjudge'),      // Installed package structure
    join(__dirname, '../../../../skills/harshjudge'), // Development structure
    join(__dirname, '../../../skills/harshjudge'),    // Alternative structure
  ];

  // Return the first path that might exist, or default
  return possiblePaths[1] ?? possiblePaths[0] ?? '';
}

/**
 * Copy skills to user's project
 */
async function copySkills(destBase: string): Promise<void> {
  const skillsSource = getSkillsSourcePath();
  const skillsDest = join(destBase, '.claude/skills/harshjudge');

  // Check if skills already exist
  if (await exists(skillsDest)) {
    console.log('  ⚠️  Skills already exist at .claude/skills/harshjudge/ (skipping)');
    return;
  }

  // Check if source exists
  if (!(await exists(skillsSource))) {
    console.log(`  ⚠️  Skills source not found at ${skillsSource}`);
    console.log('  💡 You may need to manually copy skills from the HarshJudge repository');
    return;
  }

  console.log('  📁 Copying skills to .claude/skills/harshjudge/...');
  await copyDir(skillsSource, skillsDest);
  console.log('  ✅ Skills copied successfully');
}

/**
 * Initialize .harshJudge directory
 */
async function initHarshJudgeDir(basePath: string, projectName: string, baseUrl: string): Promise<void> {
  const harshJudgePath = join(basePath, '.harshJudge');

  // Check if already initialized
  if (await exists(harshJudgePath)) {
    console.log('  ⚠️  .harshJudge/ already exists (skipping initialization)');
    return;
  }

  console.log('  📁 Creating .harshJudge/ directory...');

  // Create directories
  await mkdir(join(harshJudgePath, 'scenarios'), { recursive: true });

  // Write config.yaml
  const config = {
    projectName,
    baseUrl,
    version: '1.0',
    createdAt: new Date().toISOString(),
  };
  await writeFile(
    join(harshJudgePath, 'config.yaml'),
    yaml.dump(config, { indent: 2 }),
    'utf-8'
  );

  // Write .gitignore
  const gitignore = `# HarshJudge
# Ignore large evidence files in CI
scenarios/*/runs/*/evidence/*.png
scenarios/*/runs/*/evidence/*.html
`;
  await writeFile(join(harshJudgePath, '.gitignore'), gitignore, 'utf-8');

  console.log('  ✅ .harshJudge/ initialized');
}

/**
 * Get project name from package.json or directory name
 */
async function getDefaultProjectName(basePath: string): Promise<string> {
  try {
    const packageJsonPath = join(basePath, 'package.json');
    const packageJson = JSON.parse(await readFile(packageJsonPath, 'utf-8'));
    return packageJson.name ?? basename(basePath);
  } catch {
    return basename(basePath);
  }
}

/**
 * Main init command handler
 */
export async function initCommand(options: InitOptions): Promise<void> {
  const basePath = process.cwd();

  console.log('\n🔍 HarshJudge - Initializing project\n');

  // Get project name
  const projectName = options.name ?? (await getDefaultProjectName(basePath));
  const baseUrl = options.url ?? 'http://localhost:3000';

  console.log(`  Project: ${projectName}`);
  console.log(`  Base URL: ${baseUrl}\n`);

  // Step 1: Copy skills (unless skipped)
  if (!options.skipSkills) {
    await copySkills(basePath);
  } else {
    console.log('  ⏭️  Skipping skills copy (--skip-skills)');
  }

  // Step 2: Initialize .harshJudge directory
  await initHarshJudgeDir(basePath, projectName, baseUrl);

  // Success message
  console.log(`
╔═══════════════════════════════════════════════════════════════════╗
║                                                                   ║
║   ✅ HarshJudge initialized successfully!                         ║
║                                                                   ║
║   Next steps:                                                     ║
║                                                                   ║
║   1. Configure Claude Code MCP server:                            ║
║      Add @harshjudge/mcp-server to your .claude/mcp.json          ║
║                                                                   ║
║   2. Start the dashboard:                                         ║
║      $ harshjudge dashboard                                       ║
║                                                                   ║
║   3. Create your first scenario:                                  ║
║      Use /harshjudge:create in Claude Code                        ║
║                                                                   ║
╚═══════════════════════════════════════════════════════════════════╝
`);
}
