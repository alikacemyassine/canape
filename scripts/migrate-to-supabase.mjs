import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials in .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
    console.log('Reading local JSON data...');
    const productsRaw = readFileSync(join(root, 'data', 'products.json'), 'utf8');
    const packsRaw = readFileSync(join(root, 'data', 'packs.json'), 'utf8');
    const products = JSON.parse(productsRaw);
    const packs = JSON.parse(packsRaw);

    console.log(`Uploading ${products.length} products to Supabase...`);
    for (const p of products) {
        const { error } = await supabase.from('products').upsert({
            id: p.id || p.slug,
            name: p.name,
            slug: p.slug,
            description: p.description,
            price: p.price,
            old_price: p.oldPrice || null,
            status: p.status,
            category: p.category,
            colors: p.colors || [],
            images: p.images || [],
            stock: p.stock || 0,
            dimensions: p.dimensions || {},
            archived: p.archived || false
        }, { onConflict: 'id' });
        
        if (error) console.error(`Failed to upload product ${p.name}:`, error.message);
    }

    console.log(`Uploading ${packs.length} packs to Supabase...`);
    for (const p of packs) {
        const { error } = await supabase.from('packs').upsert({
            id: p.id || p.slug,
            name: p.name,
            slug: p.slug,
            description: p.description,
            price: p.price,
            old_price: p.oldPrice || null,
            status: p.status,
            items: p.items || [],
            images: p.images || [],
            archived: p.archived || false
        }, { onConflict: 'id' });
        
        if (error) console.error(`Failed to upload pack ${p.name}:`, error.message);
    }

    console.log('Migration completed successfully!');
}

run();
