/**
 * Renders and filters product cards on produits/index.html.
 */
(function () {
    const grid = document.getElementById('product-grid');
    if (!grid) return;

    let allProducts = [];
    let activeCategory = null;

    const formatPrice = (value, currency = 'DZD') =>
        `${Number(value || 0).toLocaleString('fr-FR')} ${currency}`;

    const escapeHtml = (value) => {
        const el = document.createElement('div');
        el.textContent = value || '';
        return el.innerHTML;
    };

    const loadCatalog = async () => {
        const inline = document.getElementById('catalog-data');
        if (inline) return JSON.parse(inline.textContent);

        try {
            const res = await fetch('../data/products.json', { cache: 'no-store' });
            if (res.ok) return res.json();
        } catch { /* API fallback */ }

        const res = await fetch('/api/products');
        return res.json();
    };

    const animateCards = () => {
        if (typeof ScrollTrigger === 'undefined' || typeof gsap === 'undefined') return;
        ScrollTrigger.refresh();
        gsap.utils.toArray('#product-grid .reveal-up').forEach((el) => {
            gsap.fromTo(el,
                { y: 24, autoAlpha: 0 },
                { y: 0, autoAlpha: 1, duration: 0.55, ease: 'power2.out' }
            );
        });
    };

    const renderProducts = () => {
        const products = activeCategory
            ? allProducts.filter((product) => product.category === activeCategory)
            : allProducts;

        if (!products.length) {
            grid.innerHTML = '<p class="col-span-full text-center text-on-surface-variant py-12">Aucun article dans cette catégorie pour le moment.</p>';
            return;
        }

        grid.innerHTML = products.map((product) => `
            <a href="./${encodeURIComponent(product.slug)}/" class="product-card group cursor-pointer flex flex-col gap-4 reveal-up" data-category="${escapeHtml(product.category)}">
                <div class="relative overflow-hidden aspect-[4/5] bg-surface-container w-full">
                    <img alt="${escapeHtml(product.name)} - ${escapeHtml(product.categoryLabel)}" class="object-cover w-full h-full product-card-img" src="${escapeHtml(product.images?.hero)}" loading="lazy"/>
                </div>
                <div class="flex justify-between items-start gap-4">
                    <div>
                        <h3 class="font-headline-md text-on-surface text-xl" style="font-family:'Playfair Display',serif">${escapeHtml(product.name)}</h3>
                        <p class="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wide mt-1">${escapeHtml(product.categoryLabel)}</p>
                    </div>
                    <span class="font-body-md text-primary font-semibold text-sm whitespace-nowrap">${formatPrice(product.price, product.currency)}</span>
                </div>
            </a>`).join('');

        animateCards();
    };

    const getInitialCategory = () => {
        const params = new URLSearchParams(window.location.search);
        return params.get('category') || document.querySelector('.filter-btn.active')?.dataset.target || null;
    };

    const setActiveButton = () => {
        document.querySelectorAll('.filter-btn[data-target]').forEach((btn) => {
            btn.classList.toggle('active', btn.dataset.target === activeCategory);
            btn.setAttribute('aria-pressed', String(btn.dataset.target === activeCategory));
        });
    };

    const bindCategoryFilters = () => {
        document.querySelectorAll('.filter-btn[data-target]').forEach((btn) => {
            btn.addEventListener('click', () => {
                activeCategory = btn.dataset.target || null;
                setActiveButton();
                renderProducts();

                const url = new URL(window.location.href);
                if (activeCategory) url.searchParams.set('category', activeCategory);
                else url.searchParams.delete('category');
                window.history.replaceState({}, '', url);
            });
        });
    };

    loadCatalog()
        .then((products) => {
            allProducts = products.filter((product) => product.status === 'published' && product.archived !== true);
            activeCategory = getInitialCategory();
            bindCategoryFilters();
            setActiveButton();
            renderProducts();
        })
        .catch(() => {
            grid.innerHTML = '<p class="col-span-full text-center text-on-surface-variant py-12">Impossible de charger les produits.</p>';
        });
})();
