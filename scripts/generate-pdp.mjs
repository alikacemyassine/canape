/**
 * Generates SEO-friendly product and composition pages from data/*.json.
 * Run: npm run generate
 */
import { readFileSync, mkdirSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const siteUrl = 'https://canape.vercel.app';
const today = new Date().toISOString().slice(0, 10);

const products = JSON.parse(readFileSync(join(root, 'data', 'products.json'), 'utf8'))
    .filter((item) => item.status === 'published' && item.archived !== true);
const packs = JSON.parse(readFileSync(join(root, 'data', 'packs.json'), 'utf8'))
    .filter((item) => item.status === 'published' && item.archived !== true);

const escapeAttr = (value = '') => String(value).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
const jsonScript = (value) => JSON.stringify(value).replace(/</g, '\\u003c');

const tailwindConfig = `tailwind.config = {
    darkMode: "class",
    theme: { extend: {
        colors: {
            primary: "#964900", "primary-container": "#f08128", background: "#fff8f3",
            "on-background": "#201b13", "on-surface": "#201b13", "on-surface-variant": "#564337",
            "inverse-surface": "#353027", "inverse-on-surface": "#faefe1",
            "outline-variant": "#ddc1b1", outline: "#897265", "on-primary": "#ffffff",
            secondary: "#5f5e5e", surface: "#fff8f3", "brand-gold": "#c9a96e",
            "surface-container": "#f7ecdf", "surface-container-low": "#fdf2e4",
            "surface-container-lowest": "#ffffff", "surface-container-highest": "#ece1d3",
            "surface-variant": "#ece1d3"
        },
        spacing: { "margin-mobile": "24px", "margin-desktop": "80px", "section-gap": "160px", gutter: "32px", "stack-lg": "48px", "stack-md": "24px" },
        fontFamily: { "headline-md": ["Playfair Display"], "headline-lg": ["Playfair Display"], "display-lg": ["Playfair Display"], "body-lg": ["Inter"], "body-md": ["Inter"], "label-caps": ["Inter"] },
        fontSize: {
            "headline-md": ["32px", { lineHeight: "40px", fontWeight: "500" }],
            "headline-lg": ["48px", { lineHeight: "56px", fontWeight: "500" }],
            "display-lg": ["80px", { lineHeight: "96px", fontWeight: "600" }],
            "body-lg": ["18px", { lineHeight: "32px" }],
            "body-md": ["16px", { lineHeight: "24px" }],
            "label-caps": ["12px", { lineHeight: "16px", letterSpacing: "0.1em", fontWeight: "600" }]
        }
    } }
};`;

const headAssets = (depth) => `
<link rel="icon" type="image/png" href="${depth}logo.png"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com" rel="preconnect"/>
<link crossorigin href="https://fonts.gstatic.com" rel="preconnect"/>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Playfair+Display:wght@500;600;700&display=swap" rel="stylesheet"/>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<script id="tailwind-config">${tailwindConfig}</script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js"></script>
<script src="https://unpkg.com/@studio-freight/lenis@1.0.39/dist/lenis.min.js"></script>
<link rel="stylesheet" href="${depth}assets/site.css"/>`;

const nav = (depth, active) => `
<nav class="fixed top-0 w-full z-50 glass-nav flex justify-between items-center px-margin-mobile md:px-margin-desktop py-6 transition-all duration-500" id="main-nav">
    <div class="hidden md:flex gap-8 items-center">
        <a class="font-label-caps text-label-caps tracking-[0.1em] uppercase ${active === 'home' ? 'text-primary border-b border-primary pb-1' : 'text-on-surface-variant hover:text-primary transition-colors duration-300'}" href="${depth}index.html">Accueil</a>
        <a class="font-label-caps text-label-caps tracking-[0.1em] uppercase ${active === 'products' ? 'text-primary border-b border-primary pb-1' : 'text-on-surface-variant hover:text-primary transition-colors duration-300'}" href="${depth}produits/">Collections</a>
        <a class="font-label-caps text-label-caps tracking-[0.1em] uppercase ${active === 'packs' ? 'text-primary border-b border-primary pb-1' : 'text-on-surface-variant hover:text-primary transition-colors duration-300'}" href="${depth}packs/">Compositions</a>
    </div>
    <a class="font-headline-md text-headline-md font-bold tracking-tighter text-primary hover:opacity-80 transition-opacity" href="${depth}index.html">LE CANAPÉ</a>
    <div class="flex items-center gap-6">
        <div class="hidden md:flex gap-8 items-center">
            <a class="font-label-caps text-label-caps tracking-[0.1em] uppercase text-on-surface-variant hover:text-primary transition-colors duration-300" href="${depth}index.html#services">Services</a>
            <a class="font-label-caps text-label-caps tracking-[0.1em] uppercase text-on-surface-variant hover:text-primary transition-colors duration-300" href="${depth}index.html#a-propos">About</a>
            <a class="font-label-caps text-label-caps tracking-[0.1em] uppercase text-on-surface-variant hover:text-primary transition-colors duration-300" href="${depth}index.html#contact">Contacts</a>
        </div>
        <button id="mobile-menu-toggle" aria-label="Menu Principal" class="md:hidden text-on-surface-variant hover:text-primary transition-colors duration-300 relative z-[60]">
            <span class="material-symbols-outlined" id="mobile-menu-icon" aria-hidden="true">menu</span>
        </button>
    </div>
    <div id="mobile-menu" class="fixed inset-0 bg-surface-container-lowest z-[55] flex flex-col items-center justify-center gap-8 translate-x-full transition-transform duration-500 md:hidden">
        <a class="font-headline-md text-headline-md ${active === 'home' ? 'text-primary' : 'text-on-surface-variant'}" href="${depth}index.html">Accueil</a>
        <a class="font-headline-md text-headline-md ${active === 'products' ? 'text-primary' : 'text-on-surface-variant'}" href="${depth}produits/">Collections</a>
        <a class="font-headline-md text-headline-md ${active === 'packs' ? 'text-primary' : 'text-on-surface-variant'}" href="${depth}packs/">Compositions</a>
        <a class="font-headline-md text-headline-md text-on-surface-variant" href="${depth}index.html#services">Services</a>
        <a class="font-headline-md text-headline-md text-on-surface-variant" href="${depth}index.html#a-propos">About</a>
        <a class="font-headline-md text-headline-md text-on-surface-variant" href="${depth}index.html#contact">Contacts</a>
    </div>
</nav>`;

const footer = (depth) => `
<footer class="bg-surface-container-highest w-full pt-stack-lg pb-stack-md border-t border-outline-variant reveal-up">
    <div class="flex flex-col md:flex-row justify-between items-start px-margin-mobile md:px-margin-desktop max-w-7xl mx-auto gap-stack-md mb-16">
        <div class="max-w-xs">
            <a class="font-headline-lg text-headline-lg text-primary block mb-6 hover:opacity-80 transition-opacity" href="${depth}index.html" style="font-family:'Playfair Display',serif">LE CANAPÉ</a>
            <p class="font-body-md text-body-md text-on-surface-variant">Élever le quotidien grâce à un confort sans compromis et un design intemporel.</p>
        </div>
        <div class="flex flex-col gap-4">
            <span class="font-label-caps text-label-caps tracking-[0.1em] uppercase text-on-surface">Navigation</span>
            <a class="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors" href="${depth}index.html">Accueil</a>
            <a class="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors" href="${depth}produits/">Collections</a>
            <a class="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors" href="${depth}packs/">Compositions</a>
        </div>
        <div class="flex flex-col gap-4">
            <span class="font-label-caps text-label-caps tracking-[0.1em] uppercase text-on-surface">Contact</span>
            <a class="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors" href="${depth}index.html#contact">Nous contacter</a>
            <a class="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors" href="${depth}index.html#a-propos">À propos</a>
        </div>
    </div>
    <div class="px-margin-mobile md:px-margin-desktop max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center pt-8 border-t border-outline-variant/50">
        <p class="font-body-md text-body-md text-on-surface-variant text-sm">© <span data-year>${new Date().getFullYear()}</span> LE CANAPÉ. Tous droits réservés.</p>
    </div>
</footer>`;

function productPage(product) {
    const url = `${siteUrl}/produits/${product.slug}/`;
    const schema = {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: product.name,
        image: product.images.hero,
        description: product.shortDescription,
        brand: { '@type': 'Brand', name: 'LE CANAPÉ' },
        offers: { '@type': 'Offer', price: String(product.price), priceCurrency: product.currency || 'DZD', availability: 'https://schema.org/InStock', url },
    };

    return `<!DOCTYPE html>
<html lang="fr" style="background-color:#fff8f3;">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>${escapeAttr(product.name)} | LE CANAPÉ - Mobilier de luxe à Oran</title>
<meta name="description" content="${escapeAttr(product.shortDescription)}"/>
<link rel="canonical" href="${url}"/>
<meta property="og:type" content="product"/>
<meta property="og:url" content="${url}"/>
<meta property="og:title" content="${escapeAttr(product.name)} | LE CANAPÉ"/>
<meta property="og:description" content="${escapeAttr(product.shortDescription)}"/>
<meta property="og:image" content="${escapeAttr(product.images.hero)}"/>
${headAssets('../../')}
<script type="application/ld+json">${JSON.stringify(schema)}</script>
</head>
<body class="bg-background text-on-background font-body-md antialiased" data-product-slug="${escapeAttr(product.slug)}">
${nav('../../', 'products')}
<main class="pt-[120px]">
<noscript><div class="px-margin-mobile md:px-margin-desktop py-12"><h1 class="font-headline-lg text-primary mb-4" style="font-family:'Playfair Display',serif">${escapeAttr(product.nameDisplay)}</h1><p class="font-body-lg text-on-surface-variant mb-4">${escapeAttr(product.shortDescription)}</p></div></noscript>
<div id="pdp-root"></div>
<script type="application/json" id="catalog-data">${jsonScript(products)}</script>
</main>
${footer('../../')}
<script src="../../assets/site.js"></script>
<script src="../../assets/pdp.js"></script>
</body>
</html>`;
}

function packPage(pack) {
    const url = `${siteUrl}/packs/${pack.slug}/`;
    return `<!DOCTYPE html>
<html lang="fr" style="background-color:#fff8f3;">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>${escapeAttr(pack.name)} | LE CANAPÉ</title>
<meta name="description" content="${escapeAttr(pack.shortDescription || pack.description)}"/>
<link rel="canonical" href="${url}"/>
<meta property="og:type" content="product.group"/>
<meta property="og:url" content="${url}"/>
<meta property="og:title" content="${escapeAttr(pack.name)} | LE CANAPÉ"/>
<meta property="og:description" content="${escapeAttr(pack.shortDescription || pack.description)}"/>
<meta property="og:image" content="${escapeAttr(pack.heroImage)}"/>
${headAssets('../../')}
</head>
<body class="bg-background text-on-background font-body-md antialiased" data-pack-slug="${escapeAttr(pack.slug)}">
${nav('../../', 'packs')}
<main class="pack-detail-page" id="pack-root"></main>
<script type="application/json" id="packs-data">${jsonScript(packs)}</script>
${footer('../../')}
<script src="../../assets/site.js"></script>
<script src="../../assets/pack-detail.js"></script>
</body>
</html>`;
}

for (const product of products) {
    const dir = join(root, 'produits', product.slug);
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, 'index.html'), productPage(product), 'utf8');
    console.log('Generated product:', product.slug);
}

