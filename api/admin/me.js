import { getTokenFromRequest } from '../_lib/auth.js';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req, res) {
    try {
        const token = getTokenFromRequest(req);
        if (!token) return res.status(200).json({ authenticated: false });
        
        const { data: { user }, error } = await supabase.auth.getUser(token);
        if (error || !user) return res.status(200).json({ authenticated: false });

        const adminEmail = process.env.ADMIN_EMAIL || 'admin@lecanape.dz';
        const isAdmin = user.email === adminEmail;
        return res.status(200).json({ authenticated: isAdmin });
    } catch {
        return res.status(200).json({ authenticated: false });
    }
}
