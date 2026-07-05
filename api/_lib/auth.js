import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export function getTokenFromRequest(req) {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        return authHeader.substring(7);
    }
    const cookie = req.headers.cookie || '';
    const match = cookie.match(/(?:^|;\s*)sb-access-token=([^;]+)/);
    return match ? decodeURIComponent(match[1]) : null;
}

export async function requireAdmin(req, res) {
    const token = getTokenFromRequest(req);
    if (!token) {
        res.status(401).json({ error: 'Non autorisé' });
        return false;
    }

    try {
        const { data: { user }, error } = await supabase.auth.getUser(token);
        
        if (error || !user) {
            console.error('requireAdmin error:', error);
            res.status(401).json({ error: 'Session invalide ou expirée' });
            return false;
        }

        const adminEmail = (process.env.ADMIN_EMAIL || 'admin@lecanape.dz').trim().toLowerCase();
        const userEmail = (user.email || '').trim().toLowerCase();
        
        if (userEmail !== adminEmail) {
            res.status(403).json({ error: 'Accès refusé. Réservé aux administrateurs.' });
            return false;
        }

        req.user = user;
        return true;
    } catch (err) {
        console.error('requireAdmin caught error:', err);
        res.status(401).json({ error: 'Erreur interne' });
        return false;
    }
}

