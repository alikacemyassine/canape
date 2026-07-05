const API = '/api';

export function toast(msg, isError = false) {
    let el = document.getElementById('admin-toast');
    if (!el) {
        el = document.createElement('div');
        el.id = 'admin-toast';
        el.className = 'admin-toast';
        document.body.appendChild(el);
    }
    el.textContent = msg;
    el.style.background = isError ? '#ba1a1a' : '#353027';
    el.classList.add('show');
    setTimeout(() => el.classList.remove('show'), 3000);
}

export async function api(path, options = {}) {
    const res = await fetch(`${API}${path}`, {
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', ...options.headers },
        ...options,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || 'Une erreur est survenue');
    return data;
}

export async function requireAuth() {
    const { authenticated, debug_error } = await api('/admin/session');
    if (!authenticated) {
        if (debug_error) {
            alert('Debug Auth Error: ' + debug_error);
        }
        window.location.href = '/admin/login.html';
        return false;
    }
    return true;
}

export async function logout() {
    await api('/logout', { method: 'POST' });
    window.location.href = '/admin/login.html';
}

export function formatPrice(n) {
    return Number(n).toLocaleString('fr-FR') + ' DZD';
}

export function escapeHtml(value) {
    return String(value || '')
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

export function slugify(text) {
    return text
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
}

export const CATEGORIES_TREE = {
    'sejour': {
        label: 'Séjour',
        subcategories: {
            'fauteuils': { label: 'Fauteuils' },
            'canapes': { label: 'Canapés' },
            'general': { label: 'Général Séjour' }
        }
    },
    'salle-a-manger': {
        label: 'Salle à manger',
        subcategories: {
            'tables-de-repas': { label: 'Tables de repas' },
            'general': { label: 'Général Salle à manger' }
        }
    },
    'chambre': {
        label: 'Chambre',
        subcategories: {
            'adulte': {
                label: 'Adulte',
                subsubcategories: {
                    'lits': { label: 'Lits' },
                    'dressing': { label: 'Dressing' },
                    'commodes': { label: 'Commodes' }
                }
            },
            'junior': {
                label: 'Junior',
                subsubcategories: {
                    'lits': { label: 'Lits' },
                    'dressing': { label: 'Dressing' },
                    'commodes': { label: 'Commodes' },
                    'bureau': { label: 'Bureau' }
                }
            },
            'general': { label: 'Général Chambre' }
        }
    },
    'decoration': {
        label: 'Décoration',
        subcategories: {
            'luminaires': { label: 'Luminaires' },
            'miroirs': { label: 'Miroirs' },
            'general': { label: 'Général Décoration' }
        }
    },
    'salon': {
        label: 'Salon',
        subcategories: {
            'general': { label: 'Général Salon' }
        }
    }
};

/**
 * Convert a File to a base64 data URL.
 */
function fileToDataUrl(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

/**
 * Upload an image file to /api/admin/upload.
 * Returns the public URL string.
 */
export async function uploadImage(file) {
    if (!file) throw new Error('Aucun fichier sélectionné');
    if (!file.type.startsWith('image/')) throw new Error('Choisissez une image valide (JPG, PNG…)');
    if (file.size > 10 * 1024 * 1024) throw new Error('Image trop lourde. Maximum 10 Mo.');
    const dataUrl = await fileToDataUrl(file);
    const result = await api('/admin/upload', {
        method: 'POST',
        body: JSON.stringify({ fileName: file.name, dataUrl }),
    });
    return result.url;
}

