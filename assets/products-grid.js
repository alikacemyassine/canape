/**
 * Renders and filters product cards on produits/index.html.
 * Dynamically builds sub-filter rows from CATEGORIES_TREE.
 */
import { CATEGORIES_TREE } from './admin-auth.js?v=2';

(function () {
    const grid = document.getElementById('product-grid');
    const subContainer = document.getElementById('sub-filters-container');
    if (!grid) return;

    let allProducts = [];
    let activeCategory = null;
    let activeSubcategory = null;
    let activeSubsubcategory = null;

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

    const loadCatalog = async () => {
        const inline = document.getElementById('catalog-data');

        // Always try the live API first
        try {
            const res = await fetch('/api/products', { cache: 'no-store' });
            if (res.ok) return res.json();
        } catch { /* fall through */ }

        // Local dev fallback
        try {
            const res = await fetch('../data/products.json', { cache: 'no-store' });
            if (res.ok) return res.json();
        } catch { /* fall through */ }

        // Last resort: inline JSON baked at build time
        if (inline) return JSON.parse(inline.textContent);

        throw new Error('Impossible de charger le catalogue.');
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
        let products = allProducts;
        if (activeCategory) products = products.filter(p => p.category === activeCategory);
        if (activeSubcategory) products = products.filter(p => p.subcategory === activeSubcategory);
        if (activeSubsubcategory) products = products.filter(p => p.subsubcategory === activeSubsubcategory);

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

    const updateUrl = () => {
        const url = new URL(window.location.href);
        if (activeCategory) url.searchParams.set('category', activeCategory);
        else url.searchParams.delete('category');
        if (activeSubcategory) url.searchParams.set('subcategory', activeSubcategory);
        else url.searchParams.delete('subcategory');
        if (activeSubsubcategory) url.searchParams.set('subsubcategory', activeSubsubcategory);
        else url.searchParams.delete('subsubcategory');
        window.history.replaceState({}, '', url);
    };

    // --- Dynamic Sub-filter Rendering ---

    const SUB_TAG_BASE = 'sub-tag px-5 py-2 border font-label-caps text-label-caps uppercase tracking-wide transition-all duration-300';
    const SUB_TAG_INACTIVE = 'border-outline-variant bg-surface-container-low text-on-surface-variant hover:bg-on-surface hover:text-background hover:border-on-surface';
    const SUB_TAG_ACTIVE = 'border-primary bg-primary text-on-primary';

    const makeSubTag = (label, onClick) => {
        const btn = document.createElement('button');
        btn.className = `${SUB_TAG_BASE} ${SUB_TAG_INACTIVE}`;
        btn.textContent = label;
        btn.addEventListener('click', onClick);
        return btn;
    };

    const renderSubFilters = () => {
        if (!subContainer) return;
        subContainer.innerHTML = '';

        if (!activeCategory) {
            subContainer.style.minHeight = '0';
            return;
        }

        const catObj = CATEGORIES_TREE[activeCategory];
        if (!catObj || !catObj.subcategories) {
            subContainer.style.minHeight = '0';
            return;
        }

        const subcats = catObj.subcategories;
        subContainer.style.minHeight = '48px';

        // Row 1: subcategories
        const row1 = document.createElement('div');
        row1.className = 'flex flex-wrap justify-center gap-3 mb-3';

        // "Tout voir" button for subcategory
        const allSubBtn = makeSubTag('Tout voir', () => {
            activeSubcategory = null;
            activeSubsubcategory = null;
            renderSubFilters();
            renderProducts();
            updateUrl();
        });
        if (!activeSubcategory) allSubBtn.className = `${SUB_TAG_BASE} ${SUB_TAG_ACTIVE}`;
        row1.appendChild(allSubBtn);

        for (const [key, val] of Object.entries(subcats)) {
            if (key === 'general') continue; // Skip generic fallback key
            const btn = makeSubTag(val.label, () => {
                activeSubcategory = key;
                activeSubsubcategory = null;
                renderSubFilters();
                renderProducts();
                updateUrl();
            });
            if (activeSubcategory === key) btn.className = `${SUB_TAG_BASE} ${SUB_TAG_ACTIVE}`;
            row1.appendChild(btn);
        }

        subContainer.appendChild(row1);

        // Row 2: sub-subcategories (if active subcategory has them)
        if (activeSubcategory && subcats[activeSubcategory]?.subsubcategories) {
            const subsubcats = subcats[activeSubcategory].subsubcategories;
            const row2 = document.createElement('div');
            row2.className = 'flex flex-wrap justify-center gap-3';

            // Animate in
            if (typeof gsap !== 'undefined') {
                gsap.fromTo(row2, { opacity: 0, y: -8 }, { opacity: 1, y: 0, duration: 0.3, ease: 'power2.out' });
            }

            const allSubSubBtn = makeSubTag('Tous', () => {
                activeSubsubcategory = null;
                renderSubFilters();
                renderProducts();
                updateUrl();
            });
            if (!activeSubsubcategory) allSubSubBtn.className = `${SUB_TAG_BASE} ${SUB_TAG_ACTIVE}`;
            row2.appendChild(allSubSubBtn);

            for (const [key, val] of Object.entries(subsubcats)) {
                const btn = makeSubTag(val.label, () => {
                    activeSubsubcategory = key;
                    renderSubFilters();
                    renderProducts();
                    updateUrl();
                });
                if (activeSubsubcategory === key) btn.className = `${SUB_TAG_BASE} ${SUB_TAG_ACTIVE}`;
                row2.appendChild(btn);
            }

            subContainer.appendChild(row2);
        }
    };

    // --- Main Category Filter Buttons ---

    const getInitialState = () => {
        const params = new URLSearchParams(window.location.search);
        return {
            category: params.get('category') || document.querySelector('.filter-btn.active')?.dataset.target || null,
            subcategory: params.get('subcategory') || null,
            subsubcategory: params.get('subsubcategory') || null,
        };
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
                activeSubcategory = null;
                activeSubsubcategory = null;
                setActiveButton();
                renderSubFilters();
                renderProducts();
                updateUrl();
            });
        });
    };

    // --- Init ---

    loadCatalog()
        .then((products) => {
            allProducts = products.filter((p) => p.status === 'published' && p.archived !== true);
            const initial = getInitialState();
            activeCategory = initial.category;
            activeSubcategory = initial.subcategory;
            activeSubsubcategory = initial.subsubcategory;
            bindCategoryFilters();
            setActiveButton();
            renderSubFilters();
            renderProducts();
        })
        .catch(() => {
            grid.innerHTML = '<p class="col-span-full text-center text-on-surface-variant py-12">Impossible de charger les produits.</p>';
        });
})();
