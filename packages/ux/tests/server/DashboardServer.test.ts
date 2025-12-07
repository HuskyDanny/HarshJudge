import { describe, it, expect, beforeEach, afterEach, beforeAll, afterAll } from 'vitest';
import { DashboardServer } from '../../src/server/DashboardServer';
import { writeFile, mkdir, rm } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';
import { request } from 'http';

describe('DashboardServer', () => {
  let server: DashboardServer;
  let testDistPath: string;

  beforeAll(async () => {
    // Create a temporary dist directory for testing
    testDistPath = join(tmpdir(), `harshjudge-test-${Date.now()}`);
    await mkdir(testDistPath, { recursive: true });
    await writeFile(join(testDistPath, 'index.html'), '<!DOCTYPE html><html><body>Test</body></html>');
    await mkdir(join(testDistPath, 'assets'), { recursive: true });
    await writeFile(join(testDistPath, 'assets', 'index.js'), 'console.log("test");');
    await writeFile(join(testDistPath, 'assets', 'style.css'), 'body { color: black; }');
  });

  afterAll(async () => {
    // Cleanup temp directory
    await rm(testDistPath, { recursive: true, force: true });
  });

  afterEach(async () => {
    if (server?.isRunning()) {
      await server.stop();
    }
  });

  describe('constructor', () => {
    it('uses default port 3000', () => {
      server = new DashboardServer();
      expect(server.getUrl()).toBe('http://localhost:3000');
    });

    it('accepts custom port', () => {
      server = new DashboardServer({ port: 8080 });
      expect(server.getUrl()).toBe('http://localhost:8080');
    });

    it('accepts custom project path', () => {
      server = new DashboardServer({ projectPath: '/custom/path' });
      // Project path is internal, but server should initialize
      expect(server).toBeDefined();
    });
  });

  describe('start/stop', () => {
    it('starts and returns port', async () => {
      server = new DashboardServer({ port: 0, distPath: testDistPath }); // Port 0 = random available port
      const port = await server.start();

      expect(port).toBeGreaterThan(0);
      expect(server.isRunning()).toBe(true);
    });

    it('stops gracefully', async () => {
      server = new DashboardServer({ port: 0, distPath: testDistPath });
      await server.start();
      expect(server.isRunning()).toBe(true);

      await server.stop();
      expect(server.isRunning()).toBe(false);
    });

    it('handles stop when not running', async () => {
      server = new DashboardServer();
      // Should not throw
      await expect(server.stop()).resolves.toBeUndefined();
    });

    it('rejects on port in use', async () => {
      const server1 = new DashboardServer({ port: 0, distPath: testDistPath });
      const port = await server1.start();

      const server2 = new DashboardServer({ port, distPath: testDistPath });

      await expect(server2.start()).rejects.toThrow(/already in use/);

      await server1.stop();
    });
  });

  describe('isRunning', () => {
    it('returns false before start', () => {
      server = new DashboardServer();
      expect(server.isRunning()).toBe(false);
    });

    it('returns true after start', async () => {
      server = new DashboardServer({ port: 0, distPath: testDistPath });
      await server.start();
      expect(server.isRunning()).toBe(true);
    });

    it('returns false after stop', async () => {
      server = new DashboardServer({ port: 0, distPath: testDistPath });
      await server.start();
      await server.stop();
      expect(server.isRunning()).toBe(false);
    });
  });

  describe('getUrl', () => {
    it('returns correct URL format', () => {
      server = new DashboardServer({ port: 3000 });
      expect(server.getUrl()).toBe('http://localhost:3000');
    });

    it('reflects custom port in URL', () => {
      server = new DashboardServer({ port: 9999 });
      expect(server.getUrl()).toBe('http://localhost:9999');
    });
  });

  describe('HTTP requests', () => {
    it('serves index.html for root path', async () => {
      server = new DashboardServer({ port: 0, distPath: testDistPath });
      const port = await server.start();

      const response = await fetch(`http://localhost:${port}/`);

      expect(response.status).toBe(200);
      expect(response.headers.get('content-type')).toContain('text/html');
      const text = await response.text();
      expect(text).toContain('Test');
    });

    it('serves static files with correct content type', async () => {
      server = new DashboardServer({ port: 0, distPath: testDistPath });
      const port = await server.start();

      const response = await fetch(`http://localhost:${port}/assets/index.js`);

      expect(response.status).toBe(200);
      expect(response.headers.get('content-type')).toContain('javascript');
    });

    it('serves CSS files with correct content type', async () => {
      server = new DashboardServer({ port: 0, distPath: testDistPath });
      const port = await server.start();

      const response = await fetch(`http://localhost:${port}/assets/style.css`);

      expect(response.status).toBe(200);
      expect(response.headers.get('content-type')).toContain('text/css');
    });

    it('returns 404 for non-existent files when index also missing', async () => {
      // Use a non-existent dist path
      const emptyDistPath = join(tmpdir(), `harshjudge-empty-${Date.now()}`);
      await mkdir(emptyDistPath, { recursive: true });

      server = new DashboardServer({ port: 0, distPath: emptyDistPath });
      const port = await server.start();

      const response = await fetch(`http://localhost:${port}/non-existent`);

      expect(response.status).toBe(404);

      await rm(emptyDistPath, { recursive: true, force: true });
    });

    it('returns 405 for non-GET requests', async () => {
      server = new DashboardServer({ port: 0, distPath: testDistPath });
      const port = await server.start();

      const response = await fetch(`http://localhost:${port}/`, {
        method: 'POST',
      });

      expect(response.status).toBe(405);
    });

    it('blocks directory traversal attempts', async () => {
      server = new DashboardServer({ port: 0, distPath: testDistPath });
      const port = await server.start();

      // Use raw HTTP request to send path traversal without URL normalization
      // fetch() normalizes URLs, so we use http.request directly
      const status = await new Promise<number>((resolve) => {
        const req = request({
          hostname: 'localhost',
          port,
          path: '/../../../etc/passwd',
          method: 'GET',
        }, (res) => {
          resolve(res.statusCode || 0);
        });
        req.end();
      });

      expect(status).toBe(403);
    });

    it('handles SPA routing by serving index.html for unknown paths', async () => {
      server = new DashboardServer({ port: 0, distPath: testDistPath });
      const port = await server.start();

      const response = await fetch(`http://localhost:${port}/app/some/route`);

      expect(response.status).toBe(200);
      expect(response.headers.get('content-type')).toContain('text/html');
    });
  });

  describe('CORS headers', () => {
    it('sets CORS headers on responses', async () => {
      server = new DashboardServer({ port: 0, distPath: testDistPath });
      const port = await server.start();

      const response = await fetch(`http://localhost:${port}/`);

      expect(response.headers.get('access-control-allow-origin')).toBe('*');
    });

    it('handles OPTIONS preflight requests', async () => {
      server = new DashboardServer({ port: 0, distPath: testDistPath });
      const port = await server.start();

      const response = await fetch(`http://localhost:${port}/`, {
        method: 'OPTIONS',
      });

      expect(response.status).toBe(204);
    });
  });
});
