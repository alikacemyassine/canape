import { requireAdmin } from '../_lib/auth.js';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

function sendError(res, err) {
    const status = err.statusCode || 500;
    console.error(err);
    return res.status(status).json({ error: 'Erreur lors de la sauvegarde sur Supabase.' });
}

export function slugify(text) {
    return text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function buildPack(body, existing = null) {
    const name = (body.name || existing?.name || '').trim();
    const slug = existing?.slug || slugify(body.slug || name);
    const price = Number(body.price ?? existing?.price ?? 0) || 0;
    const oldPrice = body.oldPrice ? Number(body.oldPrice) : (existing?.old_price ?? null);

    // Accept `items` or `includedProducts` from the form payload
    const items = Array.isArray(body.items) ? body.items
        : Array.isArray(body.includedProducts) ? body.includedProducts
        : (existing?.items || []);

    // Normalise hero image — support both body.heroImage and body.images.hero
    const heroImage = body.images?.hero || body.heroImage || existing?.images?.hero || '';

    return {
        id: existing?.id || slug,
        slug,
        name,
        price,
        old_price: oldPrice,
        description: body.description || existing?.description || '',
        status: body.status || existing?.status || 'draft',
        archived: body.archived ?? existing?.archived ?? false,
        items,
        images: { hero: heroImage, ...(body.images || existing?.images || {}) }
    };
}

export default async function handler(req, res) {
    if (!(await requireAdmin(req, res))) return;

    const { slug } = req.query || {};

    try {
        if (!slug) {
            // General routes (no slug)
            if (req.method === 'GET') {
                const { data, error } = await supabase.from('packs').select('*');
                if (error) throw error;
                return res.status(200).json(data.filter((p) => !p.archived));
            }

            if (req.method === 'POST') {
                const pack = buildPack(req.body || {});
                if (!pack.name) return res.status(400).json({ error: 'Le nom du pack est requis' });
                if (!pack.slug) return res.status(400).json({ error: 'Slug invalide' });
                
                const { data: existing } = await supabase.from('packs').select('id').eq('slug', pack.slug);
                if (existing && existing.length > 0) {
                    return res.status(409).json({ error: 'Un pack avec ce slug existe déjà' });
                }
                
                const { data, error } = await supabase.from('packs').insert([pack]).select();
                if (error) throw error;
                return res.status(201).json(data[0]);
            }
        } else {
            // Specific routes (with slug)
            const { data: existing, error: findError } = await supabase.from('packs').select('*').eq('slug', slug).single();

            if (req.method === 'GET') {
                if (findError || !existing) return res.status(404).json({ error: 'Pack introuvable' });
                return res.status(200).json(existing);
            }

            if (req.method === 'PUT') {
                if (findError || !existing) return res.status(404).json({ error: 'Pack introuvable' });
                
                const updated = buildPack(req.body || {}, existing);
                const { data, error } = await supabase.from('packs').update({
                    name: updated.name,
                    description: updated.description,
                    price: updated.price,
                    old_price: updated.old_price || null,
                    status: updated.status,
                    items: updated.items || [],
                    images: updated.images || {},
                    archived: updated.archived || false
                }).eq('slug', slug).select().single();

                if (error) throw error;
                return res.status(200).json(data);
            }

            if (req.method === 'DELETE') {
                if (findError || !existing) return res.status(404).json({ error: 'Pack introuvable' });
                const { error } = await supabase.from('packs').delete().eq('slug', slug);
                if (error) throw error;
                return res.status(200).json({ ok: true });
            }
        }

        return res.status(405).json({ error: 'Method not allowed' });
    } catch (err) {
        return sendError(res, err);
    }
}
