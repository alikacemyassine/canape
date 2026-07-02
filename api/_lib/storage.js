import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import { exec } from 'child_process';

function triggerLocalBuild() {
    if (!isVercelRuntime()) {
        exec('node scripts/generate-pdp.mjs', (err) => {
            if (err) console.error('Local build failed:', err);
            else console.log('Local static pages regenerated automatically.');
        });
    }
}

const KV_KEY = 'canape:products';
const BLOB_PRODUCTS_PATH = 'data/products.json';
let kvClient = null;
let blobClient = null;

export class StorageNotConfiguredError extends Error {
    constructor() {
        super('Storage is not configured. Connect Vercel Blob or Redis/KV to save product changes in production.');
        this.name = 'StorageNotConfiguredError';
        this.statusCode = 503;
    }
}

function isVercelRuntime() {
    return process.env.VERCEL === '1' || process.env.NOW_REGION;
}

async function getBlob() {
    if (blobClient) return blobClient;
    if (!process.env.BLOB_READ_WRITE_TOKEN) return null;
    try {
        blobClient = await import('@vercel/blob');
        return blobClient;
    } catch {
        return null;
    }
}

async function getKv() {
    if (kvClient) return kvClient;
    if (!process.env.KV_REST_API_URL) return null;
    try {
        const { kv } = await import('@vercel/kv');
        kvClient = kv;
        return kv;
    } catch {
        return null;
    }
}

function productsPath() {
    return join(process.cwd(), 'data', 'products.json');
}

function seedFromFile() {
    const path = productsPath();
    if (!existsSync(path)) return [];
    const raw = readFileSync(path, 'utf8');
    const data = JSON.parse(raw);
    return normalizeProducts(data);
}

