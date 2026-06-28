---
name: Artisanal Cinematic Luxury
colors:
  surface: '#fff8f3'
  surface-dim: '#e3d8cb'
  surface-bright: '#fff8f3'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#fdf2e4'
  surface-container: '#f8ecdf'
  surface-container-high: '#f2e6d9'
  surface-container-highest: '#ece1d4'
  on-surface: '#201b13'
  on-surface-variant: '#554338'
  inverse-surface: '#353027'
  inverse-on-surface: '#faefe1'
  outline: '#887367'
  outline-variant: '#dbc2b3'
  surface-tint: '#964900'
  primary: '#723600'
  on-primary: '#ffffff'
  primary-container: '#964900'
  on-primary-container: '#ffcfb1'
  inverse-primary: '#ffb787'
  secondary: '#5f5e5e'
  on-secondary: '#ffffff'
  secondary-container: '#e2dfdf'
  on-secondary-container: '#636262'
  tertiary: '#464745'
  on-tertiary: '#ffffff'
  tertiary-container: '#5e5f5c'
  on-tertiary-container: '#d9d9d5'
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
  tertiary-fixed: '#e3e3de'
  tertiary-fixed-dim: '#c7c7c3'
  on-tertiary-fixed: '#1a1c1a'
  on-tertiary-fixed-variant: '#464744'
  background: '#fff8f3'
  on-background: '#201b13'
  surface-variant: '#ece1d3'
  brand-gold: '#c9a96e'
  background-warm: '#fff8f3'
  outline-warm: '#897265'
typography:
  display-lg:
    fontFamily: Playfair Display
    fontSize: 80px
    fontWeight: '600'
    lineHeight: 96px
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Playfair Display
    fontSize: 48px
    fontWeight: '600'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Playfair Display
    fontSize: 48px
    fontWeight: '500'
    lineHeight: 56px
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
  label-caps-wide:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.2em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  stack-sm: 8px
  stack-md: 24px
  stack-lg: 48px
  gutter: 32px
  margin-mobile: 24px
  margin-desktop: 80px
  section-gap: 160px
---

## Brand & Style

The design system embodies a luxurious, sophisticated, and artisanal personality, tailored for a high-end furniture showroom experience. The target audience values craftsmanship, heritage, and "quiet luxury," expecting a digital experience that feels as curated as a physical gallery.

The visual style is a blend of **Minimalism** and **Cinematic Layering**. It leverages high-fashion editorial layouts, generous whitespace, and smooth, motion-driven transitions to create an atmospheric "scroll-telling" journey. The interface prioritizes high-impact imagery and refined typography over information density, using a dual-theme approach where deep, high-contrast hero sections transition into warm, breathable neutral surfaces. This creates a rhythmic "expansion and contraction" feel that guides the user through the brand narrative.

## Colors

The palette is rooted in an earthy, warm foundation that evokes natural materials like wood, leather, and stone. 

- **Primary & Luxury Accents:** The deep terracotta primary color is used for critical actions and brand markers. The "Brand Gold" acts as a prestige accent for emphasis and celebratory details.
- **Surface Hierarchy:** The system uses a "Split-Theme" logic. High-impact sections (Hero, Preloader) utilize `inverse-surface` (a deep espresso) with `inverse-on-surface` text. Main content areas use `background-warm` (a soft cream) to ensure readability and a hospitable atmosphere.
- **Glassmorphism:** Navigation elements employ a translucent version of the background color with a heavy backdrop blur to maintain the cinematic layering effect without obstructing the visual flow.

## Typography

This design system uses a high-contrast serif and sans-serif pairing to communicate the intersection of traditional luxury and modern design.

- **Playfair Display** is the "Voice" of the brand. It is used for all major headlines and display elements. It should be typeset with tight letter-spacing in larger sizes to maintain an editorial, high-fashion look.
- **Inter** provides a clean, functional counterpoint. It handles all body text, UI labels, and navigation. 
- **The Label Style:** All buttons, categories, and navigation links use `label-caps` or `label-caps-wide`. This uppercase, tracked-out styling is a hallmark of luxury branding and should be strictly adhered to for interactive elements.

## Layout & Spacing

The layout philosophy is defined by **Cinematic Minimalism** and **Large-Scale Verticality**. 

- **Grid Model:** A 12-column fluid grid is used for product galleries and general content, with a significant 32px gutter to ensure elements never feel crowded.
- **Margins:** Large horizontal margins (80px on desktop) create a "frame" for the content, focusing the user's eye on the center of the screen.
- **Vertical Rhythm:** The system uses exceptionally large `section-gap` units (160px) to separate major brand narratives. This "breathing room" is critical to conveying a premium feel.
- **Responsive Behavior:** On mobile, margins compress to 24px, and vertical gaps are reduced to `stack-lg` to maintain momentum while preventing excessive scrolling.

## Elevation & Depth

Visual hierarchy is achieved through **Tonal Layering** and **Motion-based Depth** rather than heavy shadows.

- **Layered Panels:** The design uses a "pinned stacking" approach where full-screen containers slide over one another. Depth is conveyed by the contrast between the `inverse-surface` (dark) and `background-warm` (light) sections.
- **Glassmorphism:** The primary navigation uses a backdrop blur (16px) with a semi-transparent cream background. This creates a "frosted glass" effect that keeps the navigation present without severing the visual connection to the imagery behind it.
- **Refined Shadows:** Where used (such as on primary buttons), shadows should be ambient and diffused—never harsh. Use low-opacity, wide-blur shadows that match the warmth of the background.
- **Image Overlays:** Use subtle dark gradients (40-60% opacity) on images when text is overlaid to ensure the refined typography remains legible without losing the impact of the photography.

## Shapes

The shape language is primarily **Soft** and **Structured**.

- **Containers & Cards:** Product containers and imagery should use a 12px radius (`rounded-xl`) to provide a modern, approachable feel that mimics the curves of high-end furniture.
- **Interactive Elements:** Buttons and tags utilize the `full` (pill-shaped) radius. This provides a clear visual distinction between static content containers and interactive components.
- **Signature Hero Radius:** The bottom edge of the hero header uses a distinct 40px radius to create a dramatic, organic transition into the body content of the page.

## Components

### Buttons & Interaction
- **Primary Buttons:** Pill-shaped with a solid fill (`primary` or `inverse-surface`). Use `label-caps-wide` typography. Implement a "magnetic" hover effect where the button subtly pulls toward the cursor.
- **Secondary Actions:** Ghost buttons with a 1px border and `label-caps` text.

### Product Cards
- **Structure:** Large image container with a 12px radius. Titles are set in `headline-md` (scaled for density) and categories in `label-caps`. 
- **Hover State:** Implement a slow, luxurious scale transform (1.04x) over 0.8s on the image to create a tactile feeling of depth.

### Navigation
- **The Glass Nav:** A fixed top bar that transitions from transparent to a glassmorphic state on scroll. Links use `label-caps` with a 1px bottom border that animates in from the center on hover.

### Interactive Image Accordion
- This is a signature component. Use a horizontal layout where hovering over a panel expands its `flex-basis` from 1 to 4 using a smooth expo-out easing.

### Input Fields & Controls
- **Inputs:** Minimalist with 1px `outline-warm` bottom borders only. Use `body-md` for user input and `label-caps` for floating labels.
- **Chips/Pills:** Pill-shaped with `outline-variant` borders and `label-caps` text. Active states use a `brand-gold` border.