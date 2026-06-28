import { api, requireAuth, toast, slugify, CATEGORIES } from './admin-auth.js';

const params = new URLSearchParams(window.location.search);
const editSlug = params.get('slug');
const isEdit = Boolean(editSlug);

let colors = [];
let materials = [{ tag: '', title: '', text: '', image: '' }, { tag: '', title: '', text: '', image: '' }];

async function init() {
    if (!(await requireAuth())) return;
    document.getElementById('logout-btn')?.addEventListener('click', async () => {
        await api('/logout', { method: 'POST' });
        window.location.href = '/admin/login.html';
    });

    const catSelect = document.getElementById('category');
    CATEGORIES.forEach((c) => {
        const opt = document.createElement('option');
        opt.value = c.id;
        opt.textContent = c.label;
        catSelect.appendChild(opt);
    });

    document.getElementById('article-title')?.addEventListener('input', (e) => {
        if (!isEdit) document.getElementById('slug-preview').textContent = slugify(e.target.value) || '—';
    });

    document.getElementById('add-color')?.addEventListener('click', () => {
        colors.push({ hex: '#964900', label: '' });
        renderColors();
    });

    document.getElementById('save-draft')?.addEventListener('click', () => save('draft'));
    document.getElementById('publish-btn')?.addEventListener('click', () => save('published'));

    setupImageUploaders();

    if (isEdit) await loadProduct(editSlug);
    else renderColors();
    refreshImagePreviews();
}

async function loadProduct(slug) {
    try {
        const p = await api(`/admin/products/${slug}`);
        document.getElementById('article-title').value = p.name;
        document.getElementById('slug-preview').textContent = p.slug;
        document.getElementById('category').value = p.category;
        document.getElementById('short-desc').value = p.shortDescription || '';
        document.getElementById('long-desc').value = p.description || '';
        document.getElementById('price').value = p.price || '';
        document.getElementById('hero-image').value = p.images?.hero || '';
        document.getElementById('gallery-1').value = p.images?.gallery?.[0] || '';
        document.getElementById('gallery-2').value = p.images?.gallery?.[1] || '';

        const dims = p.dimensions || {};
        document.getElementById('dim-l').value = parseDim(dims.largeur);
        document.getElementById('dim-p').value = parseDim(dims.profondeur);
        document.getElementById('dim-h').value = parseDim(dims.hauteur);
        document.getElementById('dim-a').value = parseDim(dims.assise);

        const specMap = {};
        (p.specs || []).forEach((s) => { specMap[s.label] = s.value; });
        document.getElementById('spec-structure').value = specMap['Structure'] || specMap['Plateau'] || specMap['Revêtement'] || specMap['Cadre'] || '';
        document.getElementById('spec-padding').value = specMap['Rembourrage'] || specMap['Tête de lit'] || specMap['Abat-jour'] || '';
        document.getElementById('spec-suspension').value = specMap['Suspension'] || specMap['Piètement'] || specMap['Ampoule'] || specMap['Verre'] || '';
        document.getElementById('spec-fabrication').value = specMap['Fabrication'] || '';

        colors = p.colors?.length ? [...p.colors] : [];
        materials = p.materials?.length >= 2 ? [...p.materials] : materials;
        if (p.materials?.length === 1) materials[0] = p.materials[0];

        renderColors();
        renderMaterials();
        refreshImagePreviews();
        document.getElementById('form-title').textContent = 'Modifier l\'article';
    } catch (err) {
        toast(err.message, true);
    }
}

function parseDim(val) {
    if (!val || val === '—') return '';
    return String(val).replace(/\s*cm$/, '');
}

function renderColors() {
    const wrap = document.getElementById('colors-wrap');
    wrap.innerHTML = colors.map((c, i) => `
        <div class="flex items-center gap-2">
            <input type="color" value="${c.hex}" data-i="${i}" class="color-picker w-10 h-10 rounded-full cursor-pointer border-0"/>
            <input type="text" value="${c.label || ''}" placeholder="Nom" data-i="${i}" class="admin-input flex-1 color-label"/>
            <button type="button" data-i="${i}" class="remove-color text-secondary hover:text-error material-symbols-outlined">close</button>
        </div>`).join('');

    wrap.querySelectorAll('.color-picker').forEach((el) => {
        el.addEventListener('input', (e) => { colors[e.target.dataset.i].hex = e.target.value; });
    });
    wrap.querySelectorAll('.color-label').forEach((el) => {
        el.addEventListener('input', (e) => { colors[e.target.dataset.i].label = e.target.value; });
    });
    wrap.querySelectorAll('.remove-color').forEach((el) => {
        el.addEventListener('click', (e) => {
            colors.splice(Number(e.currentTarget.dataset.i), 1);
            renderColors();
        });
    });
}

function renderMaterials() {
    ['mat-0', 'mat-1'].forEach((id, i) => {
        const m = materials[i] || {};
        document.getElementById(`${id}-tag`).value = m.tag || '';
        document.getElementById(`${id}-title`).value = m.title || '';
        document.getElementById(`${id}-text`).value = m.text || '';
        document.getElementById(`${id}-image`).value = m.image || '';
    });
    refreshImagePreviews();
}

function fileToDataUrl(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(file);
    });
}

async function uploadImage(file, input, dropzone) {
    if (!file) return;
    if (!file.type.startsWith('image/')) return toast('Choisissez une image valide', true);
    if (file.size > 5 * 1024 * 1024) return toast('Image trop lourde. Maximum 5 Mo.', true);

    const previousText = dropzone.querySelector('.admin-upload-title')?.textContent;
    dropzone.classList.add('uploading');
    dropzone.querySelector('.admin-upload-title').textContent = 'Upload en cours...';

    try {
        const dataUrl = await fileToDataUrl(file);
        const result = await api('/admin/upload', {
            method: 'POST',
            body: JSON.stringify({ fileName: file.name, dataUrl }),
        });
        input.value = result.url;
        updateImagePreview(input, dropzone);
        toast('Image ajoutee');
    } catch (err) {
        toast(err.message, true);
        if (previousText) dropzone.querySelector('.admin-upload-title').textContent = previousText;
    } finally {
        dropzone.classList.remove('uploading');
    }
}

