import { getProducts } from './_lib/storage.js';

export default async function handler(req, res) {
    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300');

    if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

    const products = await getProducts();
    const published = products.filter((p) => !p.archived && p.status === 'published');
    return res.status(200).json(published);
}
