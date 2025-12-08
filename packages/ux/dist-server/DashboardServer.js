import { createServer } from 'http';
import { readFile, stat, readdir } from 'fs/promises';
import { join, extname, dirname } from 'path';
import { fileURLToPath } from 'url';
import yaml from 'js-yaml';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
/**
 * Simple HTTP server for serving the HarshJudge dashboard
 * Features:
 * - Static file serving from dist/
 * - SPA routing (fallback to index.html)
 * - Graceful shutdown
 */
export class DashboardServer {
    server = null;
    port;
    projectPath;
    distPath;
    constructor(options = {}) {
        this.port = options.port ?? 3000;
        this.projectPath = options.projectPath ?? process.cwd();
        // Default to the dist directory relative to this file's location
        this.distPath = options.distPath ?? join(__dirname, '../../dist');
    }
    /**
     * Start the dashboard server
     * @returns The actual port the server is listening on
     */
    async start() {
        return new Promise((resolve, reject) => {
            this.server = createServer(this.handleRequest.bind(this));
            this.server.on('error', (err) => {
                if (err.code === 'EADDRINUSE') {
                    reject(new Error(`Port ${this.port} is already in use`));
                }
                else {
                    reject(err);
                }
            });
            this.server.listen(this.port, () => {
                const address = this.server?.address();
                resolve(address.port);
            });
        });
    }
    /**
     * Stop the dashboard server
     */
    async stop() {
        return new Promise((resolve) => {
            if (this.server) {
                this.server.close(() => {
                    this.server = null;
                    resolve();
                });
            }
            else {
                resolve();
            }
        });
    }
    /**
     * Check if the server is running
     */
    isRunning() {
        return this.server !== null && this.server.listening;
    }
    /**
     * Get the server URL
     */
    getUrl() {
        return `http://localhost:${this.port}`;
    }
    /**
     * Handle incoming HTTP requests
     */
    async handleRequest(req, res) {
        const url = req.url || '/';
        // Set CORS headers for development
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
        if (req.method === 'OPTIONS') {
            res.writeHead(204);
            res.end();
            return;
        }
        // Only allow GET requests
        if (req.method !== 'GET') {
            res.writeHead(405);
            res.end('Method Not Allowed');
            return;
        }
        // Handle API routes
        if (url.startsWith('/api/')) {
            await this.handleApiRequest(url, res);
            return;
        }
        // Serve static files
        await this.serveStaticFile(url, res);
    }
    /**
     * Handle API requests
     */
    async handleApiRequest(url, res) {
        // Parse URL and extract query string
        const urlParts = url.split('?');
        const cleanUrl = urlParts[0] ?? '';
        const queryString = urlParts[1] ?? '';
        const parts = cleanUrl.replace('/api/', '').split('/').map(decodeURIComponent);
        try {
            // GET /api/file?path=<absolute-path> - Serve evidence files
            if (parts[0] === 'file') {
                const params = new URLSearchParams(queryString);
                const filePath = params.get('path');
                if (!filePath) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Missing path parameter' }));
                    return;
                }
                // Security: only allow serving files from .harshJudge directories
                if (!filePath.includes('.harshJudge')) {
                    res.writeHead(403, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Access denied: can only serve HarshJudge evidence files' }));
                    return;
                }
                // Security: prevent directory traversal
                if (filePath.includes('..')) {
                    res.writeHead(403, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Access denied: path traversal not allowed' }));
                    return;
                }
                try {
                    const content = await readFile(filePath);
                    const contentType = this.getContentType(filePath);
                    res.writeHead(200, {
                        'Content-Type': contentType,
                        'Cache-Control': 'public, max-age=3600',
                    });
                    res.end(content);
                    return;
                }
                catch {
                    res.writeHead(404, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'File not found' }));
                    return;
                }
            }
            // GET /api/projects
            if (parts[0] === 'projects' && parts.length === 1) {
                const projects = await this.getProjects();
                this.sendJson(res, projects);
                return;
            }
            // GET /api/projects/:projectPath/scenarios
            if (parts[0] === 'projects' && parts[2] === 'scenarios' && parts.length === 3) {
                const projectPath = parts[1];
                const scenarios = await this.getScenarios(projectPath ?? '');
                this.sendJson(res, scenarios);
                return;
            }
            // GET /api/projects/:projectPath/scenarios/:scenarioSlug
            if (parts[0] === 'projects' && parts[2] === 'scenarios' && parts.length === 4) {
                const projectPath = parts[1];
                const scenarioSlug = parts[3];
                const detail = await this.getScenarioDetail(projectPath ?? '', scenarioSlug ?? '');
                this.sendJson(res, detail);
                return;
            }
            // GET /api/projects/:projectPath/scenarios/:scenarioSlug/runs
            if (parts[0] === 'projects' && parts[2] === 'scenarios' && parts[4] === 'runs' && parts.length === 5) {
                const projectPath = parts[1];
                const scenarioSlug = parts[3];
                const runs = await this.getRunHistory(projectPath ?? '', scenarioSlug ?? '');
                this.sendJson(res, runs);
                return;
            }
            // GET /api/projects/:projectPath/scenarios/:scenarioSlug/runs/:runId
            if (parts[0] === 'projects' && parts[2] === 'scenarios' && parts[4] === 'runs' && parts.length === 6) {
                const projectPath = parts[1];
                const scenarioSlug = parts[3];
                const runId = parts[5];
                const detail = await this.getRunDetail(projectPath ?? '', scenarioSlug ?? '', runId ?? '');
                this.sendJson(res, detail);
                return;
            }
            // Not found
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'API endpoint not found' }));
        }
        catch (err) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: err instanceof Error ? err.message : 'Internal server error' }));
        }
    }
    /**
     * Send JSON response
     */
    sendJson(res, data) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(data));
    }
    /**
     * Serve a static file or fallback to index.html for SPA routing
     */
    async serveStaticFile(url, res) {
        // Clean URL (remove query string, handle trailing slash)
        let cleanUrl = url.split('?')[0];
        if (cleanUrl === '/') {
            cleanUrl = '/index.html';
        }
        // Decode URL to catch encoded traversal attempts like %2e%2e
        const decodedUrl = decodeURIComponent(cleanUrl ?? '');
        // Security: prevent directory traversal (check both encoded and decoded)
        if ((cleanUrl ?? '').includes('..') || decodedUrl.includes('..')) {
            res.writeHead(403);
            res.end('Forbidden');
            return;
        }
        let filePath = join(this.distPath, decodedUrl);
        try {
            const stats = await stat(filePath);
            if (stats.isDirectory()) {
                filePath = join(filePath, 'index.html');
            }
            const content = await readFile(filePath);
            const contentType = this.getContentType(filePath);
            res.writeHead(200, {
                'Content-Type': contentType,
                'Cache-Control': 'no-cache',
            });
            res.end(content);
        }
        catch {
            // SPA fallback - serve index.html for non-file routes
            try {
                const indexPath = join(this.distPath, 'index.html');
                const indexContent = await readFile(indexPath);
                res.writeHead(200, {
                    'Content-Type': 'text/html',
                    'Cache-Control': 'no-cache',
                });
                res.end(indexContent);
            }
            catch {
                res.writeHead(404);
                res.end('Not Found - Dashboard not built. Run `npm run build` first.');
            }
        }
    }
    /**
     * Get MIME type for a file based on its extension
     */
    getContentType(filePath) {
        const ext = extname(filePath).toLowerCase();
        const mimeTypes = {
            '.html': 'text/html; charset=utf-8',
            '.js': 'application/javascript; charset=utf-8',
            '.mjs': 'application/javascript; charset=utf-8',
            '.css': 'text/css; charset=utf-8',
            '.json': 'application/json; charset=utf-8',
            '.png': 'image/png',
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.gif': 'image/gif',
            '.svg': 'image/svg+xml',
            '.ico': 'image/x-icon',
            '.woff': 'font/woff',
            '.woff2': 'font/woff2',
            '.ttf': 'font/ttf',
            '.eot': 'application/vnd.ms-fontobject',
        };
        return mimeTypes[ext] || 'application/octet-stream';
    }
    // --- Data Service Methods ---
    /**
     * Discover all HarshJudge projects in the project path
     */
    async getProjects() {
        try {
            const harshJudgePath = join(this.projectPath, '.harshJudge');
            const exists = await this.pathExists(harshJudgePath);
            if (!exists) {
                return [];
            }
            const config = await this.readConfig(harshJudgePath);
            if (!config) {
                return [];
            }
            const scenarios = await this.getScenarios(harshJudgePath);
            const overallStatus = this.calculateOverallStatus(scenarios);
            return [{
                    path: harshJudgePath,
                    name: config.projectName,
                    scenarioCount: scenarios.length,
                    overallStatus,
                }];
        }
        catch {
            return [];
        }
    }
    /**
     * Get all scenarios for a project
     */
    async getScenarios(projectPath) {
        try {
            const scenariosPath = join(projectPath, 'scenarios');
            const exists = await this.pathExists(scenariosPath);
            if (!exists) {
                return [];
            }
            const entries = await readdir(scenariosPath, { withFileTypes: true });
            const scenarioDirs = entries.filter(e => e.isDirectory());
            const scenarios = [];
            for (const dir of scenarioDirs) {
                const scenario = await this.readScenarioSummary(join(scenariosPath, dir.name), dir.name);
                if (scenario) {
                    scenarios.push(scenario);
                }
            }
            // Sort by last run time (most recent first)
            return scenarios.sort((a, b) => {
                if (!a.lastRun && !b.lastRun)
                    return 0;
                if (!a.lastRun)
                    return 1;
                if (!b.lastRun)
                    return -1;
                return new Date(b.lastRun).getTime() - new Date(a.lastRun).getTime();
            });
        }
        catch {
            return [];
        }
    }
    /**
     * Get detailed scenario information including runs
     */
    async getScenarioDetail(projectPath, slug) {
        try {
            const scenarioPath = join(projectPath, 'scenarios', slug);
            const exists = await this.pathExists(scenarioPath);
            if (!exists) {
                return null;
            }
            const [scenarioContent, meta] = await Promise.all([
                this.readScenarioContent(scenarioPath),
                this.readScenarioMeta(scenarioPath),
            ]);
            if (!scenarioContent) {
                return null;
            }
            const recentRuns = await this.getRecentRuns(scenarioPath, 10);
            return {
                slug,
                title: scenarioContent.title,
                tags: scenarioContent.tags,
                content: scenarioContent.content,
                meta: meta || this.defaultMeta(),
                recentRuns,
            };
        }
        catch {
            return null;
        }
    }
    /**
     * Get run history for a scenario
     */
    async getRunHistory(projectPath, scenarioSlug) {
        try {
            const scenarioPath = join(projectPath, 'scenarios', scenarioSlug);
            return await this.getRecentRuns(scenarioPath, 100);
        }
        catch {
            return [];
        }
    }
    /**
     * Get run detail including evidence paths
     */
    async getRunDetail(projectPath, scenarioSlug, runId) {
        try {
            const runPath = join(projectPath, 'scenarios', scenarioSlug, 'runs', runId);
            const exists = await this.pathExists(runPath);
            if (!exists) {
                return null;
            }
            const result = await this.readRunResult(runPath);
            const evidencePaths = await this.getEvidencePaths(runPath);
            return {
                runId,
                scenarioSlug,
                result,
                evidencePaths,
            };
        }
        catch {
            return null;
        }
    }
    // --- Private helper methods ---
    async pathExists(path) {
        try {
            await stat(path);
            return true;
        }
        catch {
            return false;
        }
    }
    async readConfig(projectPath) {
        try {
            const configPath = join(projectPath, 'config.yaml');
            const content = await readFile(configPath, 'utf-8');
            return yaml.load(content);
        }
        catch {
            return null;
        }
    }
    async readScenarioMeta(scenarioPath) {
        try {
            const metaPath = join(scenarioPath, 'meta.yaml');
            const content = await readFile(metaPath, 'utf-8');
            return yaml.load(content);
        }
        catch {
            return null;
        }
    }
    async readScenarioContent(scenarioPath) {
        try {
            const scenarioFile = join(scenarioPath, 'scenario.md');
            const content = await readFile(scenarioFile, 'utf-8');
            // Parse YAML frontmatter
            const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
            if (!frontmatterMatch || !frontmatterMatch[1] || frontmatterMatch[2] === undefined) {
                return null;
            }
            const frontmatter = yaml.load(frontmatterMatch[1]);
            return {
                title: frontmatter.title || 'Untitled',
                tags: frontmatter.tags || [],
                content: frontmatterMatch[2],
            };
        }
        catch {
            return null;
        }
    }
    async readScenarioSummary(scenarioPath, slug) {
        const [meta, scenario] = await Promise.all([
            this.readScenarioMeta(scenarioPath),
            this.readScenarioContent(scenarioPath),
        ]);
        if (!scenario) {
            return null;
        }
        const metaData = meta || this.defaultMeta();
        const passRate = metaData.totalRuns > 0
            ? (metaData.passCount / metaData.totalRuns) * 100
            : 0;
        return {
            slug,
            title: scenario.title,
            tags: scenario.tags,
            lastResult: metaData.lastResult,
            lastRun: metaData.lastRun,
            totalRuns: metaData.totalRuns,
            passRate,
        };
    }
    async readRunResult(runPath) {
        try {
            const resultPath = join(runPath, 'result.json');
            const content = await readFile(resultPath, 'utf-8');
            return JSON.parse(content);
        }
        catch {
            return null;
        }
    }
    async getRecentRuns(scenarioPath, limit) {
        try {
            const runsPath = join(scenarioPath, 'runs');
            const exists = await this.pathExists(runsPath);
            if (!exists) {
                return [];
            }
            const entries = await readdir(runsPath, { withFileTypes: true });
            const runDirs = entries.filter(e => e.isDirectory());
            const runs = [];
            for (const dir of runDirs) {
                const runPath = join(runsPath, dir.name);
                const result = await this.readRunResult(runPath);
                if (result) {
                    runs.push({
                        id: result.runId,
                        runNumber: runs.length + 1,
                        status: result.status,
                        duration: result.duration,
                        completedAt: result.completedAt,
                        errorMessage: result.errorMessage,
                    });
                }
            }
            // Sort by completedAt (most recent first) and limit
            return runs
                .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime())
                .slice(0, limit);
        }
        catch {
            return [];
        }
    }
    async getEvidencePaths(runPath) {
        try {
            const evidencePath = join(runPath, 'evidence');
            const exists = await this.pathExists(evidencePath);
            if (!exists) {
                return [];
            }
            const entries = await readdir(evidencePath);
            // Filter out .meta.json files, return only actual evidence files
            return entries
                .filter(e => !e.endsWith('.meta.json'))
                .map(e => join(evidencePath, e));
        }
        catch {
            return [];
        }
    }
    calculateOverallStatus(scenarios) {
        if (scenarios.length === 0) {
            return 'never_run';
        }
        const hasFailure = scenarios.some(s => s.lastResult === 'fail');
        if (hasFailure) {
            return 'fail';
        }
        const hasPass = scenarios.some(s => s.lastResult === 'pass');
        if (hasPass) {
            return 'pass';
        }
        return 'never_run';
    }
    defaultMeta() {
        return {
            totalRuns: 0,
            passCount: 0,
            failCount: 0,
            lastRun: null,
            lastResult: null,
            avgDuration: 0,
        };
    }
}
