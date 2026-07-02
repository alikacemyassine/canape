/**
 * create-contact-requests-table.mjs
 * Creates the contact_requests table in Supabase via the Management/Query API.
 * Run once: node scripts/create-contact-requests-table.mjs
 */
import 'dotenv/config';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
    console.error('❌  Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env');
    process.exit(1);
}

// Extract project ref from URL: https://xyzxyz.supabase.co → xyzxyz
const projectRef = supabaseUrl.replace('https://', '').split('.')[0];

const sql = `
-- Create contact_requests table
CREATE TABLE IF NOT EXISTS public.contact_requests (
    id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name        text NOT NULL,
    email       text NOT NULL,
    phone       text,
    message     text,
    status      text NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'read', 'replied')),
    created_at  timestamptz NOT NULL DEFAULT now()
);

-- Index for fast filtering by status and date
CREATE INDEX IF NOT EXISTS contact_requests_status_idx ON public.contact_requests (status);
CREATE INDEX IF NOT EXISTS contact_requests_created_at_idx ON public.contact_requests (created_at DESC);

-- Enable Row Level Security (table is only accessed server-side via service role)
ALTER TABLE public.contact_requests ENABLE ROW LEVEL SECURITY;

-- Allow anon/authenticated users to INSERT only (for the contact form submission)
CREATE POLICY IF NOT EXISTS "Allow public insert"
    ON public.contact_requests
    FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

-- Only service role can SELECT (admin reads via server-side API with service role key)
-- No SELECT policy = only service_role can read (RLS blocks all other reads)
`;

console.log('📡  Connecting to Supabase project:', projectRef);
console.log('📝  Running SQL migration...\n');

const endpoint = `https://api.supabase.com/v1/projects/${projectRef}/database/query`;

const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
        'Authorization': `Bearer ${serviceRoleKey}`,
        'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query: sql }),
});

if (res.ok) {
    const data = await res.json().catch(() => ({}));
    console.log('✅  contact_requests table created successfully!');
    if (data && Object.keys(data).length > 0) console.log('   Response:', JSON.stringify(data, null, 2));
} else {
    // Fall back to Supabase REST query endpoint
    const text = await res.text();
    console.warn('⚠️   Management API response:', res.status, text);
    console.log('\n🔄  Trying alternative endpoint (pg REST)...');

    // Try via the Supabase SQL endpoint used by the dashboard
    const altRes = await fetch(`${supabaseUrl}/rest/v1/rpc/query`, {
        method: 'POST',
        headers: {
            'apikey': serviceRoleKey,
            'Authorization': `Bearer ${serviceRoleKey}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: sql }),
    });

    const altText = await altRes.text();
    if (altRes.ok) {
        console.log('✅  Table created via alternative endpoint!');
    } else {
        console.error('❌  Alternative endpoint also failed:', altRes.status, altText);
        console.log('\n📋  Please run this SQL manually in the Supabase SQL Editor:');
        console.log('    https://supabase.com/dashboard/project/' + projectRef + '/sql/new\n');
        console.log(sql);
    }
}
