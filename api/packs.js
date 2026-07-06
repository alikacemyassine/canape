import { getPacks } from './_lib/storage.js';

export default async function handler(req, res) {
    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300');
    res.setHeader('Content-Type', 'application/json; charset=utf-8');

    if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

    try {
        const packs = await getPacks();
        const published = packs.filter(p => p.status === 'published' && !p.archived);

        // Map database columns to frontend expectations
        const formatted = published.map(p => ({
            ...p,
            oldPrice: p.oldPrice || p.old_price,
            nameDisplay: (p.name || '').toUpperCase(),
            categoryLabel: (p.categoryLabel || p.category || 'SALON').toUpperCase(),
        }));

        return res.status(200).json(formatted);
    } catch (err) {
        console.error('Error fetching packs:', err);
        return res.status(500).json({ error: 'Erreur serveur' });
    }
}