async function getProductsFromBlob() {
    const blob = await getBlob();
    if (!blob) return null;

    const found = await blob.list({ prefix: BLOB_PRODUCTS_PATH, limit: 1 });
    const productsBlob = found.blobs?.find((item) => item.pathname === BLOB_PRODUCTS_PATH);
    if (!productsBlob) {
        const seed = seedFromFile();
        if (seed.length > 0) await setProductsInBlob(seed);
        return seed;
    }

    const res = await fetch(`${productsBlob.url}?t=${Date.now()}`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Unable to read products from Blob storage');
    return normalizeProducts(await res.json());
}

async function setProductsInBlob(products) {
    const blob = await getBlob();
    if (!blob) return null;

    const normalized = normalizeProducts(products);
    await blob.put(BLOB_PRODUCTS_PATH, JSON.stringify(normalized, null, 2) + '\n', {
        access: 'public',
        addRandomSuffix: false,
        allowOverwrite: true,
        contentType: 'application/json; charset=utf-8',
    });
    return normalized;
}

export function normalizeProducts(products) {
    const now = new Date().toISOString().slice(0, 10);
    return products.map((p) => ({
        ...p,
        status: p.status || 'published',
        archived: p.archived === true,
        createdAt: p.createdAt || now,
        updatedAt: p.updatedAt || now,
    }));
}

export async function getProducts() {
    const blobProducts = await getProductsFromBlob();
    if (blobProducts) return blobProducts;

    const kv = await getKv();
    if (kv) {
        const stored = await kv.get(KV_KEY);
        if (stored && Array.isArray(stored) && stored.length > 0) {
            return normalizeProducts(stored);
        }
        const seed = seedFromFile();
        if (seed.length > 0) await kv.set(KV_KEY, seed);
        return seed;
    }
    return seedFromFile();
}

export async function setProducts(products) {
    const normalized = normalizeProducts(products);
    const blobProducts = await setProductsInBlob(normalized);
    if (blobProducts) return blobProducts;

    const kv = await getKv();
    if (kv) {
        await kv.set(KV_KEY, normalized);
        return normalized;
    }

    if (isVercelRuntime()) {
        throw new StorageNotConfiguredError();
    }

    writeFileSync(productsPath(), JSON.stringify(normalized, null, 2) + '\n', 'utf8');
    triggerLocalBuild();
    return normalized;
}

const KV_PACKS_KEY = 'canape:packs';
const BLOB_PACKS_PATH = 'data/packs.json';

function packsPath() {
    return join(process.cwd(), 'data', 'packs.json');
}

function seedPacksFromFile() {
    const path = packsPath();
    if (!existsSync(path)) return [];
    try {
        return JSON.parse(readFileSync(path, 'utf8'));
    } catch {
        return [];
    }
}

async function getPacksFromBlob() {
    const blob = await getBlob();
    if (!blob) return null;
    const found = await blob.list({ prefix: BLOB_PACKS_PATH, limit: 1 });
    const packsBlob = found.blobs?.find((item) => item.pathname === BLOB_PACKS_PATH);
    if (!packsBlob) {
        const seed = seedPacksFromFile();
        if (seed.length > 0) await setPacksInBlob(seed);
        return seed;
    }
    const res = await fetch(`${packsBlob.url}?t=${Date.now()}`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Unable to read packs from Blob storage');
    return await res.json();
}

async function setPacksInBlob(packs) {
    const blob = await getBlob();
    if (!blob) return null;
    await blob.put(BLOB_PACKS_PATH, JSON.stringify(packs, null, 2) + '\n', {
        access: 'public',
        addRandomSuffix: false,
        allowOverwrite: true,
        contentType: 'application/json; charset=utf-8',
    });
    return packs;
}

export async function getPacks() {
    const blobPacks = await getPacksFromBlob();
    if (blobPacks) return blobPacks;
    const kv = await getKv();
    if (kv) {
        const stored = await kv.get(KV_PACKS_KEY);
        if (stored && Array.isArray(stored) && stored.length > 0) return stored;
        const seed = seedPacksFromFile();
        if (seed.length > 0) await kv.set(KV_PACKS_KEY, seed);
        return seed;
    }
    return seedPacksFromFile();
}

export async function setPacks(packs) {
    const blobResult = await setPacksInBlob(packs);
    if (blobResult) return blobResult;
    const kv = await getKv();
    if (kv) {
        await kv.set(KV_PACKS_KEY, packs);
        return packs;
    }
    if (isVercelRuntime()) throw new StorageNotConfiguredError();
    writeFileSync(packsPath(), JSON.stringify(packs, null, 2) + '\n', 'utf8');
    triggerLocalBuild();
    return packs;
}

export function slugify(text) {
    return text
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
}

export const CATEGORIES_TREE = {
    'sejour': {
        label: 'SÉJOUR',
        subcategories: {
            'fauteuils': { label: 'FAUTEUILS' },
            'canapes': { label: 'CANAPÉS' },
            'general': { label: 'SÉJOUR' }
        }
    },
    'salle-a-manger': {
        label: 'SALLE À MANGER',
        subcategories: {
            'tables-de-repas': { label: 'TABLES DE REPAS' },
            'general': { label: 'SALLE À MANGER' }
        }
    },
    'chambre': {
        label: 'CHAMBRE',
        subcategories: {
            'adulte': {
                label: 'ADULTE',
                subsubcategories: {
                    'lits': { label: 'LITS' },
                    'dressing': { label: 'DRESSING' },
                    'commodes': { label: 'COMMODES' }
                }
            },
            'junior': {
                label: 'JUNIOR',
                subsubcategories: {
                    'lits': { label: 'LITS' },
                    'dressing': { label: 'DRESSING' },
                    'commodes': { label: 'COMMODES' },
                    'bureau': { label: 'BUREAU' }
                }
            },
            'general': { label: 'CHAMBRE' }
        }
    },
    'decoration': {
        label: 'DÉCORATION',
        subcategories: {
            'luminaires': { label: 'LUMINAIRES' },
            'miroirs': { label: 'MIROIRS' },
            'general': { label: 'DÉCORATION' }
        }
    },
    'salon': {
        label: 'SALON',
        subcategories: {
            'general': { label: 'SALON' }
        }
    }
};
