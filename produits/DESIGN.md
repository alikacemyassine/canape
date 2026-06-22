---
name: Le Canapé Design System
colors:
  surface: '#fff8f5'
  surface-dim: '#e3d8cb'
  surface-bright: '#fff8f5'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#fff1ea'
  surface-container: '#f7ecdf'
  surface-container-high: '#f6e5dc'
  surface-container-highest: '#ece1d3'
  on-surface: '#221a15'
  on-surface-variant: '#564337'
  inverse-surface: '#353027'
  inverse-on-surface: '#ffede4'
  outline: '#897265'
  outline-variant: '#ddc1b1'
  surface-tint: '#964900'
  primary: '#723600'
  on-primary: '#ffffff'
  primary-container: '#f08128'
  on-primary-container: '#ffcfb1'
  inverse-primary: '#ffb787'
  secondary: '#5f5e5e'
  on-secondary: '#ffffff'
  secondary-container: '#e2dfdf'
  on-secondary-container: '#636262'
  tertiary: '#00497f'
  on-tertiary: '#ffffff'
  tertiary-container: '#0061a6'
  on-tertiary-container: '#c1dbff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdcc7'
  primary-fixed-dim: '#ffb787'
  on-primary-fixed: '#311300'
  on-primary-fixed-variant: '#723600'
  secondary-fixed: '#e5e2e1'
  secondary-fixed-dim: '#c8c6c6'
  on-secondary-fixed: '#1c1b1c'
  on-secondary-fixed-variant: '#474647'
  tertiary-fixed: '#d2e4ff'
  tertiary-fixed-dim: '#a0caff'
  on-tertiary-fixed: '#001c37'
  on-tertiary-fixed-variant: '#00497e'
  background: '#fff8f3'
  on-background: '#221a15'
  surface-variant: '#f0dfd6'
  brand-gold: '#c9a96e'
typography:
  display-lg:
    fontFamily: Playfair Display
    fontSize: 80px
    fontWeight: '600'
    lineHeight: 96px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Playfair Display
    fontSize: 48px
    fontWeight: '500'
    lineHeight: 56px
  headline-lg-mobile:
    fontFamily: Playfair Display
    fontSize: 32px
    fontWeight: '500'
    lineHeight: 40px
  headline-md:
    fontFamily: Playfair Display
    fontSize: 32px
    fontWeight: '500'
    lineHeight: 40px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 32px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-caps:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.1em
spacing:
  stack-sm: 8px
  stack-md: 24px
  stack-lg: 48px
  section-gap: 160px
  margin-mobile: 24px
  margin-desktop: 80px
  gutter: 32px
---

# LE CANAPÉ — Design System `designnmd`

