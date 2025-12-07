/**
 * HarshJudge Demo Application
 *
 * A simple Node.js server that serves a login demo application
 * for testing HarshJudge E2E testing capabilities.
 *
 * No external dependencies required - uses built-in Node.js modules only.
 */

import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 3000;

// In-memory "database" of users
const users = [
  { id: 1, email: 'demo@example.com', password: 'demo123', name: 'Demo User' },
  { id: 2, email: 'test@example.com', password: 'test123', name: 'Test User' },
];

// Session store (in-memory)
const sessions = new Map();

// Content-Type mapping
const mimeTypes = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
};

// Parse cookies from request
function parseCookies(req) {
  const cookies = {};
  const cookieHeader = req.headers.cookie;
  if (cookieHeader) {
    cookieHeader.split(';').forEach(cookie => {
      const [name, value] = cookie.trim().split('=');
      cookies[name] = value;
    });
  }
  return cookies;
}

// Parse JSON body
async function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch {
        reject(new Error('Invalid JSON'));
      }
    });
    req.on('error', reject);
  });
}

// Generate session ID
function generateSessionId() {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

// HTML Pages
const loginPage = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Login - HarshJudge Demo</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .container {
      background: white;
      padding: 2rem;
      border-radius: 12px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.2);
      width: 100%;
      max-width: 400px;
    }
    h1 {
      text-align: center;
      color: #333;
      margin-bottom: 1.5rem;
    }
    .form-group { margin-bottom: 1rem; }
    label {
      display: block;
      margin-bottom: 0.5rem;
      color: #555;
      font-weight: 500;
    }
    input {
      width: 100%;
      padding: 0.75rem;
      border: 2px solid #e1e1e1;
      border-radius: 8px;
      font-size: 1rem;
      transition: border-color 0.2s;
    }
    input:focus {
      outline: none;
      border-color: #667eea;
    }
    button {
      width: 100%;
      padding: 0.75rem;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: transform 0.2s, box-shadow 0.2s;
    }
    button:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
    }
    .error {
      background: #fee;
      color: #c00;
      padding: 0.75rem;
      border-radius: 8px;
      margin-bottom: 1rem;
      display: none;
    }
    .error.show { display: block; }
    .demo-credentials {
      margin-top: 1.5rem;
      padding: 1rem;
      background: #f7f7f7;
      border-radius: 8px;
      font-size: 0.875rem;
      color: #666;
    }
    .demo-credentials strong { color: #333; }
  </style>
</head>
<body>
  <div class="container">
    <h1>HarshJudge Demo</h1>
    <div id="error" class="error"></div>
    <form id="loginForm">
      <div class="form-group">
        <label for="email">Email</label>
        <input
          type="email"
          id="email"
          name="email"
          data-testid="email-input"
          placeholder="Enter your email"
          required
        />
      </div>
      <div class="form-group">
        <label for="password">Password</label>
        <input
          type="password"
          id="password"
          name="password"
          data-testid="password-input"
          placeholder="Enter your password"
          required
        />
      </div>
      <button type="submit" data-testid="login-button">Sign In</button>
    </form>
    <div class="demo-credentials">
      <strong>Demo Credentials:</strong><br>
      Email: demo@example.com<br>
      Password: demo123
    </div>
  </div>
  <script>
    document.getElementById('loginForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      const errorEl = document.getElementById('error');

      try {
        const res = await fetch('/api/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });

        const data = await res.json();

        if (res.ok) {
          window.location.href = '/dashboard';
        } else {
          errorEl.textContent = data.error || 'Login failed';
          errorEl.classList.add('show');
        }
      } catch (err) {
        errorEl.textContent = 'Network error. Please try again.';
        errorEl.classList.add('show');
      }
    });
  </script>
</body>
</html>`;

const dashboardPage = (user) => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Dashboard - HarshJudge Demo</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #f5f5f5;
      min-height: 100vh;
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 1rem 2rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .header h1 { font-size: 1.5rem; }
    .user-info { display: flex; align-items: center; gap: 1rem; }
    .user-name { font-weight: 500; }
    .logout-btn {
      background: rgba(255,255,255,0.2);
      color: white;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 6px;
      cursor: pointer;
      font-size: 0.875rem;
    }
    .logout-btn:hover { background: rgba(255,255,255,0.3); }
    .main {
      max-width: 1200px;
      margin: 2rem auto;
      padding: 0 2rem;
    }
    .welcome-card {
      background: white;
      padding: 2rem;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      margin-bottom: 2rem;
    }
    .welcome-card h2 {
      color: #333;
      margin-bottom: 0.5rem;
    }
    .welcome-card p { color: #666; }
    .success-message {
      background: #e6ffe6;
      color: #006600;
      padding: 1rem;
      border-radius: 8px;
      margin-bottom: 1rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .success-message::before { content: '✓'; font-weight: bold; }
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
    }
    .stat-card {
      background: white;
      padding: 1.5rem;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    .stat-card h3 {
      color: #999;
      font-size: 0.875rem;
      text-transform: uppercase;
      margin-bottom: 0.5rem;
    }
    .stat-card .value {
      font-size: 2rem;
      font-weight: 700;
      color: #333;
    }
  </style>
</head>
<body>
  <header class="header">
    <h1>Dashboard</h1>
    <div class="user-info">
      <span class="user-name" data-testid="user-name">${user.name}</span>
      <button class="logout-btn" data-testid="logout-button" onclick="logout()">Logout</button>
    </div>
  </header>
  <main class="main">
    <div class="welcome-card">
      <div class="success-message" data-testid="login-success">
        Successfully logged in!
      </div>
      <h2>Welcome back, ${user.name}!</h2>
      <p>You're now viewing the HarshJudge demo dashboard.</p>
    </div>
    <div class="stats-grid">
      <div class="stat-card">
        <h3>Total Tests</h3>
        <div class="value" data-testid="stat-tests">24</div>
      </div>
      <div class="stat-card">
        <h3>Passing</h3>
        <div class="value" data-testid="stat-passing">22</div>
      </div>
      <div class="stat-card">
        <h3>Failing</h3>
        <div class="value" data-testid="stat-failing">2</div>
      </div>
      <div class="stat-card">
        <h3>Pass Rate</h3>
        <div class="value" data-testid="stat-rate">92%</div>
      </div>
    </div>
  </main>
  <script>
    async function logout() {
      await fetch('/api/logout', { method: 'POST' });
      window.location.href = '/login';
    }
  </script>
</body>
</html>`;

// Request handler
async function handleRequest(req, res) {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  const pathname = url.pathname;
  const cookies = parseCookies(req);

  // CORS headers for API requests
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    });
    res.end();
    return;
  }

  // API Routes
  if (pathname === '/api/login' && req.method === 'POST') {
    try {
      const body = await parseBody(req);
      const { email, password } = body;

      const user = users.find(u => u.email === email && u.password === password);

      if (user) {
        const sessionId = generateSessionId();
        sessions.set(sessionId, { userId: user.id, createdAt: Date.now() });

        res.writeHead(200, {
          'Content-Type': 'application/json',
          'Set-Cookie': `session=${sessionId}; Path=/; HttpOnly`,
        });
        res.end(JSON.stringify({ success: true, user: { id: user.id, name: user.name, email: user.email } }));
      } else {
        res.writeHead(401, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid email or password' }));
      }
    } catch (err) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Invalid request' }));
    }
    return;
  }

  if (pathname === '/api/logout' && req.method === 'POST') {
    const sessionId = cookies.session;
    if (sessionId) {
      sessions.delete(sessionId);
    }
    res.writeHead(200, {
      'Content-Type': 'application/json',
      'Set-Cookie': 'session=; Path=/; HttpOnly; Max-Age=0',
    });
    res.end(JSON.stringify({ success: true }));
    return;
  }

  if (pathname === '/api/me') {
    const sessionId = cookies.session;
    const session = sessions.get(sessionId);

    if (session) {
      const user = users.find(u => u.id === session.userId);
      if (user) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ user: { id: user.id, name: user.name, email: user.email } }));
        return;
      }
    }

    res.writeHead(401, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not authenticated' }));
    return;
  }

  // Page Routes
  if (pathname === '/' || pathname === '/login') {
    // If already logged in, redirect to dashboard
    const sessionId = cookies.session;
    const session = sessions.get(sessionId);
    if (session) {
      res.writeHead(302, { 'Location': '/dashboard' });
      res.end();
      return;
    }

    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(loginPage);
    return;
  }

  if (pathname === '/dashboard') {
    const sessionId = cookies.session;
    const session = sessions.get(sessionId);

    if (!session) {
      res.writeHead(302, { 'Location': '/login' });
      res.end();
      return;
    }

    const user = users.find(u => u.id === session.userId);
    if (!user) {
      res.writeHead(302, { 'Location': '/login' });
      res.end();
      return;
    }

    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(dashboardPage(user));
    return;
  }

  // Health check
  if (pathname === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', timestamp: new Date().toISOString() }));
    return;
  }

  // 404 for everything else
  res.writeHead(404, { 'Content-Type': 'text/html' });
  res.end('<h1>404 - Not Found</h1>');
}

// Create and start server
const server = http.createServer(handleRequest);

server.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════════════════════════════╗
║              HarshJudge Demo Application                      ║
╠══════════════════════════════════════════════════════════════╣
║                                                               ║
║  Server running at: http://localhost:${PORT}                   ║
║                                                               ║
║  Demo Credentials:                                            ║
║    Email: demo@example.com                                    ║
║    Password: demo123                                          ║
║                                                               ║
║  Available Routes:                                            ║
║    GET  /          - Login page (redirects if logged in)      ║
║    GET  /login     - Login page                               ║
║    GET  /dashboard - Dashboard (requires auth)                ║
║    GET  /health    - Health check endpoint                    ║
║    POST /api/login - Login API                                ║
║    POST /api/logout- Logout API                               ║
║    GET  /api/me    - Current user API                         ║
║                                                               ║
║  Press Ctrl+C to stop the server                              ║
╚══════════════════════════════════════════════════════════════╝
  `);
});
