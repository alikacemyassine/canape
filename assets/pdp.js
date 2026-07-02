/**
 * Product detail page: hydrates from inline catalog data or data/products.json.
 */
(function () {
    const slug = document.body.dataset.productSlug
        || new URLSearchParams(window.location.search).get('slug')
        || window.location.pathname.split('/').filter(Boolean).at(-1);
    if (!slug) return;

    const root = document.getElementById('pdp-root');
    if (!root) return;

    const formatPrice = (value, currency = 'DZD') =>
        `${Number(value || 0).toLocaleString('fr-FR')} ${currency}`;

    const escapeHtml = (value) => {
        return String(value || '')
            .replace(/&/g, '&amp;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
    };

    const renderColors = (colors = []) => {
        if (!colors.length) return '';
        const swatches = colors.map((color, index) => {
            const galleryData = (color.gallery && color.gallery.length > 0) ? color.gallery : [color.image].filter(Boolean);
            return `
            <button type="button" class="color-swatch w-10 h-10 rounded-full border-2 p-1 ${index === 0 ? 'active border-primary' : 'border-transparent hover:border-outline-variant'}" data-hex="${escapeHtml(color.hex)}" data-gallery='${escapeHtml(JSON.stringify(galleryData))}' aria-label="${escapeHtml(color.label)}" aria-pressed="${index === 0}">
                <span class="color-swatch-inner block w-full h-full rounded-full" style="background-color:${escapeHtml(color.hex)}"></span>
            </button>`;
        }).join('');
        return `
            <div class="border-t thin-border pt-6 reveal-up">
                <span class="font-label-caps text-secondary block mb-4 tracking-widest">COULEURS</span>
                <div class="flex flex-wrap gap-4" id="color-swatches">${swatches}</div>
            </div>`;
    };

    const getGalleryHtml = (gallery, name) => {
        const hero = gallery.length ? gallery[0] : '../images/sejour.png';
        const thumbs = gallery.map((src, index) => `
            <button type="button" class="pdp-thumb relative overflow-hidden h-full w-full ${index === 0 ? 'active' : ''}" data-src="${escapeHtml(src)}" aria-label="Vue ${index + 1}">
                <img alt="${escapeHtml(name)} - vue ${index + 1}" class="pdp-hero-img w-full h-full object-cover" src="${escapeHtml(src)}"/>
            </button>`).join('');

        return `
            <div class="pdp-hero-img-wrap relative h-[50vh] lg:h-[60vh] overflow-hidden bg-surface-container mb-4">
                <img id="pdp-main-image" alt="${escapeHtml(name)}" class="pdp-hero-img w-full h-full object-cover" src="${escapeHtml(hero)}"/>
            </div>
            ${gallery.length > 1 ? `<div class="grid grid-cols-2 h-[25vh] lg:h-[35vh] gap-4">${thumbs}</div>` : ''}
        `;
    };

    const renderGallery = (images, name) => {
        const hero = images?.hero || '../images/sejour.png';
        const gallery = images?.gallery?.length ? images.gallery : [hero];
        
        return `
            <div id="gallery-container" class="w-full lg:w-7/12 flex flex-col gap-4 reveal-up" data-name="${escapeHtml(name)}">
                ${getGalleryHtml(gallery, name)}
            </div>`;
    };

    const renderSpecs = (specs = []) => specs.map((spec) => `
        <div class="flex justify-between border-b thin-border pb-2 gap-6">
            <span>${escapeHtml(spec.label)}</span>
            <span class="text-right">${escapeHtml(spec.value)}</span>
        </div>`).join('');

    const renderDimensions = (dimensions = {}) => {
        const entries = [
            ['LARGEUR', dimensions.largeur],
            ['PROFONDEUR', dimensions.profondeur],
            ['HAUTEUR', dimensions.hauteur],
            ['ASSISE', dimensions.assise],
        ].filter(([, value]) => value && value !== '—');

        return entries.map(([label, value]) => `
            <div>
                <span class="block font-label-caps text-secondary mb-2 tracking-widest">${label}</span>
                <span class="font-body-lg text-primary">${escapeHtml(value)}</span>
            </div>`).join('');
    };

    const renderMaterials = (materials = []) => {
        if (!materials.length) return '';
        const blocks = materials.map((material) => {
            const aspect = material.aspect === '4/3' ? 'aspect-[4/3]' : 'aspect-square';
            const col = material.offset ? 'md:col-span-6 md:col-start-7 mt-12 md:mt-32' : 'md:col-span-5';
            return `
                <div class="${col} reveal-up">
                    <div class="relative overflow-hidden mb-6 ${aspect} bg-surface-container">
                        <img alt="${escapeHtml(material.title)}" class="w-full h-full object-cover transition-transform duration-[1200ms] hover:scale-105" src="${escapeHtml(material.image)}"/>
                    </div>
                    <span class="font-label-caps text-secondary mb-2 block tracking-widest">${escapeHtml(material.tag)}</span>
                    <h3 class="font-headline-md text-primary" style="font-family:'Playfair Display',serif">${escapeHtml(material.title)}</h3>
                    <p class="mt-4 font-body-md text-secondary">${escapeHtml(material.text)}</p>
                </div>`;
        }).join('');

        return `
            <section class="px-margin-mobile md:px-margin-desktop mb-section-gap">
                <div class="mb-24 reveal-up max-w-2xl">
                    <h2 class="font-headline-lg text-primary mb-6 uppercase tracking-wider" style="font-family:'Playfair Display',serif">Matières &amp; savoir-faire</h2>
                    <p class="font-body-lg text-secondary">Chaque détail est pensé pour créer une expérience tactile inoubliable, mariant des matériaux nobles à une finition d'exception.</p>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-24 items-center">${blocks}</div>
            </section>`;
    };

    const renderRelated = (all, current) => {
        let related = all.filter((product) => product.slug !== current.slug && product.category === current.category).slice(0, 3);
        if (!related.length) related = all.filter((product) => product.slug !== current.slug).slice(0, 3);
        if (!related.length) return '';

        const cards = related.map((product) => `
            <a href="../${encodeURIComponent(product.slug)}/" class="product-card group flex flex-col gap-4 reveal-up">
                <div class="relative overflow-hidden aspect-[4/5] bg-surface-container w-full">
                    <img alt="${escapeHtml(product.name)}" class="object-cover w-full h-full transition-transform duration-700 group-hover:scale-105" src="${escapeHtml(product.images?.hero)}"/>
                </div>
                <div class="flex justify-between items-start gap-4">
                    <div>
                        <h3 class="font-headline-md text-on-surface text-xl" style="font-family:'Playfair Display',serif">${escapeHtml(product.name)}</h3>
                        <p class="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wide mt-1">${escapeHtml(product.categoryLabel)}</p>
                    </div>
                    <span class="font-body-md text-primary font-semibold text-sm whitespace-nowrap">${formatPrice(product.price, product.currency)}</span>
                </div>
            </a>`).join('');

        return `
            <section class="px-margin-mobile md:px-margin-desktop mb-section-gap border-t thin-border pt-16">
                <h2 class="font-headline-md text-primary mb-10 reveal-up" style="font-family:'Playfair Display',serif">Vous aimerez aussi</h2>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-gutter">${cards}</div>
            </section>`;
    };

    const renderPage = (product, all) => {
        const breadcrumbs = [];
        if (product.categoryLabel) breadcrumbs.push(`<a class="font-label-caps text-secondary hover:text-primary transition-colors tracking-widest" href="../?category=${encodeURIComponent(product.category)}">${escapeHtml(product.categoryLabel)}</a>`);
        if (product.subcategoryLabel && product.subcategory !== 'general') breadcrumbs.push(`<span class="font-label-caps text-secondary tracking-widest">${escapeHtml(product.subcategoryLabel)}</span>`);
        if (product.subsubcategoryLabel) breadcrumbs.push(`<span class="font-label-caps text-primary tracking-widest">${escapeHtml(product.subsubcategoryLabel)}</span>`);
        else if (breadcrumbs.length > 0) breadcrumbs[breadcrumbs.length - 1] = breadcrumbs[breadcrumbs.length - 1].replace('text-secondary', 'text-primary');
        const breadcrumbHtml = breadcrumbs.join(' <span class="text-secondary text-xs">/</span> ');

        // Auto-compute discount % from price vs oldPrice
        let discountBadge = '';
        if (product.oldPrice && product.price && product.oldPrice > product.price) {
            const pct = Math.round((1 - product.price / product.oldPrice) * 100);
            if (pct > 0) discountBadge = `Économisez ${pct}%`;
        }

        root.innerHTML = `
            <section class="min-h-[85vh] flex flex-col lg:flex-row px-margin-mobile md:px-margin-desktop gap-12 lg:gap-24 mb-section-gap pt-8 relative">
                ${renderGallery(product.images, product.name)}
                <div class="w-full lg:w-5/12 flex flex-col py-8 lg:py-16 lg:pt-0 reveal-up">
                    <div class="flex items-center gap-2 mb-8 flex-wrap">
                        <a class="font-label-caps text-secondary hover:text-primary transition-colors tracking-widest" href="../">COLLECTIONS</a>
                        <span class="text-secondary text-xs">/</span>
                        ${breadcrumbHtml}
                    </div>
                    <h1 class="font-headline-lg md:text-display-lg text-primary mb-6 uppercase tracking-wide" style="font-family:'Playfair Display',serif;font-size:clamp(2rem,5vw,4rem);line-height:1.1">${escapeHtml(product.nameDisplay)}</h1>
                    <p class="font-body-lg text-on-surface-variant mb-12 max-w-md leading-relaxed">${escapeHtml(product.shortDescription)}</p>
                    <div class="mb-12 space-y-8">${renderColors(product.colors)}</div>
                    <div class="border-t thin-border pt-8 mt-auto">
                        <div class="flex justify-between items-end mb-8">
                            <div>
                                <span class="font-headline-md text-primary block" style="font-family:'Playfair Display',serif">${formatPrice(product.price, product.currency)}</span>
                                ${product.oldPrice ? `<span class="font-body-md text-secondary line-through">${formatPrice(product.oldPrice, product.currency)}</span>` : ''}
                                <span class="font-body-md text-secondary block">Taxes incluses</span>
                            </div>
                            ${discountBadge ? `<span class="font-label-caps text-label-caps bg-primary text-on-primary px-3 py-1 uppercase tracking-widest">${escapeHtml(discountBadge)}</span>` : ''}
                        </div>
                        <div class="flex flex-col sm:flex-row gap-4 relative">
                            <button type="button" class="flex-1 bg-primary text-on-primary font-label-caps py-4 px-8 hover:bg-primary-container hover:text-on-primary-container transition-colors duration-500 tracking-widest uppercase text-label-caps" id="btn-cart">Ajouter au panier</button>
                            <button type="button" id="btn-wishlist" class="absolute -top-16 right-0 sm:static sm:flex-none border thin-border p-4 text-primary hover:bg-surface-variant transition-colors duration-500" aria-label="Ajouter aux favoris">
                                <span class="material-symbols-outlined pointer-events-none">favorite_border</span>
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            <section class="px-margin-mobile md:px-margin-desktop mb-section-gap">
                <div class="grid grid-cols-1 border-t thin-border">
                    <div class="py-12 border-b thin-border reveal-up">
                        <div class="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
                            <div class="md:col-span-4"><h3 class="font-label-caps text-secondary tracking-widest">DESCRIPTION</h3></div>
                            <div class="md:col-span-8"><p class="font-body-lg text-primary">${escapeHtml(product.description)}</p></div>
                        </div>
                    </div>
                    <div class="py-12 border-b thin-border reveal-up">
                        <div class="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
                            <div class="md:col-span-4"><h3 class="font-label-caps text-secondary tracking-widest">DIMENSIONS</h3></div>
                            <div class="md:col-span-8 grid grid-cols-2 md:grid-cols-4 gap-8">${renderDimensions(product.dimensions)}</div>
                        </div>
                    </div>
                    <div class="py-12 border-b thin-border reveal-up">
                        <div class="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
                            <div class="md:col-span-4"><h3 class="font-label-caps text-secondary tracking-widest">DÉTAILS TECHNIQUES</h3></div>
                            <div class="md:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-6 font-body-md text-primary">${renderSpecs(product.specs)}</div>
                        </div>
                    </div>
                </div>
            </section>
            ${renderMaterials(product.materials)}
            ${renderRelated(all, product)}`;
    };

    const bindInteractions = () => {
        const bindThumbs = () => {
            const mainImg = document.getElementById('pdp-main-image');
            document.querySelectorAll('.pdp-thumb').forEach((thumb) => {
                thumb.addEventListener('click', () => {
                    document.querySelectorAll('.pdp-thumb').forEach((item) => item.classList.remove('active'));
                    thumb.classList.add('active');
                    if (mainImg) mainImg.src = thumb.dataset.src;
                });
            });
        };
        bindThumbs();

        document.querySelectorAll('.color-swatch').forEach((btn) => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.color-swatch').forEach((item) => {
                    item.classList.remove('active', 'border-primary');
                    item.classList.add('border-transparent');
                    item.setAttribute('aria-pressed', 'false');
                });
                btn.classList.add('active', 'border-primary');
                btn.classList.remove('border-transparent');
                btn.setAttribute('aria-pressed', 'true');
                
                const galleryDataStr = btn.dataset.gallery;
                if (galleryDataStr) {
                    try {
                        const gallery = JSON.parse(galleryDataStr);
                        if (gallery && gallery.length > 0) {
                            const container = document.getElementById('gallery-container');
                            if (container) {
                                container.innerHTML = getGalleryHtml(gallery, container.dataset.name);
                                bindThumbs();
                            }
                        }
                    } catch (err) {
                        console.error('Invalid gallery data', err);
                    }
                }
            });
        });
    };

    const loadCatalog = async () => {
        const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        const inline = document.getElementById('catalog-data');
        if (inline && !isLocal) return JSON.parse(inline.textContent);

        try {
            const res = await fetch('../../data/products.json', { cache: 'no-store' });
            if (res.ok) return res.json();
        } catch { /* API fallback */ }

        const res = await fetch('/api/products');
        return res.json();
    };

    loadCatalog()
        .then((all) => {
            const products = all.filter((product) => product.status === 'published' && product.archived !== true);
            const product = products.find((item) => item.slug === slug);
            if (!product) {
                root.innerHTML = '<p class="px-margin-mobile py-24 text-center">Produit introuvable.</p>';
                return;
            }
            renderPage(product, products);
            document.title = `${product.name} | LE CANAPÉ - Mobilier de luxe à Oran`;
            bindInteractions();
            if (window.initializeWishlistState) {
                window.initializeWishlistState(slug);
            }
            if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.refresh();
        })
        .catch(() => {
            root.innerHTML = '<p class="px-margin-mobile py-24 text-center text-error">Impossible de charger le produit.</p>';
        });
})();
