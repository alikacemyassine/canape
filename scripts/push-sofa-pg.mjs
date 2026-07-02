import pkg from 'pg';
const { Client } = pkg;
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
dotenv.config({ path: path.join(root, '.env') });

const client = new Client({
  host: 'aws-0-eu-central-1.pooler.supabase.com',
  port: 6543,
  database: 'postgres',
  user: 'postgres.lbzntaeafywtvqcpylcr',
  password: '7+zA:1(67ao@z6Ki:z',
  ssl: { rejectUnauthorized: false }
});

async function run() {
  await client.connect();
  console.log("Connected to Supabase via PG.");

  const sql = `
    ALTER TABLE public.products ADD COLUMN IF NOT EXISTS short_description TEXT;
    ALTER TABLE public.products ADD COLUMN IF NOT EXISTS features JSONB;
    ALTER TABLE public.products ADD COLUMN IF NOT EXISTS specifications JSONB;
    ALTER TABLE public.products ADD COLUMN IF NOT EXISTS materials JSONB;
    ALTER TABLE public.products ADD COLUMN IF NOT EXISTS options JSONB;
    ALTER TABLE public.products ADD COLUMN IF NOT EXISTS category_label TEXT;
    ALTER TABLE public.products ADD COLUMN IF NOT EXISTS subcategory TEXT;
    ALTER TABLE public.products ADD COLUMN IF NOT EXISTS subcategory_label TEXT;
    ALTER TABLE public.products ADD COLUMN IF NOT EXISTS subsubcategory TEXT;
    ALTER TABLE public.products ADD COLUMN IF NOT EXISTS subsubcategory_label TEXT;
    ALTER TABLE public.products ADD COLUMN IF NOT EXISTS discount_label TEXT;
    ALTER TABLE public.products ADD COLUMN IF NOT EXISTS currency TEXT;
    ALTER TABLE public.products ADD COLUMN IF NOT EXISTS hero_image TEXT;
  `;

  try {
    await client.query(sql);
    console.log("Added missing columns to products table.");

    const productsPath = path.join(root, 'data', 'products.json');
    const products = JSON.parse(fs.readFileSync(productsPath, 'utf8'));
    const sofa = products.find(p => p.slug === 'sofa-reio');

    if (!sofa) {
      console.error('sofa-reio not found in products.json');
      return;
    }

    const upsertSql = `
      INSERT INTO public.products (
        id, slug, name, category, category_label, subcategory, subcategory_label, subsubcategory, subsubcategory_label,
        price, old_price, discount_label, currency, short_description, description, hero_image, images, colors, features,
        specifications, dimensions, materials, options, status, archived, stock
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26
      )
      ON CONFLICT (slug) DO UPDATE SET
        name = EXCLUDED.name,
        category = EXCLUDED.category,
        category_label = EXCLUDED.category_label,
        subcategory = EXCLUDED.subcategory,
        subcategory_label = EXCLUDED.subcategory_label,
        subsubcategory = EXCLUDED.subsubcategory,
        subsubcategory_label = EXCLUDED.subsubcategory_label,
        price = EXCLUDED.price,
        old_price = EXCLUDED.old_price,
        discount_label = EXCLUDED.discount_label,
        currency = EXCLUDED.currency,
        short_description = EXCLUDED.short_description,
        description = EXCLUDED.description,
        hero_image = EXCLUDED.hero_image,
        images = EXCLUDED.images,
        colors = EXCLUDED.colors,
        features = EXCLUDED.features,
        specifications = EXCLUDED.specifications,
        dimensions = EXCLUDED.dimensions,
        materials = EXCLUDED.materials,
        options = EXCLUDED.options,
        status = EXCLUDED.status,
        archived = EXCLUDED.archived,
        stock = EXCLUDED.stock;
    `;

    await client.query(upsertSql, [
      sofa.slug, sofa.slug, sofa.name, sofa.category, sofa.categoryLabel, sofa.subcategory || null, sofa.subcategoryLabel || null, sofa.subsubcategory || null, sofa.subsubcategoryLabel || null,
      sofa.price, sofa.oldPrice || null, sofa.discountLabel || null, sofa.currency || 'DZD', sofa.shortDescription || null, sofa.description, sofa.heroImage || null, JSON.stringify(sofa.images || {}), JSON.stringify(sofa.colors || []), JSON.stringify(sofa.features || []),
      JSON.stringify(sofa.specifications || []), JSON.stringify(sofa.dimensions || {}), JSON.stringify(sofa.materials || []), JSON.stringify(sofa.options || {}), sofa.status, sofa.archived || false, sofa.stock || 0
    ]);
    
    console.log("Upserted sofa-reio into Supabase via PG.");
  } catch (err) {
    console.error("Error modifying table:", err);
  } finally {
    await client.end();
  }
}

run();
