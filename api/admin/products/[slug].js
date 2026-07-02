import { requireAdmin } from '../../_lib/auth.js';
import { getProducts, setProducts, slugify } from '../../_lib/storage.js';

function sendError(res, err) {
    const status = err.statusCode || 500;
    const message = status === 503 
        ? 'Stockage non configuré.' 
        : 'Impossible de sauvegarder le produit.';
    console.error(err);
    return res.status(status).json({ error: message });
}

function buildProduct(body, existing) {
    const now = new Date().toISOString().slice(0, 10);
    const price = Number(body.price ?? existing.price ?? 0) || 0;
    const oldPrice = body.oldPrice ? Number(body.oldPrice) : (existing.oldPrice ?? null);

    const colors = Array.isArray(body.colors) ? body.colors.map(c => ({
        hex: c.hex || '#000000',
        label: c.label || 'Sans nom',
        gallery: Array.isArray(c.gallery) ? c.gallery.filter(Boolean) : (c.image ? [c.image] : [])
    })) : existing.colors || [];

    const firstGallery = colors[0]?.gallery || [];
    const derivedHero = firstGallery[0] || existing.heroImage || '';

    return {
        ...existing,
        slug: existing.slug,
        name: (body.name || existing.name || '').trim(),
        category: body.category || existing.category || 'canapes',
        categoryLabel: body.categoryLabel || existing.categoryLabel || 'CANAPÉS',
        price,
        ...(oldPrice ? { oldPrice } : {}),
        ...(body.discountLabel ? { discountLabel: body.discountLabel } : {}),
        currency: body.currency || existing.currency || 'DZD',
        shortDescription: body.shortDescription ?? existing.shortDescription ?? '',
        description: body.description ?? existing.description ?? '',
        heroImage: derivedHero,
        images: { hero: derivedHero, gallery: firstGallery },
        colors,
        features: Array.isArray(body.features) ? body.features : existing.features,
        specifications: Array.isArray(body.specifications) ? body.specifications : existing.specifications,
        options: body.options || existing.options,
        status: body.status || existing.status || 'draft',
        updatedAt: now,
    };
}

export default async function handler(req, res) {
    if (!(await requireAdmin(req, res))) return;

    const { slug } = req.query;

    try {
        const products = await getProducts();
        const index = products.findIndex(p => p.slug === slug);
        
        if (index === -1) {
            return res.status(404).json({ error: 'Produit non trouvé' });
        }

        const existing = products[index];

        if (req.method === 'GET') {
            return res.status(200).json(existing);
        }

        if (req.method === 'PUT') {
            const updated = buildProduct(req.body || {}, existing);
            products[index] = updated;
            await setProducts(products);
            return res.status(200).json(updated);
        }

        if (req.method === 'DELETE') {
            existing.archived = true;
            existing.updatedAt = new Date().toISOString().slice(0, 10);
            await setProducts(products);
            return res.status(200).json({ success: true, message: 'Produit archivé' });
        }

        return res.status(405).json({ error: 'Method not allowed' });
    } catch (err) {
        return sendError(res, err);
    }
}
