import { requireAdmin } from '../_lib/auth.js';
import { slugify } from '../_lib/storage.js';
import { mkdir, writeFile } from 'fs/promises';
import { join } from 'path';

export const config = {
    api: {
        bodyParser: {
            sizeLimit: '8mb',
        },
    },
};

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);

function extensionFor(contentType, fileName = '') {
    const existing = fileName.toLowerCase().match(/\.(jpe?g|png|webp|gif)$/)?.[1];
    if (existing) return existing === 'jpeg' ? 'jpg' : existing;
    if (contentType === 'image/jpeg') return 'jpg';
    if (contentType === 'image/png') return 'png';
    if (contentType === 'image/webp') return 'webp';
    if (contentType === 'image/gif') return 'gif';
    return 'jpg';
}

function parseDataUrl(dataUrl) {
    const match = String(dataUrl || '').match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);
    if (!match) return null;
    return {
        contentType: match[1],
        buffer: Buffer.from(match[2], 'base64'),
    };
}

export default async function handler(req, res) {
    if (!requireAdmin(req, res)) return;
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    try {
        const parsed = parseDataUrl(req.body?.dataUrl);
        if (!parsed) return res.status(400).json({ error: 'Image invalide' });
        if (!ALLOWED_TYPES.has(parsed.contentType)) {
            return res.status(400).json({ error: 'Format image non supporte' });
        }
        if (parsed.buffer.length > MAX_IMAGE_BYTES) {
            return res.status(413).json({ error: 'Image trop lourde. Maximum 5 Mo.' });
        }

        const baseName = slugify(req.body?.fileName || 'image') || 'image';
        const ext = extensionFor(parsed.contentType, req.body?.fileName);
        const fileName = `${Date.now()}-${baseName}.${ext}`;

        if (!process.env.BLOB_READ_WRITE_TOKEN) {
            const uploadDir = join(process.cwd(), 'assets', 'uploads');
            await mkdir(uploadDir, { recursive: true });
            await writeFile(join(uploadDir, fileName), parsed.buffer);
            return res.status(201).json({
                url: `/assets/uploads/${fileName}`,
                pathname: `assets/uploads/${fileName}`,
            });
        }

        const { put } = await import('@vercel/blob');
        const pathname = `products/${fileName}`;
        const blob = await put(pathname, parsed.buffer, {
            access: 'public',
            contentType: parsed.contentType,
        });

        return res.status(201).json({ url: blob.url, pathname: blob.pathname });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Impossible d envoyer l image.' });
    }
}
