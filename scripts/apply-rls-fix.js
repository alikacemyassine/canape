import pkg from 'pg';
const { Client } = pkg;
import dotenv from 'dotenv';
dotenv.config();

const sql = `
-- 1. Activer RLS sur les tables
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlists ENABLE ROW LEVEL SECURITY;

-- 2. Créer les politiques pour la table orders (Réservations)
DROP POLICY IF EXISTS "Les utilisateurs peuvent voir leurs propres commandes" ON public.orders;
CREATE POLICY "Les utilisateurs peuvent voir leurs propres commandes"
ON public.orders FOR SELECT
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Les utilisateurs peuvent créer des commandes" ON public.orders;
CREATE POLICY "Les utilisateurs peuvent créer des commandes"
ON public.orders FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- 3. Créer les politiques pour la table wishlists (Favoris)
DROP POLICY IF EXISTS "Les utilisateurs peuvent voir leurs favoris" ON public.wishlists;
CREATE POLICY "Les utilisateurs peuvent voir leurs favoris"
ON public.wishlists FOR SELECT
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Les utilisateurs peuvent ajouter des favoris" ON public.wishlists;
CREATE POLICY "Les utilisateurs peuvent ajouter des favoris"
ON public.wishlists FOR INSERT
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Les utilisateurs peuvent supprimer des favoris" ON public.wishlists;
CREATE POLICY "Les utilisateurs peuvent supprimer des favoris"
ON public.wishlists FOR DELETE
USING (auth.uid() = user_id);
`;

async function applyFix() {
    console.log('Connecting to Supabase PostgreSQL...');
    const client = new Client({
        user: 'postgres.lbzntaeafywtvqcpylcr',
        password: '7+zA:1(67ao@z6Ki:z',
        host: 'aws-0-eu-central-1.pooler.supabase.com',
        port: 6543,
        database: 'postgres',
        ssl: {
            rejectUnauthorized: false
        }
    });
    
    try {
        await client.connect();
        console.log('✅ Connected. Applying RLS policies...');
        await client.query(sql);
        console.log('✅ RLS policies applied successfully!');
    } catch (err) {
        console.error('❌ Error applying policies:', err);
    } finally {
        await client.end();
    }
}

applyFix();
