/**
 * app.js — Production entry point for cPanel Node.js (Passenger)
 * This file is the startup file configured in cPanel's "Setup Node.js App".
 */
import { createServer } from 'http';
import { createReadStream, existsSync, statSync } from 'fs';
import { readFile } from 'fs/promises';
import { extname, join, normalize } from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import { config } from 'dotenv';
import { resolve, dirname } from 'path';
// ── WebSocket polyfill for Node < 22 (Supabase requires it) ───────────────────
// Use dynamic import so the app doesn't crash if 'ws' isn't installed
if (typeof globalThis.WebSocket === 'undefined') {
    try {
        const wsModule = await import('ws');
        globalThis.WebSocket = wsModule.default || wsModule.WebSocket;
    } catch {
        // ws not installed — Supabase auth calls will fail but app still starts
        console.warn('⚠️  ws package not found. Install it with: npm install ws');
    }
}

// ── Load .env from the app root ───────────────────────────────────────────────
const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, '.env') });

const root = __dirname;
// cPanel Passenger sets PORT automatically — fallback to 3000 for local
const port = Number(process.env.PORT || 3000);

// ── API Routes ────────────────────────────────────────────────────────────────
const routes = [
    { pattern: /^\/api\/products$/, file: 'api/products.js' },
    { pattern: /^\/api\/packs$/, file: 'api/packs.js' },
    { pattern: /^\/api\/login$/, file: 'api/login.js' },
    { pattern: /^\/api\/logout$/, file: 'api/logout.js' },
    { pattern: /^\/api\/auth\/register$/, file: 'api/auth/register.js' },
    { pattern: /^\/api\/admin\/me$/, file: 'api/admin/me.js' },
    { pattern: /^\/api\/admin\/products(?:\/([^/]+))?$/, file: 'api/admin/products.js', params: ['slug'] },
    { pattern: /^\/api\/admin\/packs(?:\/([^/]+))?$/, file: 'api/admin/packs.js', params: ['slug'] },
    { pattern: /^\/api\/admin\/upload$/, file: 'api/admin/upload.js' },
    { pattern: /^\/api\/admin\/orders(?:\/([^/]+))?$/, file: 'api/admin/orders.js', params: ['id'] },
];

// ── MIME types ────────────────────────────────────────────────────────────────
const mime = {
    '.html': 'text/html; charset=utf-8',
    '.js':   'text/javascript; charset=utf-8',
    '.css':  'text/css; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png':  'image/png',
    '.jpg':  'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.webp': 'image/webp',
    '.gif':  'image/gif',
    '.svg':  'image/svg+xml',
    '.xml':  'application/xml; charset=utf-8',
    '.txt':  'text/plain; charset=utf-8',
    '.ico':  'image/x-icon',
    '.woff': 'font/woff',
    '.woff2':'font/woff2',
};

function send(res, status, body, headers = {}) {
    res.writeHead(status, headers);
    res.end(body);
}

async function readBody(req) {
    const chunks = [];
    let size = 0;
    for await (const chunk of req) {
        size += chunk.length;
        if (size > 8 * 1024 * 1024) {
            const err = new Error('Payload too large');
            err.statusCode = 413;
            throw err;
        }
        chunks.push(chunk);
    }
    const raw = Buffer.concat(chunks).toString('utf8');
    if (!raw) return undefined;
    if ((req.headers['content-type'] || '').includes('application/json')) {
        return JSON.parse(raw);
    }
    return raw;
}

function createApiResponse(res) {
    return {
        setHeader: (...args) => res.setHeader(...args),
        status(code) { res.statusCode = code; return this; },
        json(data) {
            if (!res.headersSent) res.setHeader('Content-Type', 'application/json; charset=utf-8');
            res.end(JSON.stringify(data));
        },
        end(data = '') { res.end(data); },
    };
}

async function handleApi(req, res, url) {
    const route = routes.find((item) => item.pattern.test(url.pathname));
    if (!route) return false;
    try {
        const match = url.pathname.match(route.pattern);
        const query = Object.fromEntries(url.searchParams.entries());
        route.params?.forEach((name, index) => {
            const val = match[index + 1];
            if (val !== undefined) query[name] = decodeURIComponent(val);
        });
        req.query = query;
        req.body = await readBody(req);
        // In production we don't cache-bust (no ?t= trick needed since Passenger restarts on deploy)
        const moduleUrl = pathToFileURL(join(root, route.file)).href;
        const mod = await import(moduleUrl);
        await mod.default(req, createApiResponse(res));
    } catch (err) {
        const status = err.statusCode || 500;
        console.error('[API Error]', err.message);
        if (!res.headersSent) {
            send(res, status, JSON.stringify({ error: err.message || 'Server error' }), {
                'Content-Type': 'application/json; charset=utf-8',
            });
        }
    }
    return true;
}

async function serveStatic(req, res, url) {
    let pathname = decodeURIComponent(url.pathname);
    if (pathname === '/') pathname = '/index.html';

    let filePath = normalize(join(root, pathname));
    if (!filePath.startsWith(root)) { send(res, 403, 'Forbidden'); return; }

    if (existsSync(filePath) && statSync(filePath).isDirectory()) {
        filePath = join(filePath, 'index.html');
    }

    if (!existsSync(filePath)) {
        let notFoundContent = '404 Not Found';
        try { notFoundContent = await readFile(join(root, '404.html'), 'utf8'); } catch {}
        send(res, 404, notFoundContent, { 'Content-Type': mime['.html'] });
        return;
    }

    const type = mime[extname(filePath).toLowerCase()] || 'application/octet-stream';
    // Cache static assets for 1 day, HTML no-cache
    const isHtml = type.startsWith('text/html');
    res.writeHead(200, {
        'Content-Type': type,
        'Cache-Control': isHtml ? 'no-cache' : 'public, max-age=86400',
    });
    createReadStream(filePath).pipe(res);
}

// ── Start Server ──────────────────────────────────────────────────────────────
const server = createServer(async (req, res) => {
    // CORS headers
    const allowedOrigins = (process.env.ALLOWED_ORIGINS || '').split(',').map(s => s.trim()).filter(Boolean);
    const origin = req.headers.origin;
    if (origin && (allowedOrigins.includes(origin) || allowedOrigins.length === 0)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    }
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization,Cookie');
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    
    if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }

    const url = new URL(req.url, `http://${req.headers.host}`);
    if (await handleApi(req, res, url)) return;
    await serveStatic(req, res, url);
});

server.listen(port, () => {
    console.log(`LE CANAPÉ server running on port ${port}`);
    console.log(`Admin panel: http://localhost:${port}/admin/login.html`);
});
