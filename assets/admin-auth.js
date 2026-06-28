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
    const { authenticated } = await api('/admin/me');
    if (!authenticated) {
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

export function slugify(text) {
    return text
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
}

export const CATEGORIES = [
    { id: 'sejour', label: 'Séjour' },
    { id: 'salle-a-manger', label: 'Salle à manger' },
    { id: 'chambre', label: 'Chambre' },
    { id: 'decoration', label: 'Décoration' },
    { id: 'salon', label: 'Salon' },
];
