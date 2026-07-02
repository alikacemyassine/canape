/**
 * create-contact-requests-table-pg.mjs
 * Creates the contact_requests table via direct Postgres connection (DATABASE_URL).
 */
import 'dotenv/config';
import pg from 'pg';
const { Client } = pg;

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
    console.error('❌  Missing DATABASE_URL in .env');
    process.exit(1);
}

// Parse manually to handle special characters in the password
// Format: postgres://user:password@host:port/database
const dbUrlMatch = connectionString.match(
    /^postgres(?:ql)?:\/\/([^:]+):(.+)@([^:@]+):(\d+)\/(.+)$/
);
if (!dbUrlMatch) {
    console.error('❌  Could not parse DATABASE_URL');
    process.exit(1);
}
const [, dbUser, dbPassword, dbHost, dbPort, dbName] = dbUrlMatch;

const client = new Client({
    user: dbUser,
    password: dbPassword,
    host: dbHost,
    port: Number(dbPort),
    database: dbName,
    ssl: { rejectUnauthorized: false },
});

const sql = `
-- 1. Create contact_requests table
CREATE TABLE IF NOT EXISTS public.contact_requests (
    id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name        text NOT NULL,
    email       text NOT NULL,
    phone       text,
    message     text,
    status      text NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'read', 'replied')),
    created_at  timestamptz NOT NULL DEFAULT now()
);

-- 2. Indexes for performance
CREATE INDEX IF NOT EXISTS contact_requests_status_idx     ON public.contact_requests (status);
CREATE INDEX IF NOT EXISTS contact_requests_created_at_idx ON public.contact_requests (created_at DESC);

-- 3. Enable Row Level Security
ALTER TABLE public.contact_requests ENABLE ROW LEVEL SECURITY;

-- 4. Allow anyone (anon role) to INSERT — needed for the public contact form
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'public'
          AND tablename  = 'contact_requests'
          AND policyname = 'Allow public insert'
    ) THEN
        CREATE POLICY "Allow public insert"
            ON public.contact_requests
            FOR INSERT
            TO anon, authenticated
            WITH CHECK (true);
    END IF;
END $$;
`;

try {
    console.log('📡  Connecting to Supabase Postgres...');
    await client.connect();
    console.log('✅  Connected.\n📝  Running migration...\n');

    await client.query(sql);

    // Verify the table exists
    const check = await client.query(`
        SELECT column_name, data_type
        FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'contact_requests'
        ORDER BY ordinal_position;
    `);

    if (check.rows.length > 0) {
        console.log('✅  contact_requests table is ready!\n');
        console.log('   Columns:');
        check.rows.forEach(r => console.log(`   • ${r.column_name.padEnd(15)} ${r.data_type}`));
    } else {
        console.warn('⚠️   Table may not have been created — no columns found.');
    }

} catch (err) {
    console.error('❌  Migration failed:', err.message);
    process.exit(1);
} finally {
    await client.end();
}
