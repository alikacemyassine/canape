import { createServer } from 'http';
import { createReadStream, existsSync, statSync } from 'fs';
import { readFile } from 'fs/promises';
import { extname, join, normalize } from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

const root = join(fileURLToPath(new URL('..', import.meta.url)));
const port = Number(process.env.PORT || 3000);
process.env.NODE_ENV ||= 'development';

const routes = [
    { pattern: /^\/api\/products$/, file: 'api/products.js' },
    { pattern: /^\/api\/packs$/, file: 'api/packs.js' },
    { pattern: /^\/api\/login$/, file: 'api/login.js' },
    { pattern: /^\/api\/logout$/, file: 'api/logout.js' },
    { pattern: /^\/api\/admin\/me$/, file: 'api/admin/me.js' },
    { pattern: /^\/api\/admin\/products$/, file: 'api/admin/products.js' },
    { pattern: /^\/api\/admin\/products\/([^/]+)$/, file: 'api/admin/products/[slug].js', params: ['slug'] },
    { pattern: /^\/api\/admin\/upload$/, file: 'api/admin/upload.js' },
];

const mime = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.webp': 'image/webp',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.xml': 'application/xml; charset=utf-8',
    '.txt': 'text/plain; charset=utf-8',
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
        status(code) {
            res.statusCode = code;
            return this;
        },
        json(data) {
            if (!res.headersSent) res.setHeader('Content-Type', 'application/json; charset=utf-8');
            res.end(JSON.stringify(data));
        },
        end(data = '') {
            res.end(data);
        },
    };
}

async function handleApi(req, res, url) {
    const route = routes.find((item) => item.pattern.test(url.pathname));
    if (!route) return false;

    try {
        const match = url.pathname.match(route.pattern);
        const query = Object.fromEntries(url.searchParams.entries());
        route.params?.forEach((name, index) => {
            query[name] = decodeURIComponent(match[index + 1]);
        });

        req.query = query;
        req.body = await readBody(req);

        const moduleUrl = pathToFileURL(join(root, route.file)).href + `?t=${Date.now()}`;
        const mod = await import(moduleUrl);
        await mod.default(req, createApiResponse(res));
    } catch (err) {
        const status = err.statusCode || 500;
        console.error(err);
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
    if (!filePath.startsWith(root)) {
        send(res, 403, 'Forbidden');
        return;
    }

    if (existsSync(filePath) && statSync(filePath).isDirectory()) {
        filePath = join(filePath, 'index.html');
    }

    if (!existsSync(filePath)) {
        send(res, 404, await readFile(join(root, 'index.html'), 'utf8'), { 'Content-Type': mime['.html'] });
        return;
    }

    const type = mime[extname(filePath).toLowerCase()] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': type });
    createReadStream(filePath).pipe(res);
}

createServer(async (req, res) => {
    const url = new URL(req.url, `http://${req.headers.host}`);
    if (await handleApi(req, res, url)) return;
    await serveStatic(req, res, url);
}).listen(port, () => {
    console.log(`Local site running at http://localhost:${port}`);
    console.log('Admin: http://localhost:' + port + '/admin/login.html');
});
