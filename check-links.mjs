import { readdirSync, readFileSync, statSync } from 'fs';
import { join } from 'path';

function checkLinksAndAssets() {
    const root = process.cwd();
    const files = [];

    // Find all HTML files recursively
    function walk(dir) {
        const items = readdirSync(dir);
        for (const item of items) {
            const p = join(dir, item);
            if (p.includes('node_modules') || p.includes('.git') || p.includes('admin')) continue;
            if (statSync(p).isDirectory()) {
                walk(p);
            } else if (p.endsWith('.html')) {
                files.push(p);
            }
        }
    }
    walk(root);

    let errors = 0;
    
    files.forEach(file => {
        const content = readFileSync(file, 'utf8');
        
        // Simple regex to find hrefs
        const hrefMatches = content.match(/href="([^"]+)"/g) || [];
        hrefMatches.forEach(match => {
            const link = match.replace('href="', '').replace('"', '');
            if (link.startsWith('http')) return; // ignore external
            if (link.startsWith('mailto:')) return;
            if (link.startsWith('#')) return;
            
            // Check if it exists
            const absolutePath = link.startsWith('/') 
                ? join(root, link) 
                : join(file, '..', link);
                
            try {
                statSync(absolutePath);
            } catch (e) {
                // If the link is an HTML file but accessed without .html (e.g. /produits/lampe-bronze/)
                try {
                    statSync(absolutePath.replace(/\/$/, '') + '/index.html');
                } catch(e2) {
                    try {
                        statSync(absolutePath.replace(/\/$/, '') + '.html');
                    } catch(e3) {
                         console.error(`Broken link in ${file.replace(root, '')}: ${link}`);
                         errors++;
                    }
                }
            }
        });

        // Simple regex to find image sources
        const srcMatches = content.match(/src="([^"]+)"/g) || [];
        srcMatches.forEach(match => {
            const link = match.replace('src="', '').replace('"', '');
            if (link.startsWith('http') || link.startsWith('data:')) return;
            
            const absolutePath = link.startsWith('/') 
                ? join(root, link) 
                : join(file, '..', link);
                
            try {
                statSync(absolutePath);
            } catch (e) {
                console.error(`Missing asset in ${file.replace(root, '')}: ${link}`);
                errors++;
            }
        });
    });

    console.log(`\nLink Audit Complete. Found ${errors} errors.`);
    if (errors > 0) process.exit(1);
}

checkLinksAndAssets();
