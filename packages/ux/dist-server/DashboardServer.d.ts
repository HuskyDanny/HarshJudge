/**
 * Dashboard server configuration options
 */
export interface DashboardServerOptions {
    /** Port to listen on (default: 3000) */
    port?: number;
    /** Path to the project directory */
    projectPath?: string;
    /** Path to the dist directory with built assets */
    distPath?: string;
}
/**
 * Simple HTTP server for serving the HarshJudge dashboard
 * Features:
 * - Static file serving from dist/
 * - SPA routing (fallback to index.html)
 * - Graceful shutdown
 */
export declare class DashboardServer {
    private server;
    private port;
    private projectPath;
    private distPath;
    constructor(options?: DashboardServerOptions);
    /**
     * Start the dashboard server
     * @returns The actual port the server is listening on
     */
    start(): Promise<number>;
    /**
     * Stop the dashboard server
     */
    stop(): Promise<void>;
    /**
     * Check if the server is running
     */
    isRunning(): boolean;
    /**
     * Get the server URL
     */
    getUrl(): string;
    /**
     * Handle incoming HTTP requests
     */
    private handleRequest;
    /**
     * Handle API requests
     */
    private handleApiRequest;
    /**
     * Send JSON response
     */
    private sendJson;
    /**
     * Serve a static file or fallback to index.html for SPA routing
     */
    private serveStaticFile;
    /**
     * Get MIME type for a file based on its extension
     */
    private getContentType;
    /**
     * Discover all HarshJudge projects in the project path
     */
    private getProjects;
    /**
     * Get all scenarios for a project
     */
    private getScenarios;
    /**
     * Get detailed scenario information including runs
     */
    private getScenarioDetail;
    /**
     * Get run history for a scenario
     */
    private getRunHistory;
    /**
     * Get run detail including evidence paths
     */
    private getRunDetail;
    private pathExists;
    private readConfig;
    private readScenarioMeta;
    private readScenarioContent;
    private readScenarioSummary;
    private readRunResult;
    private getRecentRuns;
    private getEvidencePaths;
    private calculateOverallStatus;
    private defaultMeta;
}
//# sourceMappingURL=DashboardServer.d.ts.map