/**
 * Admin QA Test Suite — tests every admin API endpoint
 * Run: node scripts/test-admin.mjs
 */

import 'dotenv/config';

const BASE = 'http://localhost:3000';
const EMAIL = 'canape.oran@gmail.com';
const PASSWORD = 'canape.oran@gmail.com';

let cookie = '';
let testSlug = '';
let testPackSlug = '';
let testOrderId = '';
let passed = 0;
let failed = 0;

function log(icon, label, detail = '') {
    console.log(`${icon} ${label}${detail ? ' — ' + detail : ''}`);
}

async function req(method, path, body, extraHeaders = {}) {
    const opts = {
        method,
        headers: {
            'Content-Type': 'application/json',
            ...(cookie ? { Cookie: cookie } : {}),
            ...extraHeaders,
        },
        ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    };
    const res = await fetch(`${BASE}${path}`, opts);
    // capture set-cookie
    const sc = res.headers.get('set-cookie');
    if (sc) cookie = sc.split(';')[0];
    let data;
    try { data = await res.json(); } catch { data = {}; }
    return { status: res.status, data };
}

function assert(label, condition, detail = '') {
    if (condition) {
        log('✅', label, detail);
        passed++;
    } else {
        log('❌', label, detail);
        failed++;
    }
}

// ── Wait for server ──────────────────────────────────────────────────────────
async function waitForServer(retries = 10) {
    for (let i = 0; i < retries; i++) {
        try {
            await fetch(BASE);
            return true;
        } catch {
            await new Promise(r => setTimeout(r, 500));
        }
    }
    return false;
}