function updateImagePreview(input, dropzone = null) {
    const zone = dropzone || document.querySelector(`[data-upload-for="${input.id}"]`);
    if (!zone) return;
    const url = input.value.trim();
    const preview = zone.querySelector('.admin-upload-preview');
    const title = zone.querySelector('.admin-upload-title');
    const meta = zone.querySelector('.admin-upload-meta');

    if (url) {
        preview.innerHTML = `<img src="${url}" alt="" onerror="this.remove()"/>`;
        title.textContent = 'Image selectionnee';
        meta.textContent = url;
        zone.classList.add('has-image');
    } else {
        preview.innerHTML = '<span class="material-symbols-outlined">add_photo_alternate</span>';
        title.textContent = 'Deposer une image ici';
        meta.textContent = 'ou cliquer pour choisir depuis votre ordinateur';
        zone.classList.remove('has-image');
    }
}

function refreshImagePreviews() {
    document.querySelectorAll('[data-upload-source]').forEach((input) => updateImagePreview(input));
}

function setupImageUploaders() {
    document.querySelectorAll('#hero-image, #gallery-1, #gallery-2, #mat-0-image, #mat-1-image').forEach((input) => {
        input.dataset.uploadSource = 'true';
        input.classList.add('admin-url-fallback');

        const wrapper = document.createElement('div');
        wrapper.className = 'admin-upload-field';
        wrapper.dataset.uploadFor = input.id;
        wrapper.innerHTML = `
            <div class="admin-upload-preview"><span class="material-symbols-outlined">add_photo_alternate</span></div>
            <div class="admin-upload-copy">
                <span class="admin-upload-title">Deposer une image ici</span>
                <span class="admin-upload-meta">ou cliquer pour choisir depuis votre ordinateur</span>
            </div>
            <input type="file" accept="image/*" class="admin-upload-input"/>
        `;

        input.insertAdjacentElement('afterend', wrapper);

        const fileInput = wrapper.querySelector('.admin-upload-input');
        wrapper.addEventListener('click', () => fileInput.click());
        fileInput.addEventListener('change', () => uploadImage(fileInput.files[0], input, wrapper));
        input.addEventListener('input', () => updateImagePreview(input, wrapper));

        ['dragenter', 'dragover'].forEach((eventName) => {
            wrapper.addEventListener(eventName, (e) => {
                e.preventDefault();
                wrapper.classList.add('dragging');
            });
        });

        ['dragleave', 'drop'].forEach((eventName) => {
            wrapper.addEventListener(eventName, (e) => {
                e.preventDefault();
                wrapper.classList.remove('dragging');
            });
        });

        wrapper.addEventListener('drop', (e) => uploadImage(e.dataTransfer.files[0], input, wrapper));
        updateImagePreview(input, wrapper);
    });
}

function collectForm(status) {
    materials[0] = {
        tag: document.getElementById('mat-0-tag').value,
        title: document.getElementById('mat-0-title').value,
        text: document.getElementById('mat-0-text').value,
        image: document.getElementById('mat-0-image').value,
        aspect: 'square',
        offset: false,
    };
    materials[1] = {
        tag: document.getElementById('mat-1-tag').value,
        title: document.getElementById('mat-1-title').value,
        text: document.getElementById('mat-1-text').value,
        image: document.getElementById('mat-1-image').value,
        aspect: '4/3',
        offset: true,
    };

    const hero = document.getElementById('hero-image').value.trim();
    const g1 = document.getElementById('gallery-1').value.trim();
    const g2 = document.getElementById('gallery-2').value.trim();
    const gallery = [g1, g2].filter(Boolean);
    if (!gallery.length && hero) gallery.push(hero);

    return {
        name: document.getElementById('article-title').value.trim(),
        category: document.getElementById('category').value,
        shortDescription: document.getElementById('short-desc').value.trim(),
        description: document.getElementById('long-desc').value.trim(),
        price: Number(document.getElementById('price').value) || 0,
        status,
        heroImage: hero,
        galleryImages: gallery,
        dimLargeur: document.getElementById('dim-l').value,
        dimProfondeur: document.getElementById('dim-p').value,
        dimHauteur: document.getElementById('dim-h').value,
        dimAssise: document.getElementById('dim-a').value,
        specStructure: document.getElementById('spec-structure').value,
        specPadding: document.getElementById('spec-padding').value,
        specSuspension: document.getElementById('spec-suspension').value,
        specFabrication: document.getElementById('spec-fabrication').value,
        colors: colors.filter((c) => c.hex),
        materials: materials.filter((m) => m.title || m.image),
    };
}

async function save(status) {
    const data = collectForm(status);
    if (!data.name) return toast('Le titre est requis', true);
    if (!data.heroImage) return toast('L\'image principale est requise', true);

    try {
        if (isEdit) {
            await api(`/admin/products/${editSlug}`, { method: 'PUT', body: JSON.stringify(data) });
            toast(status === 'published' ? 'Article publié sur le site' : 'Brouillon enregistré');
        } else {
            await api('/admin/products', { method: 'POST', body: JSON.stringify(data) });
            toast(status === 'published' ? 'Article publié sur le site' : 'Brouillon créé');
        }
        setTimeout(() => { window.location.href = '/admin/catalog.html'; }, 800);
    } catch (err) {
        toast(err.message, true);
    }
}

init();
