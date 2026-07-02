import { api, requireAuth, toast, slugify, CATEGORIES_TREE } from './admin-auth.js';

const params = new URLSearchParams(window.location.search);
const editSlug = params.get('slug');
const isEdit = Boolean(editSlug);

let colors = [];
let materials = [{ tag: '', title: '', text: '', image: '' }, { tag: '', title: '', text: '', image: '' }];

function updateSubcategories() {
    const catSelect = document.getElementById('category');
    const subWrap = document.getElementById('subcategory-wrapper');
    const subSelect = document.getElementById('subcategory');
    const subsubWrap = document.getElementById('subsubcategory-wrapper');
    subSelect.innerHTML = '';
    subsubWrap.style.display = 'none';

    const catKey = catSelect.value;
    const catObj = CATEGORIES_TREE[catKey];
    if (catObj && catObj.subcategories && Object.keys(catObj.subcategories).length > 0) {
        subWrap.style.display = 'block';
        for (const [key, val] of Object.entries(catObj.subcategories)) {
            const opt = document.createElement('option');
            opt.value = key;
            opt.textContent = val.label;
            subSelect.appendChild(opt);
        }
    } else {
        subWrap.style.display = 'none';
    }
    updateSubsubcategories();
}

function updateSubsubcategories() {
    const catSelect = document.getElementById('category');
    const subSelect = document.getElementById('subcategory');
    const subsubWrap = document.getElementById('subsubcategory-wrapper');
    const subsubSelect = document.getElementById('subsubcategory');
    subsubSelect.innerHTML = '';

    const catKey = catSelect.value;
    const subKey = subSelect.value;
    const catObj = CATEGORIES_TREE[catKey];
    if (catObj && catObj.subcategories && catObj.subcategories[subKey] && catObj.subcategories[subKey].subsubcategories) {
        const subsubObj = catObj.subcategories[subKey].subsubcategories;
        if (Object.keys(subsubObj).length > 0) {
            subsubWrap.style.display = 'block';
            for (const [key, val] of Object.entries(subsubObj)) {
                const opt = document.createElement('option');
                opt.value = key;
                opt.textContent = val.label;
                subsubSelect.appendChild(opt);
            }
            return;
        }
    }
    subsubWrap.style.display = 'none';
}

