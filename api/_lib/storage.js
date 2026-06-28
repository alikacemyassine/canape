import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

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
    return normalized;
}

export function slugify(text) {
    return text
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
}

export const CATEGORIES = {
    sejour: { label: 'SÉJOUR', subcategories: { fauteuils: 'FAUTEUILS', canapes: 'CANAPÉS', general: 'SÉJOUR' } },
    'salle-a-manger': { label: 'SALLE À MANGER', subcategories: { tables: 'TABLES', general: 'SALLE À MANGER' } },
    chambre: { label: 'CHAMBRE', subcategories: { lits: 'LITS', general: 'CHAMBRE' } },
    decoration: { label: 'DÉCORATION', subcategories: { luminaires: 'LUMINAIRES', miroirs: 'MIROIRS', general: 'DÉCORATION' } },
    salon: { label: 'SALON', subcategories: { general: 'SALON' } },
};
