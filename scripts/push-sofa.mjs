import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
dotenv.config({ path: path.join(root, '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);
const productsPath = path.join(root, 'data', 'products.json');

async function syncSofaReio() {
    try {
        const products = JSON.parse(fs.readFileSync(productsPath, 'utf8'));
        const sofa = products.find(p => p.slug === 'sofa-reio');
        
        if (!sofa) {
            console.error('sofa-reio not found in products.json');
            return;
        }
        
        // Match EXACTLY the columns from schema.sql:
        // id, name, slug, description, price, old_price, status, category, colors, images, stock, dimensions, archived
        
        const dbPayload = {
            id: sofa.slug,
            name: sofa.name,
            slug: sofa.slug,
            description: sofa.description,
            price: sofa.price,
            old_price: sofa.oldPrice || null,
            status: sofa.status || 'published',
            category: sofa.category,
            colors: sofa.colors || [],
            images: sofa.images || {},
            stock: sofa.stock || 0,
            dimensions: sofa.dimensions || {},
            archived: sofa.archived || false
        };

        // If we want to preserve materials and features, we can inject them into the 'dimensions' or 'images' json if necessary, but let's just omit them for now if the DB doesn't have columns, or we can use another JSON column. 
        // Wait! Let's check if the frontend uses materials or features.
        // Actually, we can add them to the 'colors' or 'dimensions' JSON if we really need to, but the frontend pdp.js looks for `product.features` and `product.materials`. Since the columns don't exist, we'll just upsert what we can to fix the 404.

        const { data, error } = await supabase.from('products').upsert(dbPayload, { onConflict: 'slug' });

        if (error) {
            console.error('Error inserting to Supabase:', error);
        } else {
            console.log('Successfully inserted sofa-reio into Supabase.');
        }
    } catch (err) {
        console.error(err);
    }
}

syncSofaReio();