for (const pack of packs) {
    const dir = join(root, 'packs', pack.slug);
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, 'index.html'), packPage(pack), 'utf8');
    console.log('Generated pack:', pack.slug);
}

const productCatalogScript = `<script type="application/json" id="catalog-data">${jsonScript(products)}</script>`;
const productsPath = join(root, 'produits', 'index.html');
let productsHtml = readFileSync(productsPath, 'utf8');
productsHtml = productsHtml.includes('id="catalog-data"')
    ? productsHtml.replace(/<script type="application\/json" id="catalog-data">[\s\S]*?<\/script>\s*/g, `${productCatalogScript}\n`)
    : productsHtml.replace('</body>', `${productCatalogScript}\n</body>`);
writeFileSync(productsPath, productsHtml, 'utf8');

const packCatalogScript = `<script type="application/json" id="packs-data">${jsonScript(packs)}</script>`;
const packsPath = join(root, 'packs', 'index.html');
let packsHtml = readFileSync(packsPath, 'utf8');
packsHtml = packsHtml.includes('id="packs-data"')
    ? packsHtml.replace(/<script type="application\/json" id="packs-data">[\s\S]*?<\/script>\s*/g, `${packCatalogScript}\n`)
    : packsHtml.replace('</body>', `${packCatalogScript}\n</body>`);
writeFileSync(packsPath, packsHtml, 'utf8');

const urls = [
    ['', '1.0', 'weekly'],
    ['produits/', '0.9', 'weekly'],
    ['packs/', '0.9', 'weekly'],
    ...products.map((item) => [`produits/${item.slug}/`, '0.8', 'monthly']),
    ...packs.map((item) => [`packs/${item.slug}/`, '0.8', 'monthly']),
];

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(([loc, priority, changefreq]) => `   <url>
      <loc>${siteUrl}/${loc}</loc>
      <lastmod>${today}</lastmod>
      <changefreq>${changefreq}</changefreq>
      <priority>${priority}</priority>
   </url>`).join('\n')}
</urlset>
`;
writeFileSync(join(root, 'sitemap.xml'), sitemap, 'utf8');
console.log(`Done - ${products.length} products and ${packs.length} packs.`);