// ── TESTS ────────────────────────────────────────────────────────────────────
async function main() {
    console.log('\n══════════════════════════════════════════');
    console.log('  ADMIN QA TEST SUITE — LE CANAPÉ');
    console.log('══════════════════════════════════════════\n');

    const up = await waitForServer();
    if (!up) { console.error('❌ Server not reachable at', BASE); process.exit(1); }
    log('🟢', 'Server reachable at', BASE);

    // ── 1. Static pages ──────────────────────────────────────────────────────
    console.log('\n── Static Pages ─────────────────────────');
    for (const [label, url] of [
        ['Homepage (/)', '/'],
        ['Collections (/produits/)', '/produits/'],
        ['Packs (/packs/)', '/packs/'],
        ['Account (/account.html)', '/account.html'],
        ['Orders (/orders.html)', '/orders.html'],
        ['Wishlist (/wishlist.html)', '/wishlist.html'],
        ['Contact (/contact.html)', '/contact.html'],
        ['404 page', '/this-page-does-not-exist-xyz'],
        ['Admin login', '/admin/login.html'],
    ]) {
        const r = await req('GET', url);
        if (url.includes('does-not-exist')) {
            assert(label, r.status === 404, `status ${r.status}`);
        } else {
            assert(label, r.status === 200, `status ${r.status}`);
        }
    }

    // ── 2. Auth — unauthenticated checks ─────────────────────────────────────
    console.log('\n── Auth: Unauthenticated Checks ─────────');
    {
        const r = await req('GET', '/api/admin/me');
        assert('/api/admin/me → not authenticated', r.data.authenticated === false, JSON.stringify(r.data));
    }
    {
        const r = await req('GET', '/api/admin/products');
        assert('GET /api/admin/products blocked without auth', r.status === 401, `status ${r.status}`);
    }
    {
        const r = await req('GET', '/api/admin/packs');
        assert('GET /api/admin/packs blocked without auth', r.status === 401, `status ${r.status}`);
    }
    {
        const r = await req('GET', '/api/admin/orders');
        assert('GET /api/admin/orders blocked without auth', r.status === 401, `status ${r.status}`);
    }

    // ── 3. Login ──────────────────────────────────────────────────────────────
    console.log('\n── Auth: Login ──────────────────────────');
    {
        const r = await req('POST', '/api/login', { email: EMAIL, password: PASSWORD });
        assert('POST /api/login succeeds', r.status === 200, JSON.stringify(r.data));
        assert('Cookie set after login', cookie.includes('sb-access-token'), cookie);
    }
    {
        const r = await req('GET', '/api/admin/me');
        assert('GET /api/admin/me → authenticated after login', r.data.authenticated === true, JSON.stringify(r.data));
    }

    // ── 4. Products CRUD ──────────────────────────────────────────────────────
    console.log('\n── Admin Products ───────────────────────');
    {
        const r = await req('GET', '/api/admin/products');
        assert('GET /api/admin/products → 200 + array', r.status === 200 && Array.isArray(r.data), `status ${r.status}, count=${r.data?.length}`);
    }
    {
        const body = {
            name: 'Test QA Canapé',
            category: 'sejour',
            categoryLabel: 'SÉJOUR',
            price: 99000,
            status: 'draft',
            colors: [{ hex: '#111111', label: 'Noir', gallery: [] }],
        };
        const r = await req('POST', '/api/admin/products', body);
        assert('POST /api/admin/products → 201', r.status === 201, `status ${r.status} ${JSON.stringify(r.data)}`);
        testSlug = r.data?.slug;
        assert('New product has a slug', !!testSlug, testSlug);
    }
    if (testSlug) {
        const r = await req('GET', `/api/admin/products/${testSlug}`);
        assert(`GET /api/admin/products/${testSlug} → 200`, r.status === 200, `name=${r.data?.name}`);
    }
    if (testSlug) {
        const r = await req('PUT', `/api/admin/products/${testSlug}`, { name: 'Test QA Canapé UPDATED', price: 120000, status: 'draft' });
        assert(`PUT /api/admin/products/${testSlug} → 200`, r.status === 200, `name=${r.data?.name}`);
    }
    if (testSlug) {
        const r = await req('DELETE', `/api/admin/products/${testSlug}`);
        assert(`DELETE /api/admin/products/${testSlug} → 200`, r.status === 200, JSON.stringify(r.data));
    }

    // ── 5. Packs CRUD ─────────────────────────────────────────────────────────
    console.log('\n── Admin Packs ──────────────────────────');
    {
        const r = await req('GET', '/api/admin/packs');
        assert('GET /api/admin/packs → 200 + array', r.status === 200 && Array.isArray(r.data), `status ${r.status}, count=${r.data?.length}`);
    }
    {
        const body = { name: 'Test QA Pack', price: 250000, status: 'draft', items: [] };
        const r = await req('POST', '/api/admin/packs', body);
        assert('POST /api/admin/packs → 201', r.status === 201, `status ${r.status} ${JSON.stringify(r.data)}`);
        testPackSlug = r.data?.slug;
        assert('New pack has a slug', !!testPackSlug, testPackSlug);
    }
    if (testPackSlug) {
        const r = await req('GET', `/api/admin/packs/${testPackSlug}`);
        assert(`GET /api/admin/packs/${testPackSlug} → 200`, r.status === 200, `name=${r.data?.name}`);
    }
    if (testPackSlug) {
        const r = await req('PUT', `/api/admin/packs/${testPackSlug}`, { name: 'Test QA Pack UPDATED', price: 300000, status: 'draft' });
        assert(`PUT /api/admin/packs/${testPackSlug} → 200`, r.status === 200, `name=${r.data?.name}`);
    }
    if (testPackSlug) {
        const r = await req('DELETE', `/api/admin/packs/${testPackSlug}`);
        assert(`DELETE /api/admin/packs/${testPackSlug} → 200`, r.status === 200, JSON.stringify(r.data));
    }

    // ── 6. Orders ─────────────────────────────────────────────────────────────
    console.log('\n── Admin Orders ─────────────────────────');
    {
        const r = await req('GET', '/api/admin/orders');
        assert('GET /api/admin/orders → 200', r.status === 200, `status ${r.status}, count=${Array.isArray(r.data) ? r.data.length : '?'}`);
        if (Array.isArray(r.data) && r.data.length > 0) {
            testOrderId = r.data[0].id;
        }
    }
    if (testOrderId) {
        const r = await req('PUT', `/api/admin/orders/${testOrderId}`, { status: 'confirmed' });
        assert(`PUT /api/admin/orders/${testOrderId} (status=confirmed) → 200`, r.status === 200, JSON.stringify(r.data));
    }

    // ── 7. Public API ─────────────────────────────────────────────────────────
    console.log('\n── Public API ───────────────────────────');
    {
        const r = await req('GET', '/api/products');
        assert('GET /api/products → 200 + array', r.status === 200 && Array.isArray(r.data), `count=${r.data?.length}`);
    }
    {
        const r = await req('GET', '/api/packs');
        assert('GET /api/packs → 200 + array', r.status === 200 && Array.isArray(r.data), `count=${r.data?.length}`);
    }

    // ── 8. Logout ─────────────────────────────────────────────────────────────
    console.log('\n── Logout ───────────────────────────────');
    {
        const r = await req('POST', '/api/logout');
        assert('POST /api/logout → 200', r.status === 200, JSON.stringify(r.data));
    }
    {
        cookie = '';
        const r = await req('GET', '/api/admin/me');
        assert('GET /api/admin/me → not authenticated after logout', r.data.authenticated === false, JSON.stringify(r.data));
    }

    // ── Summary ───────────────────────────────────────────────────────────────
    console.log('\n══════════════════════════════════════════');
    console.log(`  RESULTS: ${passed} passed, ${failed} failed`);
    console.log('══════════════════════════════════════════\n');
    process.exit(failed > 0 ? 1 : 0);
}

main().catch(err => { console.error(err); process.exit(1); });
