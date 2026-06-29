import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

function packsPath() {
    return join(process.cwd(), 'data', 'packs.json');
}

function readPacks() {
    try {
        const path = packsPath();
        if (!existsSync(path)) return [];
        return JSON.parse(readFileSync(path, 'utf8'));
    } catch (err) {
        console.error('[packs] Failed to read packs.json:', err.message);
        return [];
    }
}

export default async function handler(req, res) {
    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300');
    res.setHeader('Content-Type', 'application/json; charset=utf-8');

    if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

    const packs = readPacks().filter((pack) => pack.status === 'published' && pack.archived !== true);
    return res.status(200).json(packs);
}

