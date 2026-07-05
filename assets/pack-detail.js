/**
 * Renders one Composition detail page — clean PDP layout matching product detail pages.
 */
(function () {
    const root = document.getElementById('pack-root');
    if (!root) return;

    const slug = document.body.dataset.packSlug
        || new URLSearchParams(window.location.search).get('slug')
        || window.location.pathname.split('/').filter(Boolean).at(-1);
    if (!slug) return;

    const escapeHtml = (value) => {
        return String(value || '')
            .replace(/&/g, '&amp;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
    };

    const formatPrice = (value, currency = 'DZD') =>
        `${Number(value || 0).toLocaleString('fr-FR')} ${currency}`;

    const loadPacks = async () => {
        const inline = document.getElementById('packs-data');

        // Always try the live API first
        try {
            const res = await fetch('/api/packs', { cache: 'no-store' });
            if (res.ok) return res.json();
        } catch { /* fall through */ }

        // Local dev fallback
        try {
            const res = await fetch('../../data/packs.json', { cache: 'no-store' });
            if (res.ok) return res.json();
        } catch { /* fall through */ }

        // Last resort: inline JSON baked at build time
        if (inline) return JSON.parse(inline.textContent);

        throw new Error('Impossible de charger les compositions.');
    };

    const productHref = (item) =>
        item.productSlug ? `../../produits/${encodeURIComponent(item.productSlug)}/` : '';

    const renderItems = (pack) => {
        const items = pack.includedProducts || [];
        if (!items.length) return '<p class="font-body-lg text-secondary py-12 text-center">Articles à venir.</p>';
        return items.map((item) => {
            const href = productHref(item);
            const tag = href ? 'a' : 'div';
            const hrefAttr = href ? `href="${escapeHtml(href)}"` : '';
            return `
            <${tag} ${hrefAttr} class="product-card group flex flex-col gap-4 reveal-up ${href ? 'cursor-pointer' : ''}">
                <div class="relative overflow-hidden aspect-[4/5] bg-surface-container w-full">
                    <img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.name)}" loading="lazy" class="object-cover w-full h-full product-card-img"/>
                </div>
                <div class="flex justify-between items-start gap-4">
                    <div>
                        <h3 class="font-headline-md text-on-surface" style="font-family:'Playfair Display',serif;font-size:1.25rem">${escapeHtml(item.name)}</h3>
                        <p class="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wide mt-1">${escapeHtml(item.material)}</p>
                    </div>
                    <span class="font-body-md text-primary font-semibold text-sm whitespace-nowrap">${formatPrice(item.price, pack.currency)}</span>
                </div>
                ${href ? `<span class="font-label-caps text-label-caps uppercase tracking-widest text-primary">Voir l'article →</span>` : '<span class="font-label-caps text-label-caps text-secondary uppercase tracking-widest">Sur demande</span>'}
            </${tag}>`;
        }).join('');
    };

    const renderPack = (pack) => {
        document.title = `${pack.name} | LE CANAPÉ`;
        const pieceCount = Number(pack.includedProducts?.length || pack.pieceCount || 0);

        // Auto-compute discount % from price vs oldPrice
        let discountBadge = '';
        if (pack.oldPrice && pack.price && pack.oldPrice > pack.price) {
            const pct = Math.round((1 - pack.price / pack.oldPrice) * 100);
            if (pct > 0) discountBadge = `Économisez ${pct}%`;
        }

        root.innerHTML = `
            <!-- Hero split: image left, info right — identical pattern to produits PDP -->
            <section class="min-h-[85vh] flex flex-col lg:flex-row px-margin-mobile md:px-margin-desktop gap-12 lg:gap-24 mb-section-gap pt-8 relative">
                <!-- Left: Hero image -->
                <div class="w-full lg:w-7/12 flex flex-col gap-4 reveal-up">
                    <div class="relative overflow-hidden h-[50vh] lg:h-[70vh] bg-surface-container">
                        <img src="${escapeHtml(pack.heroImage)}" alt="${escapeHtml(pack.name)}" class="w-full h-full object-cover product-card-img"/>
                    </div>
                </div>

                <!-- Right: Pack info -->
                <div class="w-full lg:w-5/12 flex flex-col py-8 lg:py-16 lg:pt-0 reveal-up">
                    <!-- Breadcrumb -->
                    <div class="flex items-center gap-2 mb-8 flex-wrap">
                        <a class="font-label-caps text-secondary hover:text-primary transition-colors tracking-widest" href="../">COMPOSITIONS</a>
                        <span class="text-secondary text-xs">/</span>
                        <span class="font-label-caps text-primary tracking-widest">${escapeHtml(pack.categoryLabel)}</span>
                    </div>

                    <!-- Title -->
                    <h1 class="font-headline-lg text-primary mb-6 uppercase tracking-wide" style="font-family:'Playfair Display',serif;font-size:clamp(2rem,4vw,3.5rem);line-height:1.1">${escapeHtml(pack.name)}</h1>

                    <!-- Meta: piece count -->
                    <p class="font-label-caps text-label-caps uppercase tracking-widest text-secondary mb-6">${pieceCount > 0 ? `Composé de ${pieceCount} pièce${pieceCount > 1 ? 's' : ''}` : 'Composition'}</p>

                    <!-- Short description -->
                    <p class="font-body-lg text-on-surface-variant mb-12 max-w-md leading-relaxed">${escapeHtml(pack.shortDescription || '')}</p>

                    <!-- Price + CTA -->
                    <div class="border-t border-outline-variant pt-8 mt-auto">
                        <div class="flex justify-between items-end mb-8">
                            <div>
                                <span class="font-headline-md text-primary block" style="font-family:'Playfair Display',serif">${formatPrice(pack.price, pack.currency)}</span>
                                ${pack.oldPrice ? `<span class="font-body-md text-secondary line-through">${formatPrice(pack.oldPrice, pack.currency)}</span>` : ''}
                                <span class="font-body-md text-secondary block">Taxes incluses</span>
                            </div>
                            ${discountBadge ? `<span class="font-label-caps text-label-caps bg-primary text-on-primary px-3 py-1 uppercase tracking-widest">${escapeHtml(discountBadge)}</span>` : ''}
                        </div>
                        <div class="flex flex-col sm:flex-row gap-4">
                            <button type="button" id="pack-cta" class="flex-1 bg-primary text-on-primary font-label-caps py-4 px-8 hover:bg-primary-container hover:text-on-primary-container transition-colors duration-500 tracking-widest uppercase text-label-caps">Réserver la composition</button>
                            <a href="../" class="flex-1 border border-outline-variant text-primary font-label-caps py-4 px-8 hover:bg-surface-variant transition-colors duration-500 tracking-widest uppercase text-label-caps text-center">Toutes les compositions</a>
                        </div>
                    </div>
                </div>
            </section>

            <!-- Description row -->
            <section class="px-margin-mobile md:px-margin-desktop max-w-7xl mx-auto mb-section-gap border-t border-outline-variant">
                <div class="py-12 border-b border-outline-variant reveal-up">
                    <div class="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
                        <div class="md:col-span-4"><h3 class="font-label-caps text-secondary tracking-widest">DESCRIPTION</h3></div>
                        <div class="md:col-span-8"><p class="font-body-lg text-primary">${escapeHtml(pack.description || pack.shortDescription || '')}</p></div>
                    </div>
                </div>
            </section>

            <!-- Included products -->
            <section class="px-margin-mobile md:px-margin-desktop max-w-7xl mx-auto mb-section-gap">
                <div class="mb-16 reveal-up max-w-2xl">
                    <h2 class="font-headline-lg text-primary mb-6 uppercase tracking-wider" style="font-family:'Playfair Display',serif">Ce qui est inclus</h2>
                    <p class="font-body-lg text-secondary">${pieceCount} article${pieceCount > 1 ? 's' : ''} composent cet ensemble, chacun sélectionné pour son savoir-faire et la cohérence de l'ensemble.</p>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter">
                    ${renderItems(pack)}
                </div>
            </section>`;

        if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.refresh();
    };

    loadPacks()
        .then((packs) => {
            const pack = packs.find((item) => item.slug === slug);
            if (!pack) {
                root.innerHTML = '<p class="text-center py-24 font-body-lg text-secondary">Composition introuvable.</p>';
                return;
            }
            renderPack(pack);
            if (window.initializeWishlistState) {
                window.initializeWishlistState(slug);
            }
        })
        .catch(() => {
            root.innerHTML = '<p class="text-center py-24 font-body-lg text-error">Impossible de charger la composition.</p>';
        });
})();
