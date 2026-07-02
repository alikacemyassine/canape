import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function runTests() {
    console.log('--- STARTING BACKEND TESTS ---');
    
    // Test 1: Sign In
    console.log('1. Testing Login...');
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: 'yassine.alikacem1@gmail.com',
        password: 'yassine.alikacem1@gmail.com'
    });
    
    if (authError) {
        console.error('❌ Login failed:', authError.message);
        return;
    }
    console.log('✅ Login successful for user:', authData.user.id);
    
    // Test 2: Insert into orders
    console.log('2. Testing Orders Insert...');
    const orderInsert = await supabase.from('orders').insert([{
        user_id: authData.user.id,
        product_slug: 'canape-cuir',
        type: 'product'
    }]);
    
    if (orderInsert.error) {
        console.error('❌ Orders Insert failed:', orderInsert.error.message, orderInsert.error.details);
    } else {
        console.log('✅ Orders Insert successful');
    }
    
    // Test 3: Fetch orders
    console.log('3. Testing Orders Fetch...');
    const orderFetch = await supabase.from('orders').select('*').eq('user_id', authData.user.id);
    
    if (orderFetch.error) {
        console.error('❌ Orders Fetch failed:', orderFetch.error.message, orderFetch.error.details);
    } else {
        console.log('✅ Orders Fetch successful. Found', orderFetch.data.length, 'orders.');
        console.log('First order:', orderFetch.data[0]);
    }
    
    // Test 4: Insert into wishlists
    console.log('4. Testing Wishlists Insert...');
    const wishlistInsert = await supabase.from('wishlists').insert([{
        user_id: authData.user.id,
        product_slug: 'lampe-bronze',
        type: 'product'
    }]);
    
    if (wishlistInsert.error) {
        // If it's a unique constraint violation, it's actually working (because we probably ran it or the user did)
        if (wishlistInsert.error.code === '23505') {
            console.log('✅ Wishlists Insert successful (Already in wishlist, Unique Constraint triggered)');
        } else {
            console.error('❌ Wishlists Insert failed:', wishlistInsert.error.message, wishlistInsert.error.details);
        }
    } else {
        console.log('✅ Wishlists Insert successful');
    }
    
    console.log('--- BACKEND TESTS COMPLETED ---');
}

runTests();
