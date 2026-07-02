import { createClient } from '@supabase/supabase-js';
import { requireAdmin } from '../_lib/auth.js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req, res) {
    if (!await requireAdmin(req, res)) return;

    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // Fetch all orders
        const { data: orders, error: ordersError } = await supabase
            .from('orders')
            .select('*')
            .order('created_at', { ascending: false });

        if (ordersError) throw ordersError;

        // Fetch all users (Service Role Key required for admin.listUsers)
        const { data: { users }, error: usersError } = await supabase.auth.admin.listUsers();
        if (usersError) throw usersError;

        // Map users for fast lookup
        const userMap = {};
        users.forEach(u => {
            userMap[u.id] = {
                email: u.email,
                metadata: u.user_metadata || {}
            };
        });

        // Attach user info to orders
        const enrichedOrders = orders.map(order => {
            const user = userMap[order.user_id] || { email: 'Inconnu', metadata: {} };
            return {
                ...order,
                user: {
                    email: user.email,
                    first_name: user.metadata.first_name || '',
                    last_name: user.metadata.last_name || '',
                    phone: user.metadata.phone || 'Non renseigné',
                    address: user.metadata.address || 'Non renseignée'
                }
            };
        });

        return res.status(200).json(enrichedOrders);
    } catch (err) {
        console.error('Error fetching orders:', err);
        return res.status(500).json({ error: 'Erreur lors de la récupération des commandes' });
    }
}
