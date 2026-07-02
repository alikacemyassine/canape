import { slugify, CATEGORIES_TREE } from './storage.js';

export function buildProduct(body, existing = null) {
    const now = new Date().toISOString().slice(0, 10);
    const category = body.category !== undefined ? body.category : (existing?.category || 'sejour');
    const catMeta = CATEGORIES_TREE[category] || CATEGORIES_TREE.sejour;
    const subcategory = body.subcategory !== undefined ? body.subcategory : (existing?.subcategory || 'general');
    const subMeta = catMeta.subcategories?.[subcategory] || catMeta.subcategories?.general || { label: '' };
    const subsubcategory = body.subsubcategory !== undefined ? body.subsubcategory : (existing?.subsubcategory || '');
    const subsubLabel = subsubcategory ? (subMeta.subsubcategories?.[subsubcategory]?.label || '') : '';

    const name = (body.name || existing?.name || '').trim();
    const slug = existing?.slug || slugify(body.slug || name);

    const specsFromForm = [
        { label: 'Structure', value: body.specStructure || '' },
        { label: 'Rembourrage', value: body.specPadding || '' },
        { label: 'Suspension', value: body.specSuspension || '' },
        { label: 'Fabrication', value: body.specFabrication || '' },
    ].filter((s) => s.value);

    const hero = body.heroImage || body.images?.hero || existing?.images?.hero || '';
    let gallery = body.galleryImages || body.images?.gallery || existing?.images?.gallery || [];
    gallery = gallery.filter(Boolean);
    if (!gallery.length && hero) gallery = [hero];

    return {
        slug,
        name,
        nameDisplay: (body.nameDisplay || name).toUpperCase(),
        category,
        categoryLabel: catMeta.label,
        subcategory,
        subcategoryLabel: subMeta.label,
        subsubcategory,
        subsubcategoryLabel: subsubLabel,
        price: Number(body.price ?? existing?.price ?? 0) || 0,
        currency: body.currency || existing?.currency || 'DZD',
        shortDescription: body.shortDescription || existing?.shortDescription || '',
        description: body.description || body.longDescription || body.shortDescription || existing?.description || '',
        status: body.status || existing?.status || 'draft',
        archived: body.archived ?? existing?.archived ?? false,
        createdAt: existing?.createdAt || now,
        updatedAt: now,
        images: { hero, gallery },
        colors: Array.isArray(body.colors) ? body.colors : (existing?.colors || []),
        dimensions: {
            largeur: body.dimLargeur ? `${body.dimLargeur} cm` : (body.dimensions?.largeur || existing?.dimensions?.largeur || '—'),
            profondeur: body.dimProfondeur ? `${body.dimProfondeur} cm` : (body.dimensions?.profondeur || existing?.dimensions?.profondeur || '—'),
            hauteur: body.dimHauteur ? `${body.dimHauteur} cm` : (body.dimensions?.hauteur || existing?.dimensions?.hauteur || '—'),
            assise: body.dimAssise ? `${body.dimAssise} cm` : (body.dimensions?.assise || existing?.dimensions?.assise || '—'),
        },
        specs: body.specs?.length ? body.specs : (specsFromForm.length ? specsFromForm : existing?.specs || []),
        materials: body.materials?.length ? body.materials : (existing?.materials || []),
    };
}
