import { createClient } from '@supabase/supabase-js';
import nodemailer from 'nodemailer';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { email, password, options } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        // Initialize Supabase admin client to bypass the default email sender
        const supabaseAdmin = createClient(
            process.env.VITE_SUPABASE_URL,
            process.env.SUPABASE_SERVICE_ROLE_KEY
        );

        // 1. Create the user directly as confirmed (bypasses email verification)
        const { data: userData, error: createError } = await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: options?.data || {}
        });

        if (createError) {
            console.error('Supabase CreateUser Error:', createError);
            return res.status(400).json({ error: createError.message });
        }

        // Return success immediately without sending an email
        return res.status(200).json({ 
            success: true, 
            message: 'Inscription réussie ! Connexion en cours...'
        });

    } catch (err) {
        console.error('SMTP/Registration Error:', err);
        return res.status(500).json({ 
            error: 'Une erreur est survenue lors de la création du compte.'
        });
    }
}
