import { requireAdmin } from '../../_lib/auth.js';
import { getProducts, setProducts } from '../../_lib/storage.js';
import { buildProduct } from '../../_lib/products.js';

function sendError(res, err) {
    const status = err.statusCode || 500;
    const message = status === 503
        ? 'Stockage non configure. Connectez Vercel Blob ou Redis/KV au projet pour enregistrer les articles.'
        : 'Impossible de sauvegarder l article.';
    console.error(err);
    return res.status(status).json({ error: message });
}

export default async function handler(req, res) {
    if (!requireAdmin(req, res)) return;

    try {
        const { slug } = req.query;
        if (!slug) return res.status(400).json({ error: 'Slug requis' });

        const products = await getProducts();
        const index = products.findIndex((p) => p.slug === slug);

        if (req.method === 'GET') {
            if (index === -1) return res.status(404).json({ error: 'Article introuvable' });
            return res.status(200).json(products[index]);
        }

        if (req.method === 'PUT') {
            if (index === -1) return res.status(404).json({ error: 'Article introuvable' });
            const updated = buildProduct(req.body || {}, products[index]);
            products[index] = updated;
            await setProducts(products);
            return res.status(200).json(updated);
        }

        if (req.method === 'DELETE') {
            if (index === -1) return res.status(404).json({ error: 'Article introuvable' });
            products.splice(index, 1);
            await setProducts(products);
            return res.status(200).json({ ok: true });
        }

        if (req.method === 'PATCH') {
            if (index === -1) return res.status(404).json({ error: 'Article introuvable' });
            const { status, archived } = req.body || {};
            if (status) products[index].status = status;
            if (archived !== undefined) products[index].archived = archived;
            products[index].updatedAt = new Date().toISOString().slice(0, 10);
            await setProducts(products);
            return res.status(200).json(products[index]);
        }

        return res.status(405).json({ error: 'Method not allowed' });
    } catch (err) {
        return sendError(res, err);
    }
}
