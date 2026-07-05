/**
 * admin-pack-form.js
 * Handles both new.html and edit.html for packs.
 * - Uploads hero image
 * - Fetches all products and renders a visual checkable grid
 * - On submit: POSTs (new) or PUTs (edit) to /api/admin/packs
 */
import { api, requireAuth, logout, toast, uploadImage } from './admin-auth.js?v=2';

const isEdit = window.location.pathname.includes('/edit.html');
const packSlug = new URLSearchParams(window.location.search).get('slug');

let allProducts = [];
let selectedSlugs = new Set();

/* ── Init ──────────────────────────────────────────────── */
async function init() {
    if (!(await requireAuth())) return;
    document.getElementById('logout-btn')?.addEventListener('click', logout);

    setupHeroUpload();
    await loadProducts();

    if (isEdit && packSlug) {
        await loadPack(packSlug);
    }

    document.getElementById('pack-form').addEventListener('submit', handleSubmit);
    document.getElementById('pack-name')?.addEventListener('input', autoSlug);
    document.getElementById('product-search')?.addEventListener('input', (e) => {
        renderProductPicker(e.target.value.toLowerCase());
    });

    if (isEdit) {
        document.getElementById('delete-pack-btn')?.addEventListener('click', handleDelete);
    }
}

/* ── Hero Image Upload ─────────────────────────────────── */
function setupHeroUpload() {
    const dropZone = document.getElementById('hero-drop-zone');
    const fileInput = document.getElementById('hero-file-input');
    const preview = document.getElementById('hero-preview');
    const placeholder = document.getElementById('hero-placeholder');
    const urlInput = document.getElementById('hero-image-url');
    const removeBtn = document.getElementById('hero-remove-btn');
    const progress = document.getElementById('hero-upload-progress');

    document.getElementById('hero-click-label')?.addEventListener('click', () => fileInput.click());
    dropZone.addEventListener('click', (e) => {
        if (e.target === dropZone || e.target.tagName === 'P') fileInput.click();
    });

    dropZone.addEventListener('dragover', (e) => { e.preventDefault(); dropZone.classList.add('border-primary'); });
    dropZone.addEventListener('dragleave', () => dropZone.classList.remove('border-primary'));
    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('border-primary');
        const file = e.dataTransfer.files[0];
        if (file) handleHeroFile(file);
    });

    fileInput.addEventListener('change', () => {
        if (fileInput.files[0]) handleHeroFile(fileInput.files[0]);
    });

    removeBtn?.addEventListener('click', () => {
        preview.style.display = 'none';
        placeholder.style.display = 'flex';
        urlInput.value = '';
        removeBtn.classList.add('hidden');
        dropZone.classList.remove('has-image');
    });

    async function handleHeroFile(file) {
        progress.style.display = 'flex';
        try {
            const url = await uploadImage(file);
            urlInput.value = url;
            preview.src = url;
            preview.style.display = 'block';
            placeholder.style.display = 'none';
            dropZone.classList.add('has-image');
            removeBtn?.classList.remove('hidden');
        } catch (err) {
            toast('Échec de l\'upload: ' + err.message, true);
        } finally {
            progress.style.display = 'none';
        }
    }
}

function setHeroPreview(url) {
    if (!url) return;
    const preview = document.getElementById('hero-preview');
    const placeholder = document.getElementById('hero-placeholder');
    const urlInput = document.getElementById('hero-image-url');
    const removeBtn = document.getElementById('hero-remove-btn');
    const dropZone = document.getElementById('hero-drop-zone');
    urlInput.value = url;
    preview.src = url;
    preview.style.display = 'block';
    placeholder.style.display = 'none';
    dropZone.classList.add('has-image');
    removeBtn?.classList.remove('hidden');
}

/* ── Auto Slug ─────────────────────────────────────────── */
function autoSlug() {
    if (isEdit) return;
    const slugField = document.getElementById('pack-slug');
    if (slugField && !slugField.dataset.userEdited) {
        const name = document.getElementById('pack-name').value;
        slugField.value = slugify(name);
    }
}

