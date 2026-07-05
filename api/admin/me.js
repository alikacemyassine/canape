import { getTokenFromRequest } from '../_lib/auth.js';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req, res) {
    try {
        const token = getTokenFromRequest(req);
        if (!token) {
            console.log(`[Auth Failed] No token found in request cookie.`);
            return res.status(200).json({ authenticated: false, debug_error: 'No token found in cookie' });
        }
        
        const { data: { user }, error } = await supabase.auth.getUser(token);
        if (error || !user) {
            console.log(`[Auth Failed] getUser error:`, error?.message || 'No user object');
            return res.status(200).json({ authenticated: false, debug_error: error ? error.message : 'getUser returned no user' });
        }

        const adminEmail = (process.env.ADMIN_EMAIL || 'canape.oran@gmail.com').trim().toLowerCase();
        const isAdmin = user.email && user.email.toLowerCase().trim() === adminEmail;
        if (!isAdmin) {
            console.log(`[Auth Failed] Email mismatch: ${user.email} != ${adminEmail}`);
            return res.status(200).json({ authenticated: false, debug_error: `Email mismatch: ${user.email} != ${adminEmail}` });
        }
        return res.status(200).json({ authenticated: true });
    } catch (err) {
        console.error(`[Auth Error] ${err.message}`);
        return res.status(200).json({ authenticated: false, debug_error: err.message });
    }
}
