#!/usr/bin/env node
/**
 * CLI script to start the HarshJudge dashboard server
 * Usage: npx ts-node src/server/serve.ts [--port 3000] [--no-open]
 */
import { DashboardServer } from './DashboardServer.js';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
/**
 * Parse command line arguments
 */
function parseArgs() {
    const args = process.argv.slice(2);
    const options = {
        port: 3000,
        open: true,
    };
    for (let i = 0; i < args.length; i++) {
        const arg = args[i];
        if (arg === '--port' || arg === '-p') {
            const portStr = args[++i] ?? '';
            const port = parseInt(portStr, 10);
            if (isNaN(port) || port < 1 || port > 65535) {
                console.error(`Invalid port: ${portStr}`);
                process.exit(1);
            }
            options.port = port;
        }
        else if (arg === '--no-open') {
            options.open = false;
        }
        else if (arg === '--help' || arg === '-h') {
            printHelp();
            process.exit(0);
        }
    }
    return options;
}
/**
 * Print help message
 */
function printHelp() {
    console.log(`
HarshJudge Dashboard Server

Usage: harshjudge-dashboard [options]

Options:
  -p, --port <port>   Port to listen on (default: 3000)
  --no-open           Don't open browser automatically
  -h, --help          Show this help message

Examples:
  harshjudge-dashboard
  harshjudge-dashboard --port 8080
  harshjudge-dashboard --no-open
`);
}
/**
 * Open URL in default browser
 */
async function openBrowser(url) {
    try {
        // Dynamic import for cross-platform browser opening
        const { platform } = await import('os');
        const { exec } = await import('child_process');
        const os = platform();
        let command;
        if (os === 'darwin') {
            command = `open "${url}"`;
        }
        else if (os === 'win32') {
            command = `start "" "${url}"`;
        }
        else {
            command = `xdg-open "${url}"`;
        }
        exec(command, (err) => {
            if (err) {
                console.log(`Could not open browser automatically. Please visit: ${url}`);
            }
        });
    }
    catch {
        console.log(`Could not open browser automatically. Please visit: ${url}`);
    }
}
/**
 * Main entry point
 */
async function main() {
    const options = parseArgs();
    const server = new DashboardServer({
        port: options.port,
        projectPath: process.cwd(),
        // When compiled to dist-server, __dirname points to packages/ux/dist-server
        // so we need ../dist to reach packages/ux/dist
        distPath: join(__dirname, '../dist'),
    });
    try {
        const port = await server.start();
        const url = server.getUrl();
        console.log(`
╔═══════════════════════════════════════════════════╗
║                                                   ║
║   🔍 HarshJudge Dashboard                         ║
║                                                   ║
║   Local:   ${url.padEnd(35)}║
║                                                   ║
║   Press Ctrl+C to stop                            ║
║                                                   ║
╚═══════════════════════════════════════════════════╝
`);
        if (options.open) {
            await openBrowser(url);
        }
        // Handle graceful shutdown
        const shutdown = async () => {
            console.log('\n\nShutting down dashboard server...');
            await server.stop();
            console.log('Server stopped. Goodbye! 👋\n');
            process.exit(0);
        };
        process.on('SIGINT', shutdown);
        process.on('SIGTERM', shutdown);
    }
    catch (err) {
        console.error('\n❌ Failed to start dashboard server:');
        console.error(err instanceof Error ? err.message : String(err));
        process.exit(1);
    }
}
// Run if this is the main module
main().catch((err) => {
    console.error('Unexpected error:', err);
    process.exit(1);
});
