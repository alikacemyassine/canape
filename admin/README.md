# LE CANAPÉ - Admin

Gestion du catalogue produits (articles) avec publication en direct sur le site.

## Accès

**URL :** `https://canape.vercel.app/admin/login.html`

L'admin se connecte avec le mot de passe défini dans `ADMIN_PASSWORD`.

## Fonctionnalités

- **Catalogue** - voir tous les articles (publiés + brouillons)
- **Supprimer** - retirer un article du catalogue
- **Ajouter** - formulaire complet (infos, dimensions, couleurs, images, matières)
- **Publier** - les articles publiés apparaissent immédiatement sur `/produits/`

## Configuration Vercel

1. **Mot de passe** - Project Settings > Environment Variables :
   - `ADMIN_PASSWORD` = votre mot de passe admin

2. **Stockage** (obligatoire en production) - Storage > Create KV Database > Connect to project
   Sans KV, les modifications ne persistent pas sur Vercel (lecture seule depuis `data/products.json`).

## Développement local

```bash
npm install
cp .env.example .env.local   # puis éditer ADMIN_PASSWORD
npm run dev                  # vercel dev - API + site
```

En local sans KV, les sauvegardes écrivent dans `data/products.json`.

## Après modification manuelle du JSON

```bash
npm run generate
```