> Complete reference for all design patterns, tokens, typography, animations, and component rules used in the [index.html](file:///c:/Users/omar/OneDrive/Desktop/project/canape/index.html) project.

---

## 🎨 Color Palette

The entire color system is based on **Material You** warm tones, built around a rich leather/amber primary and warm ivory backgrounds.

### Core Brand Colors

| Token | Hex | Usage |
|---|---|---|
| `primary` | `#964900` | Logo, active links, accents, borders |
| `primary-container` | `#f08128` | Hover/active backgrounds |
| `primary-fixed` | `#ffdcc7` | Subtle tint backgrounds |
| `primary-fixed-dim` | `#ffb787` | Lighter accent tones |
| `inverse-primary` | `#ffb787` | Dark-mode primary |
| `on-primary` | `#ffffff` | Text on primary buttons |
| `on-primary-container` | `#592800` | Text on primary-container |

### Surface & Background

| Token | Hex | Usage |
|---|---|---|
| `background` | `#fff8f3` | Page background (warm ivory) |
| `surface` | `#fff8f3` | Same as background |
| `surface-bright` | `#fff8f3` | Elevated surface |
| `surface-dim` | `#e3d8cb` | Pressed/dim state |
| `surface-container-lowest` | `#ffffff` | Pure white cards |
| `surface-container-low` | `#fdf2e4` | Slightly tinted surfaces |
| `surface-container` | `#f7ecdf` | Cards and panels |
| `surface-container-high` | `#f2e7d9` | Elevated containers |
| `surface-container-highest` | `#ece1d3` | Footer, darkest surface |
| `surface-variant` | `#ece1d3` | Same as highest |
| `inverse-surface` | `#353027` | Dark sections (preloader, dark panels) |
| `inverse-on-surface` | `#faefe1` | Text on dark sections |

### Text / On-Surface

| Token | Hex | Usage |
|---|---|---|
| `on-surface` | `#201b13` | Primary body text (dark charcoal-brown) |
| `on-background` | `#201b13` | Same as on-surface |
| `on-surface-variant` | `#564337` | Muted text, subtext, nav links |

### Secondary & Tertiary

| Token | Hex | Usage |
|---|---|---|
| `secondary` | `#5f5e5e` | Secondary UI elements |
| `secondary-container` | `#e2dfde` | Secondary backgrounds |
| `tertiary` | `#5e5f5c` | Tertiary elements |
| `tertiary-container` | `#9f9f9c` | Tertiary backgrounds |

### Outline & Dividers

| Token | Hex | Usage |
|---|---|---|
| `outline` | `#897265` | Borders, dividers |
| `outline-variant` | `#ddc1b1` | Lighter borders |

### Gold Accent (Inline CSS)

This special brand gold is used directly in certain elements and the preloader — **not** in the Tailwind config:

| Value | Usage |
|---|---|
| `#c9a96e` | Preloader line, CTA button border, gold gradient rule |

---

## 🔤 Typography

Two font families are used consistently throughout the project.

### Font Families

| Role | Family | Use for |
|---|---|---|
| **Display / Headings** | `Playfair Display` (serif) | Hero titles, section headings, category names |
| **Body / UI** | `Inter` (sans-serif) | Body copy, nav links, labels, tags, captions |

Both are loaded from **Google Fonts**.

### Type Scale

| Token | Size | Line Height | Weight | Letter Spacing | Family |
|---|---|---|---|---|---|
| `display-lg` | `80px` | `96px` | `600` | `-0.02em` | Playfair Display |
| `headline-lg` | `48px` | `56px` | `500` | — | Playfair Display |
| `headline-lg-mobile` | `32px` | `40px` | `500` | — | Playfair Display |
| `headline-md` | `32px` | `40px` | `500` | — | Playfair Display |
| `body-lg` | `18px` | `32px` | `400` | — | Inter |
| `body-md` | `16px` | `24px` | `400` | — | Inter |
| `label-caps` | `12px` | `16px` | `600` | `0.1em` | Inter |

### Typography Usage Rules
- **Hero Title**: `display-lg` on desktop → `headline-lg` on mobile. Rendered with cinematic 3D character-split animation.
- **Section Headings**: `headline-lg` or `headline-md` in Playfair Display.
- **Navigation Links**: `label-caps` in Inter, ALL CAPS, `tracking-[0.1em]`.
- **Sub-category Tags**: `label-caps`, uppercase, `tracking-[0.1em]`.
- **Body Paragraphs**: `body-lg` (18px) or `body-md` (16px) in Inter.
- **Preloader**: Playfair Display, `clamp(1.8rem, 5vw, 3.5rem)`, weight 600, `letter-spacing: 0.4em`.

---

## 📐 Spacing System

| Token | Value | Usage |
|---|---|---|
| `stack-sm` | `8px` | Tight spacing between small elements |
| `stack-md` | `24px` | Standard vertical stacking |
| `stack-lg` | `48px` | Large vertical gaps |
| `section-gap` | `160px` | Between major page sections |
| `margin-mobile` | `24px` | Horizontal page margin on mobile |
| `margin-desktop` | `80px` | Horizontal page margin on desktop |
| `gutter` | `32px` | Grid gutter / column gap |

---

## 🔵 Border Radius

| Token | Value |
|---|---|
| `DEFAULT` | `0.25rem` (4px) |
| `lg` | `0.5rem` (8px) |
| `xl` | `0.75rem` (12px) |
| `full` | `9999px` (pill) |

> **Note**: The design is almost entirely **borderless / flat**. Border radius is rarely used. The aesthetic favors sharp edges for a European luxury feel.

---

## 🧩 Component Patterns

### Navigation Bar

- **Position**: Fixed, full-width, `z-50`
- **Default State**: Fully transparent background, no border
- **Scrolled State** (`.glass-nav.scrolled`): 
  - `background: rgba(255, 248, 243, 0.85)` (warm ivory, 85% opacity)
  - `backdrop-filter: blur(16px)` — glassmorphism
  - `border-bottom: 1px solid rgba(221, 193, 177, 0.4)`
- **Hidden State** (`.glass-nav.hidden-nav`): `translateY(-100%)` when scrolling down fast
- **Transition**: All properties at `0.5s cubic-bezier(0.16, 1, 0.3, 1)`
- **Logo**: Centered, `headline-md`, bold, `text-primary`
- **Nav Links**: `label-caps`, uppercase, `text-on-surface-variant`, hover → `text-primary`. Active link: `border-b border-primary`.

---

### Preloader

- **Background**: `#353027` (inverse-surface dark brown)
- **Logo Text**: Gold (`#c9a96e`), Playfair Display, responsive `clamp()` size, `letter-spacing: 0.4em`
- **Animation sequence**:
  1. Logo slides up from masked container (`translateY(110% → 0%`)
  2. Gold horizontal line expands from `0 → 200px`
  3. Hold for `0.8s`
  4. Logo slides back down, line collapses
  5. Entire screen peels up (`yPercent: -100`)
- **Total duration**: ~4.5s

---

### Hero Section

- **Background**: Full-screen image with `object-fit: cover`, scaled to `1.15` for parallax room
- **Headline**: `display-lg` → `headline-lg-mobile`, Playfair Display, white text, `drop-shadow-lg`
- **Subheadline**: `body-lg`, white, `opacity-80`
- **Character Animation**: Each letter individually animated with a 3D flip:
  - Initial: `opacity: 0`, `y: 120`, `rotationX: -120`, `filter: blur(8px)`
  - Animation: triggered on first scroll, `duration: 1.2s`, `stagger: 0.03s`, `ease: expo.out`
- **Scroll behavior**: First scroll intent triggers text animation. While animating, scroll speed drops to `0.15x`. Returns to normal when complete.
- **CTA Button**: Gold border (`#c9a96e`), text gold, uppercase label, with magnetic hover effect.

---

### Image Cards (Category Panels / Gallery)

- **Container**: `.parallax-wrapper` → `overflow: hidden`
- **Image**: `.parallax-element` → `transform: scale(1.15)`, `will-change: transform`
- **Hover Scale**: `.hover-scale-soft` → `transform: scale(1.04)`, `transition: 0.8s cubic-bezier(0.16, 1, 0.3, 1)`
- **Overlay**: Dark gradient overlay on images, `rgba(0,0,0,0.3)` on sub-category tags (no blur)

---

### Sub-Category Tags (inside category panels)

```html
<span class="px-4 py-2 border border-surface-container-lowest 
             font-label-caps text-label-caps tracking-[0.1em] uppercase 
             hover:bg-surface-container-lowest hover:text-on-surface 
             transition-colors cursor-pointer pointer-events-auto bg-black/30">
```
- No `backdrop-blur` (removed for mobile GPU performance)
- White text by default on dark backgrounds
- Hover state fills with white and flips to dark text

---

### CTA Button (Magnetic)

```html
<a class="magnetic-btn inline-flex items-center gap-3 px-10 py-4 
          font-label-caps text-label-caps tracking-[0.15em] uppercase"
   style="border: 1px solid #c9a96e; color: #c9a96e;">
```
- **Magnetic Effect**: Button and inner text follow the mouse cursor with 30% pull (`0.3x` factor), text moves at half that (`0.15x`). Snaps back on `mouseleave`.
- **GSAP `quickTo`**: Duration `0.4s`, `power3` easing.

---

### Footer

- **Background**: `surface-container-highest` (`#ece1d3`)
- **Border**: `border-t border-outline-variant`
- **Layout**: Flex row on desktop, column on mobile
- **Logo**: `headline-lg`, `text-primary`
- **Links**: `body-md`, `text-on-surface-variant`, hover → `text-primary` + `translate-x-1`
- **SEO Paragraph**: Small text, `opacity-80`, keyword-rich French content

---

## 🎬 Animation System

### Libraries
- **GSAP 3.12.5** — core animation engine
- **ScrollTrigger** — scroll-driven animations
- **Lenis 1.0.39** — smooth scroll engine, synced to GSAP ticker

### Lenis Config
```js
{
  duration: 2.2,          // Very slow, luxurious scroll
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  mouseMultiplier: 0.6,   // Soft mouse wheel sensitivity
  smoothTouch: true,
  touchMultiplier: 1.5
}
```

### Easing Curves

| Name | Value | Feel |
|---|---|---|
| `expo.out` | GSAP built-in | Dramatic burst, soft landing — used everywhere |
| `expo.in` | GSAP built-in | Slow start, fast exit — used for preloader exit |
| `expo.inOut` | GSAP built-in | Smooth both ways — used for screen peels |
| Custom cubic | `cubic-bezier(0.16, 1, 0.3, 1)` | Ultra-smooth spring — hover effects |

### Scroll Reveal Classes

| Class | Behavior |
|---|---|
| `.reveal-up` | Fades in from `y: 60` when entering viewport. Batched with ScrollTrigger. |
| `.brand-quote-el` | Fades in from `y: 50`, `stagger: 0.15s` |
| `.hero-entrance` | Hidden on load, animated in after preloader (`y: 40 → 0`) |
| `.hero-entrance-1` | The hero title — handled by character splitter instead |

### Category Scroll Animation
- **Technique**: GSAP ScrollTrigger `pin: true` — the section pins to the viewport while the user scrolls through it.
- **Config**: `scrub: 1`, `anticipatePin: 1`, `snap` to labels.
- **Performance**: All panels have `will-change: transform` set via CSS.

---

## 🏗️ Layout Structure

```
<body>
  ├── #preloader         (fixed, z-9999, dark fullscreen)
  ├── <nav>              (fixed, z-50, glass-nav)
  ├── <main>
  │   ├── .hero-section  (100vh, full-bleed image, z-1)
  │   └── .main-content  (z-2, bg-background, sits above hero on scroll)
  │       ├── Categories Section  (pinned GSAP scroll)
  │       ├── Brand Quote Section
  │       └── <footer>
```

---

## 🌐 SEO & Meta

- **Title**: `LE CANAPÉ | Mobilier de Luxe & Décoration à Oran`
- **Description**: French, keyword-rich, targets Oran + luxury furniture
- **Canonical**: `https://canape.vercel.app/`
- **Open Graph**: Image, title, description, URL set
- **Twitter Card**: `summary_large_image`
- **Schema.org**: `FurnitureStore` type with address (Oran, DZ)
- **Robots**: `index, follow`
- **Sitemap**: `/sitemap.xml`
- **Google Verification**: `googleb6441386e4c457a1.html`

---

## 📱 Responsive Breakpoints

Standard Tailwind breakpoints apply:
| Prefix | Width |
|---|---|
| `sm` | ≥ 640px |
| `md` | ≥ 768px |
| `lg` | ≥ 1024px |
| `xl` | ≥ 1280px |

Key responsive patterns:
- Navigation: full desktop nav hidden on mobile → hamburger menu slides in from right
- Heading: `display-lg` on desktop → `headline-lg` on mobile (responsive via `md:` prefix)
- Padding: `margin-mobile (24px)` on small → `margin-desktop (80px)` on md+
- Grid columns: responsive per-section
