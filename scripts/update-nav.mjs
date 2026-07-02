import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

// Read the definitive navigation from index.html
const indexHtmlPath = path.join(ROOT_DIR, 'index.html');
const indexHtmlContent = fs.readFileSync(indexHtmlPath, 'utf8');

const navRegex = /<nav[^>]*id="main-nav"[^>]*>[\s\S]*?<\/nav>/i;
const match = indexHtmlContent.match(navRegex);

if (!match) {
    console.error("Error: Could not find <nav id=\"main-nav\"> in index.html");
    process.exit(1);
}

const definitiveNav = match[0];
console.log("Extracted definitive nav block.");

let updatedCount = 0;

function processDirectory(dir) {
    const files = fs.readdirSync(dir);
    
    for (const file of files) {
        // Skip node_modules, .git, etc.
        if (['node_modules', '.git', 'scripts', 'assets', 'data'].includes(file)) continue;
        
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory()) {
            processDirectory(filePath);
        } else if (file.endsWith('.html') && filePath !== indexHtmlPath) {
            let content = fs.readFileSync(filePath, 'utf8');
            if (navRegex.test(content)) {
                content = content.replace(navRegex, definitiveNav);
                fs.writeFileSync(filePath, content, 'utf8');
                console.log(`Updated navigation in: ${path.relative(ROOT_DIR, filePath)}`);
                updatedCount++;
            }
        }
    }
}

console.log("Starting navigation sync...");
processDirectory(ROOT_DIR);
console.log(`Navigation sync complete. Updated ${updatedCount} files.`);
