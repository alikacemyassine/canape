import { requireAdmin } from '../_lib/auth.js';
import { getProducts, setProducts, slugify } from '../_lib/storage.js';

function sendError(res, err) {
    const status = err.statusCode || 500;
    const message = status === 503 
        ? 'Stockage non configuré. Connectez Vercel Blob ou Redis/KV au projet.' 
        : 'Impossible de sauvegarder le produit.';
    console.error(err);
    return res.status(status).json({ error: message });
}

function buildProduct(body, existing = null) {
    const now = new Date().toISOString().slice(0, 10);
    const name = (body.name || existing?.name || '').trim();
    const slug = existing?.slug || slugify(body.slug || name);
    const price = Number(body.price ?? existing?.price ?? 0) || 0;
    const oldPrice = body.oldPrice ? Number(body.oldPrice) : (existing?.oldPrice ?? null);

    const colors = Array.isArray(body.colors) ? body.colors.map(c => ({
        hex: c.hex || '#000000',
        label: c.label || 'Sans nom',
        gallery: Array.isArray(c.gallery) ? c.gallery.filter(Boolean) : (c.image ? [c.image] : [])
    })) : (existing?.colors || []);

    const firstGallery = colors[0]?.gallery || [];
    const derivedHero = firstGallery[0] || existing?.heroImage || '';

    return {
        slug,
        name,
        category: body.category || existing?.category || 'canapes',
        categoryLabel: body.categoryLabel || existing?.categoryLabel || 'CANAPÉS',
        price,
        ...(oldPrice ? { oldPrice } : {}),
        ...(body.discountLabel ? { discountLabel: body.discountLabel } : {}),
        currency: body.currency || existing?.currency || 'DZD',
        shortDescription: body.shortDescription || existing?.shortDescription || '',
        description: body.description || existing?.description || '',
        heroImage: derivedHero,
        images: { hero: derivedHero, gallery: firstGallery },
        colors,
        features: Array.isArray(body.features) ? body.features : (existing?.features || []),
        specifications: Array.isArray(body.specifications) ? body.specifications : (existing?.specifications || []),
        options: body.options || existing?.options || { colors: [], materials: [] },
        status: body.status || existing?.status || 'draft',
        archived: body.archived ?? existing?.archived ?? false,
        createdAt: existing?.createdAt || now,
        updatedAt: now,
    };
}

export default async function handler(req, res) {
    if (!requireAdmin(req, res)) return;

    try {
        if (req.method === 'GET') {
            const products = await getProducts();
            return res.status(200).json(products.filter(p => !p.archived));
        }

        if (req.method === 'POST') {
            const products = await getProducts();
            const product = buildProduct(req.body || {});
            
            if (!product.name) return res.status(400).json({ error: 'Le nom du produit est requis' });
            if (!product.slug) return res.status(400).json({ error: 'Slug invalide' });
            
            if (products.some(p => p.slug === product.slug)) {
                return res.status(409).json({ error: 'Un produit avec ce slug existe déjà' });
            }

            products.push(product);
            await setProducts(products);
            return res.status(201).json(product);
        }

        return res.status(405).json({ error: 'Method not allowed' });
    } catch (err) {
        return sendError(res, err);
    }
}