function slugify(text) {
    return text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

/* ── Load Products ─────────────────────────────────────── */
async function loadProducts() {
    try {
        allProducts = await api('/admin/products');
        renderProductPicker('');
    } catch (err) {
        document.getElementById('product-picker-grid').innerHTML =
            '<p class="col-span-full text-center text-error py-8">Impossible de charger les articles.</p>';
    }
}

function renderProductPicker(search = '') {
    const grid = document.getElementById('product-picker-grid');
    const visible = allProducts.filter((p) =>
        !search || p.name.toLowerCase().includes(search) || (p.categoryLabel || '').toLowerCase().includes(search)
    );

    if (!visible.length) {
        grid.innerHTML = '<p class="col-span-full text-center text-on-surface-variant py-8">Aucun article trouvé.</p>';
        return;
    }

    grid.innerHTML = visible.map((p) => {
        const isSelected = selectedSlugs.has(p.slug);
        return `
        <div class="product-picker-card relative${isSelected ? ' selected' : ''}" data-slug="${p.slug}">
            <img src="${p.images?.hero || ''}" alt="${p.name}" loading="lazy" onerror="this.src=''" style="background:#ece1d3" />
            <span class="check-badge material-symbols-outlined" style="font-size:16px">check</span>
            <div class="card-body">
                <h4 title="${p.name}">${p.name}</h4>
                <p>${p.categoryLabel || ''}</p>
            </div>
        </div>`;
    }).join('');

    grid.querySelectorAll('.product-picker-card').forEach((card) => {
        card.addEventListener('click', () => {
            const slug = card.dataset.slug;
            if (selectedSlugs.has(slug)) {
                selectedSlugs.delete(slug);
                card.classList.remove('selected');
            } else {
                selectedSlugs.add(slug);
                card.classList.add('selected');
            }
            updateSelectedChips();
            updateSelectedCount();
        });
    });
}

function updateSelectedCount() {
    const el = document.getElementById('selected-count');
    if (el) el.textContent = `${selectedSlugs.size} sélectionné${selectedSlugs.size > 1 ? 's' : ''}`;
}

function updateSelectedChips() {
    const container = document.getElementById('selected-chips');
    if (!container) return;
    container.innerHTML = [...selectedSlugs].map((slug) => {
        const product = allProducts.find((p) => p.slug === slug);
        if (!product) return '';
        return `
        <span class="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium">
            ${product.name}
            <button type="button" class="remove-chip hover:text-error" data-slug="${slug}">
                <span class="material-symbols-outlined" style="font-size:14px">close</span>
            </button>
        </span>`;
    }).join('');

    container.querySelectorAll('.remove-chip').forEach((btn) => {
        btn.addEventListener('click', () => {
            const slug = btn.dataset.slug;
            selectedSlugs.delete(slug);
            // update the card in the grid if visible
            const card = document.querySelector(`.product-picker-card[data-slug="${slug}"]`);
            if (card) card.classList.remove('selected');
            updateSelectedChips();
            updateSelectedCount();
        });
    });
}

/* ── Load Existing Pack (Edit Mode) ────────────────────── */
async function loadPack(slug) {
    try {
        const pack = await api(`/admin/packs/${slug}`);
        document.getElementById('pack-name').value = pack.name || '';
        document.getElementById('pack-slug').value = pack.slug || '';
        document.getElementById('pack-status').value = pack.status || 'draft';
        document.getElementById('pack-price').value = pack.price || '';
        document.getElementById('pack-old-price').value = pack.oldPrice || '';
        document.getElementById('pack-short-desc').value = pack.shortDescription || '';
        document.getElementById('pack-desc').value = pack.description || '';

        if (pack.images?.hero || pack.heroImage) setHeroPreview(pack.images?.hero || pack.heroImage);

        // Map old_price (snake_case from DB) to form field
        document.getElementById('pack-old-price').value = pack.old_price || pack.oldPrice || '';

        // Pre-select included products — stored as `items` in the DB
        const included = pack.items || pack.includedProducts || [];
        if (Array.isArray(included)) {
            included.forEach((item) => {
                const slug = item.productSlug || item.slug;
                if (slug) selectedSlugs.add(slug);
            });
            updateSelectedChips();
            updateSelectedCount();
            // Re-render picker to show selected state
            renderProductPicker('');
        }
    } catch (err) {
        toast('Impossible de charger le pack: ' + err.message, true);
    }
}

/* ── Build Payload ─────────────────────────────────────── */
function buildPayload() {
    const includedProducts = [...selectedSlugs].map((slug) => {
        const product = allProducts.find((p) => p.slug === slug);
        if (!product) return null;
        return {
            productSlug: product.slug,
            name: product.name,
            material: product.materials?.[0]?.title || product.specs?.find(s => s.label === 'Structure')?.value || '',
            price: product.price || 0,
            image: product.images?.hero || '',
        };
    }).filter(Boolean);

    return {
        name: document.getElementById('pack-name').value.trim(),
        slug: document.getElementById('pack-slug').value.trim() || slugify(document.getElementById('pack-name').value.trim()),
        status: document.getElementById('pack-status').value,
        price: Number(document.getElementById('pack-price').value) || 0,
        oldPrice: document.getElementById('pack-old-price').value ? Number(document.getElementById('pack-old-price').value) : null,
        shortDescription: document.getElementById('pack-short-desc').value.trim(),
        description: document.getElementById('pack-desc').value.trim(),
        heroImage: document.getElementById('hero-image-url').value.trim(),
        images: { hero: document.getElementById('hero-image-url').value.trim() },
        // Use `items` to match the DB column name; also send includedProducts for compatibility
        items: includedProducts,
        includedProducts,
    };
}

/* ── Submit ────────────────────────────────────────────── */
async function handleSubmit(e) {
    e.preventDefault();
    const errorEl = document.getElementById('form-error');
    const submitBtn = document.getElementById('submit-btn');

    const payload = buildPayload();
    if (!payload.name) {
        errorEl.textContent = 'Le nom du pack est requis.';
        errorEl.classList.remove('hidden');
        return;
    }
    errorEl.classList.add('hidden');
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="material-symbols-outlined text-lg animate-spin">progress_activity</span> Enregistrement…';

    try {
        if (isEdit && packSlug) {
            await api(`/admin/packs/${packSlug}`, { method: 'PUT', body: JSON.stringify(payload) });
            toast('Pack mis à jour !');
        } else {
            await api('/admin/packs', { method: 'POST', body: JSON.stringify(payload) });
            toast('Pack créé !');
            setTimeout(() => { window.location.href = '../packs.html'; }, 800);
        }
    } catch (err) {
        errorEl.textContent = err.message;
        errorEl.classList.remove('hidden');
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<span class="material-symbols-outlined text-lg">save</span> ' + (isEdit ? 'Enregistrer les modifications' : 'Créer le pack');
    }
}

/* ── Delete ────────────────────────────────────────────── */
async function handleDelete() {
    const name = document.getElementById('pack-name').value;
    if (!confirm(`Supprimer le pack « ${name} » ? Cette action est irréversible.`)) return;
    try {
        await api(`/admin/packs/${packSlug}`, { method: 'DELETE' });
        toast('Pack supprimé');
        setTimeout(() => { window.location.href = '../packs.html'; }, 600);
    } catch (err) {
        toast(err.message, true);
    }
}

init();
