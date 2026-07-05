/**
 * admin-packs-catalog.js
 * Manages the Packs admin listing page (admin/packs.html)
 */
import { api, requireAuth, logout, formatPrice, toast, escapeHtml } from './admin-auth.js?v=2';

let allPacks = [];
let search = '';

async function init() {
    if (!(await requireAuth())) return;
    document.getElementById('logout-btn')?.addEventListener('click', logout);
    document.getElementById('search-input')?.addEventListener('input', (e) => {
        search = e.target.value.toLowerCase();
        render();
    });
    await loadPacks();
}

async function loadPacks() {
    try {
        allPacks = await api('/admin/packs');
        render();
    } catch (err) {
        toast(err.message, true);
    }
}

function filtered() {
    return allPacks
        .filter((p) => {
            if (!search) return true;
            return p.name.toLowerCase().includes(search);
        })
        .sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || ''));
}

function render() {
    const grid = document.getElementById('packs-grid');
    const items = filtered();
    if (!items.length) {
        grid.innerHTML = '<p class="text-on-surface-variant col-span-full text-center py-16">Aucun pack trouvé. <a href="./pack/new.html?v=3" class="text-primary underline">Créer le premier pack</a></p>';
        return;
    }

    grid.innerHTML = items.map((p) => `
        <article class="admin-product-card" data-slug="${p.slug}">
            <div class="relative">
                <img src="${p.heroImage || ''}" alt="${p.name}" onerror="this.style.background='#ece1d3'" />
                <span class="admin-badge ${p.status} absolute top-3 left-3">
                    <span style="width:6px;height:6px;border-radius:50%;background:${p.status === 'published' ? '#2d6a4f' : '#b8860b'}"></span>
                    ${p.status === 'published' ? 'Publié' : 'Brouillon'}
                </span>
                <span class="absolute top-3 right-3 bg-primary text-white text-xs px-2 py-1 rounded-full font-semibold">
                    ${p.pieceCount || p.includedProducts?.length || 0} pièces
                </span>
            </div>
            <div class="p-4">
                <div class="flex justify-between text-xs uppercase tracking-widest text-secondary mb-2">
                    <span>${p.categoryLabel || ''}</span>
                    <span class="text-primary font-semibold">${formatPrice(p.price)}</span>
                </div>
                <h3 class="font-headline-md text-lg mb-1" style="font-family:'Playfair Display',serif">${p.name}</h3>
                <p class="text-xs text-on-surface-variant mb-4 line-clamp-2">${p.shortDescription || ''}</p>
                <div class="flex gap-3 border-t border-outline-variant/30 pt-3">
                    <a href="./pack/edit.html?v=3&slug=${p.slug}" class="text-on-surface-variant hover:text-primary" title="Modifier">
                        <span class="material-symbols-outlined text-xl">edit</span>
                    </a>
                    <button type="button" class="delete-btn text-on-surface-variant hover:text-error ml-auto" data-slug="${p.slug}" title="Supprimer">
                        <span class="material-symbols-outlined text-xl">delete</span>
                    </button>
                </div>
            </div>
        </article>`).join('');

    grid.querySelectorAll('.delete-btn').forEach((btn) => {
        btn.addEventListener('click', async () => {
            const slug = btn.dataset.slug;
            const name = allPacks.find((p) => p.slug === slug)?.name;
            if (!confirm(`Supprimer le pack « ${name} » ? Cette action est irréversible.`)) return;
            try {
                await api(`/admin/packs/${slug}`, { method: 'DELETE' });
                toast('Pack supprimé');
                await loadPacks();
            } catch (err) {
                toast(err.message, true);
            }
        });
    });
}

init();
