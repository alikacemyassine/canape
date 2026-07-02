import nodemailer from 'nodemailer';

const user = 'otp@lecanape-dz.com';
const pass = 'A@va*X@zKbL5kAH';
const host = 'mail.lecanape-dz.com';
const to = 'antgyassine1@gmail.com'; // user's email from previous logs

async function testPort(port, secure) {
    console.log(`\n--- Testing Port ${port} (Secure: ${secure}) ---`);
    const transporter = nodemailer.createTransport({
        host,
        port,
        secure,
        auth: { user, pass },
        connectionTimeout: 5000, // 5 seconds timeout to fail fast
        greetingTimeout: 5000,
        socketTimeout: 5000
    });

    try {
        const info = await transporter.sendMail({
            from: `"Test Canapé" <${user}>`,
            to,
            subject: `Test d'envoi depuis le port ${port}`,
            text: `Si vous recevez ce message, c'est que le port ${port} n'est pas bloqué !`
        });
        console.log(`✅ SUCCÈS sur le port ${port} ! Message ID: ${info.messageId}`);
        return true;
    } catch (err) {
        console.error(`❌ ÉCHEC sur le port ${port} :`, err.message);
        return false;
    }
}

async function runAll() {
    console.log("Démarrage du test SMTP local sur votre machine...");
    
    let success = false;
    
    // Test 465 (SSL)
    if (await testPort(465, true)) success = true;
    
    // Test 587 (STARTTLS)
    if (!success && await testPort(587, false)) success = true;
    
    // Test 25 (Unencrypted / STARTTLS)
    if (!success && await testPort(25, false)) success = true;
    
    // Test 2525 (Alternative)
    if (!success && await testPort(2525, false)) success = true;

    if (!success) {
        console.log("\n=======================================================");
        console.log("RÉSULTAT : Tous les ports SMTP sont bloqués par votre connexion internet (ISP).");
        console.log("Impossible d'envoyer l'e-mail depuis votre ordinateur local.");
        console.log("=======================================================");
    }
}

runAll();
