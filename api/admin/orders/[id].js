import { createClient } from '@supabase/supabase-js';
import { requireAdmin } from '../../_lib/auth.js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req, res) {
    if (!await requireAdmin(req, res)) return;

    if (req.method !== 'PUT') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { id } = req.query;
    const { status } = req.body || {};

    if (!status || !['pending', 'confirmed', 'cancelled'].includes(status)) {
        return res.status(400).json({ error: 'Statut invalide' });
    }

    try {
        const { data, error } = await supabase
            .from('orders')
            .update({ status })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        
        return res.status(200).json(data);
    } catch (err) {
        console.error('Error updating order:', err);
        return res.status(500).json({ error: 'Erreur lors de la mise à jour de la commande' });
    }
}
