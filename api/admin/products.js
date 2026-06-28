import { requireAdmin } from '../_lib/auth.js';
import { getProducts, setProducts } from '../_lib/storage.js';
import { buildProduct } from '../_lib/products.js';

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
        if (req.method === 'GET') {
            const products = await getProducts();
            return res.status(200).json(products.filter((p) => !p.archived));
        }

        if (req.method === 'POST') {
            const products = await getProducts();
            const product = buildProduct(req.body || {});
            if (!product.name) return res.status(400).json({ error: 'Le titre est requis' });
            if (!product.slug) return res.status(400).json({ error: 'Slug invalide' });
            if (products.some((p) => p.slug === product.slug)) {
                return res.status(409).json({ error: 'Un article avec ce slug existe deja' });
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