async function init() {
    if (!(await requireAuth())) return;
    document.getElementById('logout-btn')?.addEventListener('click', async () => {
        await api('/logout', { method: 'POST' });
        window.location.href = '/admin/login.html';
    });

    const catSelect = document.getElementById('category');
    for (const [key, val] of Object.entries(CATEGORIES_TREE)) {
        const opt = document.createElement('option');
        opt.value = key;
        opt.textContent = val.label;
        catSelect.appendChild(opt);
    }

    catSelect.addEventListener('change', updateSubcategories);
    document.getElementById('subcategory').addEventListener('change', updateSubsubcategories);
    updateSubcategories();

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
        updateSubcategories();
        document.getElementById('subcategory').value = p.subcategory || 'general';
        updateSubsubcategories();
        document.getElementById('subsubcategory').value = p.subsubcategory || '';
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
        <div class="flex flex-col gap-4 p-5 border border-outline-variant rounded-md bg-white">
            <div class="flex items-center gap-4">
                <input type="color" value="${c.hex}" data-i="${i}" class="color-picker w-10 h-10 rounded-full cursor-pointer border-0 p-0 shadow-sm"/>
                <input type="text" value="${c.label || ''}" placeholder="Nom de la variante (ex: Velours Noir)" data-i="${i}" class="admin-input flex-1 color-label font-medium"/>
                <button type="button" data-i="${i}" title="Supprimer" class="remove-color text-secondary hover:text-error material-symbols-outlined p-2 transition-colors">delete</button>
            </div>
            
            <div class="mt-2 border-t border-outline-variant pt-4">
                <p class="text-xs font-medium text-secondary mb-3 uppercase tracking-wider">Galerie d'images</p>
                <div class="flex gap-3 overflow-x-auto pb-3 color-gallery-wrap" data-color-index="${i}">
                    ${(c.gallery || []).map((imgUrl, imgIndex) => `
                        <div class="relative flex-shrink-0 w-28 h-28 rounded-md border border-outline-variant overflow-hidden group color-thumb cursor-grab active:cursor-grabbing" data-img-index="${imgIndex}" draggable="true">
                            <img src="${imgUrl}" class="w-full h-full object-cover" />
                            <button type="button" class="absolute top-1 right-1 bg-black/60 text-white rounded-full w-7 h-7 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity remove-color-image hover:bg-error" data-c="${i}" data-img="${imgIndex}">
                                <span class="material-symbols-outlined text-[16px]">close</span>
                            </button>
                            ${imgIndex === 0 ? '<div class="absolute bottom-0 left-0 w-full bg-black/60 text-white text-[10px] text-center py-1 uppercase tracking-wider">Principale</div>' : ''}
                        </div>
                    `).join('')}
                    
                    <div class="flex-shrink-0 w-28 h-28 rounded-md border-2 border-dashed border-outline-variant hover:border-primary flex flex-col items-center justify-center text-secondary hover:text-primary cursor-pointer transition-colors color-dropzone bg-gray-50/50" data-color-index="${i}">
                        <span class="material-symbols-outlined mb-1">add_photo_alternate</span>
                        <span class="text-[11px] text-center px-2 font-medium">Glisser ou cliquer</span>
                        <input type="file" accept="image/*" class="hidden color-upload-input" data-color-index="${i}" multiple />
                    </div>
                </div>
            </div>
        </div>`).join('');

    bindColorEvents(wrap);
}

function bindColorEvents(wrap) {
    wrap.querySelectorAll('.color-picker').forEach(el => el.addEventListener('input', e => { colors[e.target.dataset.i].hex = e.target.value; }));
    wrap.querySelectorAll('.color-label').forEach(el => el.addEventListener('input', e => { colors[e.target.dataset.i].label = e.target.value; }));
    wrap.querySelectorAll('.remove-color').forEach(el => el.addEventListener('click', e => {
        colors.splice(Number(e.currentTarget.dataset.i), 1);
        renderColors();
    }));

    // Setup dropzones
    wrap.querySelectorAll('.color-dropzone').forEach(dropzone => {
        const cIndex = dropzone.dataset.colorIndex;
        const input = dropzone.querySelector('.color-upload-input');
        
        dropzone.addEventListener('click', () => input.click());
        input.addEventListener('change', async (e) => {
            if (e.target.files.length) await handleColorUploads(cIndex, Array.from(e.target.files), dropzone);
        });

        dropzone.addEventListener('dragenter', e => { e.preventDefault(); dropzone.classList.add('border-primary'); });
        dropzone.addEventListener('dragover', e => { e.preventDefault(); dropzone.classList.add('border-primary'); });
        dropzone.addEventListener('dragleave', e => { e.preventDefault(); dropzone.classList.remove('border-primary'); });
        dropzone.addEventListener('drop', async e => {
            e.preventDefault();
            dropzone.classList.remove('border-primary');
            if (e.dataTransfer.files.length) await handleColorUploads(cIndex, Array.from(e.dataTransfer.files), dropzone);
        });
    });

    wrap.querySelectorAll('.remove-color-image').forEach(btn => {
        btn.addEventListener('click', e => {
            const cIndex = btn.dataset.c;
            const imgIndex = btn.dataset.img;
            colors[cIndex].gallery.splice(imgIndex, 1);
            renderColors();
        });
    });
    
    // Drag and Drop for reordering thumbnails
    let draggedThumb = null;
    wrap.querySelectorAll('.color-thumb').forEach(thumb => {
        thumb.addEventListener('dragstart', function(e) {
            draggedThumb = this;
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('text/plain', ''); // Firefox fix
            setTimeout(() => this.classList.add('opacity-40'), 0);
        });
        
        thumb.addEventListener('dragend', function() {
            this.classList.remove('opacity-40');
            draggedThumb = null;
        });
        
        thumb.addEventListener('dragover', function(e) {
            e.preventDefault();
            this.classList.add('border-primary', 'border-2');
        });
        
        thumb.addEventListener('dragleave', function() {
            this.classList.remove('border-primary', 'border-2');
        });
        
        thumb.addEventListener('drop', function(e) {
            e.preventDefault();
            this.classList.remove('border-primary', 'border-2');
            if (draggedThumb === this) return;
            
            const container = this.closest('.color-gallery-wrap');
            if (!container || container !== draggedThumb.closest('.color-gallery-wrap')) return;
            
            const cIndex = container.dataset.colorIndex;
            const fromIndex = Number(draggedThumb.dataset.imgIndex);
            const toIndex = Number(this.dataset.imgIndex);
            
            const arr = colors[cIndex].gallery;
            const [movedItem] = arr.splice(fromIndex, 1);
            arr.splice(toIndex, 0, movedItem);
            
            renderColors();
        });
    });
}

async function handleColorUploads(colorIndex, files, dropzone) {
    if (!colors[colorIndex].gallery) colors[colorIndex].gallery = [];
    
    dropzone.innerHTML = '<span class="material-symbols-outlined animate-spin">refresh</span><span class="text-[11px] mt-1">Envoi...</span>';
    
    for (const file of files) {
        if (!file.type.startsWith('image/')) continue;
        if (file.size > 5 * 1024 * 1024) {
            toast('Une image est trop lourde (> 5 Mo)', true);
            continue;
        }
        
        try {
            const dataUrl = await fileToDataUrl(file);
            const result = await api('/admin/upload', {
                method: 'POST',
                body: JSON.stringify({ fileName: file.name, dataUrl }),
            });
            colors[colorIndex].gallery.push(result.url);
        } catch (err) {
            toast("Erreur lors de l'upload : " + err.message, true);
        }
    }
    
    renderColors();
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
    document.querySelectorAll('#mat-0-image, #mat-1-image').forEach((input) => {
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

    return {
        name: document.getElementById('article-title').value.trim(),
        category: document.getElementById('category').value,
        subcategory: document.getElementById('subcategory').value,
        subsubcategory: document.getElementById('subsubcategory').value,
        shortDescription: document.getElementById('short-desc').value.trim(),
        description: document.getElementById('long-desc').value.trim(),
        price: Number(document.getElementById('price').value) || 0,
        status,
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
    
    // Make sure they have at least one color with at least one image
    const hasImage = data.colors.some(c => Array.isArray(c.gallery) && c.gallery.length > 0);
    if (!hasImage) return toast('Au moins une image est requise (dans les variantes couleur)', true);

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
