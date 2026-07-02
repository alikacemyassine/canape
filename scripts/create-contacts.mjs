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
  connectionString: process.env.DATABASE_URL,
});

async function run() {
  await client.connect();
  console.log("Connected to Supabase via PG.");

  const sql = `
    CREATE TABLE IF NOT EXISTS public.contacts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        message TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;

    DROP POLICY IF EXISTS "Public can insert contacts" ON public.contacts;
    DROP POLICY IF EXISTS "Admin can read contacts" ON public.contacts;

    CREATE POLICY "Public can insert contacts" ON public.contacts FOR INSERT WITH CHECK (true);
    CREATE POLICY "Admin can read contacts" ON public.contacts FOR SELECT USING (true);
  `;

  try {
    await client.query(sql);
    console.log("Created contacts table successfully.");
  } catch (err) {
    console.error("Error creating table:", err);
  } finally {
    await client.end();
  }
}

run();
