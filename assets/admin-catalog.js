import { api, requireAuth, logout, formatPrice, toast, escapeHtml } from './admin-auth.js';

let allProducts = [];
let filter = 'all';
let search = '';

async function init() {
    if (!(await requireAuth())) return;
    document.getElementById('logout-btn')?.addEventListener('click', logout);
    document.getElementById('search-input')?.addEventListener('input', (e) => {
        search = e.target.value.toLowerCase();
        render();
    });

    document.querySelectorAll('[data-filter]').forEach((btn) => {
        btn.addEventListener('click', () => {
            filter = btn.dataset.filter;
            document.querySelectorAll('[data-filter]').forEach((b) => b.classList.remove('active'));
            btn.classList.add('active');
            render();
        });
    });

    await loadProducts();
}

async function loadProducts() {
    try {
        allProducts = await api('/admin/products');
        render();
    } catch (err) {
        toast(err.message, true);
    }
}

function filtered() {
    return allProducts
        .filter((p) => filter === 'all' || p.category === filter)
        .filter((p) => {
            if (!search) return true;
            return p.name.toLowerCase().includes(search) || p.categoryLabel.toLowerCase().includes(search);
        })
        .sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || ''));
}

function render() {
    const grid = document.getElementById('catalog-grid');
    const items = filtered();
    if (!items.length) {
        grid.innerHTML = '<p class="text-on-surface-variant col-span-full text-center py-16">Aucun article trouvé.</p>';
        return;
    }

    grid.innerHTML = items.map((p) => `
        <article class="admin-product-card" data-slug="${escapeHtml(p.slug)}">
            <div class="relative">
                <img src="${escapeHtml(p.images?.hero || '')}" alt="${escapeHtml(p.name)}" onerror="this.style.background='#ece1d3'"/>
                <span class="admin-badge ${p.status === 'published' ? 'published' : 'draft'} absolute top-3 left-3">
                    <span style="width:6px;height:6px;border-radius:50%;background:${p.status === 'published' ? '#2d6a4f' : '#b8860b'}"></span>
                    ${p.status === 'published' ? 'Publié' : 'Brouillon'}
                </span>
            </div>
            <div class="p-4">
                <div class="flex justify-between text-xs uppercase tracking-widest text-secondary mb-2">
                    <span>${escapeHtml(p.categoryLabel)}</span>
                    <span class="text-primary font-semibold">${formatPrice(p.price)}</span>
                </div>
                <h3 class="font-headline-md text-lg mb-4" style="font-family:'Playfair Display',serif">${escapeHtml(p.name)}</h3>
                <div class="flex gap-3 border-t border-outline-variant/30 pt-3">
                    <a href="./article/edit.html?slug=${escapeHtml(p.slug)}" class="text-on-surface-variant hover:text-primary" title="Modifier">
                        <span class="material-symbols-outlined text-xl">edit</span>
                    </a>
                    <a href="../produits/item/?slug=${escapeHtml(p.slug)}" target="_blank" class="text-on-surface-variant hover:text-primary" title="Aperçu">
                        <span class="material-symbols-outlined text-xl">visibility</span>
                    </a>
                    <button type="button" class="delete-btn text-on-surface-variant hover:text-error ml-auto" data-slug="${escapeHtml(p.slug)}" title="Supprimer">
                        <span class="material-symbols-outlined text-xl">delete</span>
                    </button>
                </div>
            </div>
        </article>`).join('');

    grid.querySelectorAll('.delete-btn').forEach((btn) => {
        btn.addEventListener('click', async () => {
            const slug = btn.dataset.slug;
            const name = allProducts.find((p) => p.slug === slug)?.name;
            if (!confirm(`Supprimer « ${name} » ? Cette action est irréversible.`)) return;
            try {
                await api(`/admin/products/${slug}`, { method: 'DELETE' });
                toast('Article supprimé');
                await loadProducts();
            } catch (err) {
                toast(err.message, true);
            }
        });
    });
}

init();
