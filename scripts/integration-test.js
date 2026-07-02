import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_SERVICE_KEY) {
    console.error('Missing SUPABASE_SERVICE_ROLE_KEY in .env');
    process.exit(1);
}

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function runFullIntegrationTest() {
    console.log('--- STARTING FULL BACKEND INTEGRATION TEST ---');
    
    // 1. Create a mock user (pre-verified)
    console.log('1. Creating Mock User...');
    const testEmail = `testuser_${Date.now()}@example.com`;
    const testPassword = 'TestPassword123!';
    
    const { data: userData, error: userError } = await supabaseAdmin.auth.admin.createUser({
        email: testEmail,
        password: testPassword,
        email_confirm: true // Force verified
    });
    
    if (userError) {
        console.error('❌ Failed to create mock user:', userError.message);
        return;
    }
    
    const userId = userData.user.id;
    console.log(`✅ Mock user created successfully (ID: ${userId})`);
    
    // 2. Client logs in with the new user
    console.log('2. Testing Client Login...');
    const supabaseClient = createClient(SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
    const { data: authData, error: authError } = await supabaseClient.auth.signInWithPassword({
        email: testEmail,
        password: testPassword
    });
    
    if (authError) {
        console.error('❌ Client Login failed:', authError.message);
    } else {
        console.log('✅ Client Login successful');
    }
    
    // 3. Insert into Orders (Panier/Reservation)
    console.log('3. Testing Orders Insert (Panier)...');
    const { error: orderError } = await supabaseClient.from('orders').insert([{
        user_id: userId,
        product_slug: 'canape-cuir',
        type: 'product'
    }]);
    
    if (orderError) {
        console.error('❌ Orders Insert failed:', orderError.message, orderError.details);
    } else {
        console.log('✅ Orders Insert successful');
    }
    
    // 4. Fetch Orders
    console.log('4. Testing Orders Fetch...');
    const { data: ordersData, error: orderFetchError } = await supabaseClient.from('orders').select('*').eq('user_id', userId);
    if (orderFetchError) {
        console.error('❌ Orders Fetch failed:', orderFetchError.message);
    } else if (!ordersData || ordersData.length === 0) {
        console.error('❌ Orders Fetch returned empty data!');
    } else {
        console.log(`✅ Orders Fetch successful. Found ${ordersData.length} order(s).`);
    }
    
    // 5. Insert into Wishlists
    console.log('5. Testing Wishlists Insert...');
    const { error: wishlistError } = await supabaseClient.from('wishlists').insert([{
        user_id: userId,
        product_slug: 'lampe-bronze',
        type: 'product'
    }]);
    
    if (wishlistError) {
        console.error('❌ Wishlists Insert failed:', wishlistError.message, wishlistError.details);
    } else {
        console.log('✅ Wishlists Insert successful');
    }
    
    // 6. Fetch Wishlists
    console.log('6. Testing Wishlists Fetch...');
    const { data: wishlistData, error: wishlistFetchError } = await supabaseClient.from('wishlists').select('*').eq('user_id', userId);
    if (wishlistFetchError) {
        console.error('❌ Wishlists Fetch failed:', wishlistFetchError.message);
    } else if (!wishlistData || wishlistData.length === 0) {
        console.error('❌ Wishlists Fetch returned empty data!');
    } else {
        console.log(`✅ Wishlists Fetch successful. Found ${wishlistData.length} item(s).`);
    }
    
    // 7. Cleanup
    console.log('7. Cleaning up (Deleting mock user)...');
    const { error: delError } = await supabaseAdmin.auth.admin.deleteUser(userId);
    if (delError) {
        console.error('❌ Failed to delete mock user:', delError.message);
    } else {
        console.log('✅ Mock user deleted successfully. Related orders and wishlists should cascade delete.');
    }
    
    console.log('--- INTEGRATION TEST COMPLETED ---');
}

runFullIntegrationTest();
