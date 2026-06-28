import crypto from 'crypto';

const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

function secret() {
    return process.env.ADMIN_SECRET || process.env.ADMIN_PASSWORD || 'change-me-in-production';
}

export function createSessionToken() {
    const payload = { exp: Date.now() + MAX_AGE_MS };
    const data = Buffer.from(JSON.stringify(payload)).toString('base64url');
    const sig = crypto.createHmac('sha256', secret()).update(data).digest('base64url');
    return `${data}.${sig}`;
}

export function verifySessionToken(token) {
    if (!token || typeof token !== 'string') return false;
    const parts = token.split('.');
    if (parts.length !== 2) return false;
    const [data, sig] = parts;
    const expected = crypto.createHmac('sha256', secret()).update(data).digest('base64url');
    if (sig !== expected) return false;
    try {
        const payload = JSON.parse(Buffer.from(data, 'base64url').toString());
        return payload.exp > Date.now();
    } catch {
        return false;
    }
}

export function getTokenFromRequest(req) {
    const cookie = req.headers.cookie || '';
    const match = cookie.match(/(?:^|;\s*)admin_session=([^;]+)/);
    return match ? decodeURIComponent(match[1]) : null;
}

export function requireAdmin(req, res) {
    const token = getTokenFromRequest(req);
    if (!verifySessionToken(token)) {
        res.status(401).json({ error: 'Unauthorized' });
        return false;
    }
    return true;
}

export function setSessionCookie(res, token) {
    const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
    res.setHeader(
        'Set-Cookie',
        `admin_session=${encodeURIComponent(token)}; HttpOnly; Path=/; Max-Age=${MAX_AGE_MS / 1000}; SameSite=Lax${secure}`
    );
}

export function clearSessionCookie(res) {
    const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
    res.setHeader('Set-Cookie', `admin_session=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax${secure}`);
}

export function checkPassword(password) {
    const expected = process.env.ADMIN_PASSWORD;
    if (!expected) return password === 'canape-admin';
    return password === expected;
}
