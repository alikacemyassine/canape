/**
 * Renders the Compositions listing page.
 */
(function () {
    const grid = document.getElementById('packs-grid');
    if (!grid) return;

    let allPacks = [];
    let activeCategory = 'all';

    const categories = [
        ['all', 'Tous'],
        ['salon', 'Salon'],
        ['chambre', 'Chambre'],
        ['salle-a-manger', 'Salle à manger'],
        ['bureau', 'Bureau'],
    ];

    const escapeHtml = (value) => {
        const el = document.createElement('div');
        el.textContent = value || '';
        return el.innerHTML;
    };

    const formatPrice = (value, currency = 'DZD') =>
        `${Number(value || 0).toLocaleString('fr-FR')} ${currency}`;

    const loadPacks = async () => {
        const inline = document.getElementById('packs-data');
        if (inline) return JSON.parse(inline.textContent);

        try {
            const res = await fetch('../data/packs.json', { cache: 'no-store' });
            if (res.ok) return res.json();
        } catch { /* API fallback */ }

        const res = await fetch('/api/packs');
        return res.json();
    };

    const renderFilters = () => {
        const wrap = document.getElementById('packs-filters');
        if (!wrap) return;

        wrap.innerHTML = categories.map(([id, label]) => `
            <button type="button" class="filter-btn font-label-caps text-label-caps uppercase tracking-widest transition-colors duration-300 ${id === activeCategory ? 'active text-brand-gold border-b-2 border-brand-gold pb-2' : 'text-on-surface-variant hover:text-brand-gold pb-2'}" data-category="${id}" aria-pressed="${id === activeCategory}">
                ${escapeHtml(label)}
            </button>`).join('');

        wrap.querySelectorAll('.filter-btn').forEach((btn) => {
            btn.addEventListener('click', () => {
                activeCategory = btn.dataset.category;
                renderFilters();
                renderPacks();
            });
        });
    };

    const animateCards = () => {
        if (typeof ScrollTrigger === 'undefined' || typeof gsap === 'undefined') return;
        ScrollTrigger.refresh();
        gsap.utils.toArray('#packs-grid .reveal-up').forEach((el) => {
            gsap.fromTo(el,
                { y: 24, autoAlpha: 0 },
                { y: 0, autoAlpha: 1, duration: 0.55, ease: 'power2.out' }
            );
        });
    };

    const renderPacks = () => {
        const packs = activeCategory === 'all'
            ? allPacks
            : allPacks.filter((pack) => pack.category === activeCategory);

        if (!packs.length) {
            grid.innerHTML = '<p class="w-full text-center py-12 font-body-lg text-secondary">Aucune composition dans cette catégorie pour le moment.</p>';
            return;
        }

        grid.innerHTML = packs.map((pack) => `
            <a href="./${encodeURIComponent(pack.slug)}/" class="product-card group cursor-pointer flex flex-col gap-4 reveal-up">
                <div class="relative overflow-hidden aspect-[4/5] bg-surface-container w-full">
                    <img alt="${escapeHtml(pack.name)}" class="object-cover w-full h-full product-card-img" src="${escapeHtml(pack.heroImage)}" loading="lazy"/>
                </div>
                <div class="flex justify-between items-start gap-4">
                    <div>
                        <h3 class="font-headline-md text-on-surface text-xl shadow-none" style="font-family:'Playfair Display',serif">${escapeHtml(pack.name)}</h3>
                        <p class="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wide mt-1">Composé de ${Number(pack.pieceCount || pack.includedProducts?.length || 0)} pièces</p>
                    </div>
                    <span class="font-body-md text-primary font-semibold text-sm whitespace-nowrap">À partir de ${formatPrice(pack.price, pack.currency)}</span>
                </div>
            </a>`).join('');

        animateCards();
    };

    loadPacks()
        .then((packs) => {
            allPacks = packs.filter((pack) => pack.status === 'published' && pack.archived !== true);
            const requested = new URLSearchParams(window.location.search).get('category');
            if (requested && categories.some(([id]) => id === requested)) activeCategory = requested;
            renderFilters();
            renderPacks();
        })
        .catch(() => {
            grid.innerHTML = '<p class="w-full text-center py-12 font-body-lg text-error">Impossible de charger les compositions.</p>';
        });
})();
