import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import { exec } from 'child_process';

// ─── Paths ────────────────────────────────────────────────────────────────────

function productsPath() {
    return join(process.cwd(), 'data', 'products.json');
}

function packsPath() {
    return join(process.cwd(), 'data', 'packs.json');
}

// ─── Static page regeneration (runs generate-pdp.mjs after every save) ───────

function triggerLocalBuild() {
    exec('node scripts/generate-pdp.mjs', (err) => {
        if (err) console.error('Static page rebuild failed:', err.message);
        else console.log('✓ Static pages regenerated.');
    });
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

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

export function slugify(text) {
    return text
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
}

// ─── Products ─────────────────────────────────────────────────────────────────

export async function getProducts() {
    const path = productsPath();
    if (!existsSync(path)) return [];
    try {
        return normalizeProducts(JSON.parse(readFileSync(path, 'utf8')));
    } catch {
        return [];
    }
}

export async function setProducts(products) {
    const normalized = normalizeProducts(products);
    writeFileSync(productsPath(), JSON.stringify(normalized, null, 2) + '\n', 'utf8');
    triggerLocalBuild();
    return normalized;
}

// ─── Packs ────────────────────────────────────────────────────────────────────

export async function getPacks() {
    const path = packsPath();
    if (!existsSync(path)) return [];
    try {
        return JSON.parse(readFileSync(path, 'utf8'));
    } catch {
        return [];
    }
}

export async function setPacks(packs) {
    writeFileSync(packsPath(), JSON.stringify(packs, null, 2) + '\n', 'utf8');
    triggerLocalBuild();
    return packs;
}

// ─── Category tree (shared by frontend & backend) ────────────────────────────

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
