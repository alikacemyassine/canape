import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req, res) {
    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300');

    if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

    try {
        const { data: products, error } = await supabase
            .from('products')
            .select('*')
            .eq('status', 'published')
            .eq('archived', false);

        if (error) throw error;

        // Map database columns to frontend expectations
        const formatted = products.map(p => ({
            ...p,
            oldPrice: p.old_price,
            nameDisplay: p.name.toUpperCase(),
            categoryLabel: (p.categoryLabel || p.category || '').toUpperCase(),
            subcategoryLabel: (p.subcategoryLabel || p.subcategory || p.categoryLabel || p.category || '').toUpperCase(),
        }));

        return res.status(200).json(formatted);
    } catch (err) {
        console.error('Error fetching products:', err);
        return res.status(500).json({ error: 'Erreur serveur' });
    }
}
