// app.cjs
// This is a CommonJS wrapper to allow cPanel Passenger to load an ES Module.
// Passenger uses require(), which fails on ES modules. This file bridges the gap.

import('./app.js').catch(err => {
    console.error('Failed to load ES Module app.js:', err);
    process.exit(1);
});
