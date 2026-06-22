---
name: Timeless Atelier
colors:
  surface: '#fff8f3'
  surface-dim: '#e3d8cb'
  surface-bright: '#fff8f3'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#fdf2e4'
  surface-container: '#f7ecdf'
  surface-container-high: '#f2e7d9'
  surface-container-highest: '#ece1d3'
  on-surface: '#201b13'
  on-surface-variant: '#564337'
  inverse-surface: '#353027'
  inverse-on-surface: '#faefe1'
  outline: '#897265'
  outline-variant: '#ddc1b1'
  surface-tint: '#964900'
  primary: '#964900'
  on-primary: '#ffffff'
  primary-container: '#f08128'
  on-primary-container: '#592800'
  inverse-primary: '#ffb787'
  secondary: '#5f5e5e'
  on-secondary: '#ffffff'
  secondary-container: '#e2dfde'
  on-secondary-container: '#636262'
  tertiary: '#5e5f5c'
  on-tertiary: '#ffffff'
  tertiary-container: '#9f9f9c'
  on-tertiary-container: '#353634'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdcc7'
  primary-fixed-dim: '#ffb787'
  on-primary-fixed: '#311300'
  on-primary-fixed-variant: '#723600'
  secondary-fixed: '#e5e2e1'
  secondary-fixed-dim: '#c8c6c5'
  on-secondary-fixed: '#1c1b1b'
  on-secondary-fixed-variant: '#474746'
  tertiary-fixed: '#e3e2df'
  tertiary-fixed-dim: '#c7c7c3'
  on-tertiary-fixed: '#1b1c1a'
  on-tertiary-fixed-variant: '#464744'
  background: '#fff8f3'
  on-background: '#201b13'
  surface-variant: '#ece1d3'
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
  margin-desktop: 80px
  margin-mobile: 24px
  gutter: 32px
  section-gap: 160px
  stack-sm: 8px
  stack-md: 24px
  stack-lg: 48px
---

## Brand & Style

The design system embodies the essence of high-end European furniture craftsmanship—where heritage meets modern sophistication. The aesthetic is rooted in **Minimalism** with a heavy influence from **Editorial Design**, prioritizing whitespace as a luxury commodity. 

The emotional response should be one of "quiet luxury": confident, warm, and exclusive. We avoid loud digital trends in favor of timeless layouts that allow the photography of materials—velvet grains, wood marbling, and leather patinas—to serve as the primary visual texture. The experience should feel like flipping through a high-production architectural digest, where every element is intentional and balanced.

## Colors

The palette is anchored by a warm, architectural foundation. The **Signature Orange** (#F08128), extracted from the brand's identity, is a "high-heat" accent. It must be used with surgical precision—reserved for primary calls to action, focus states, or subtle brand identifiers to maintain its impact without overwhelming the sophisticated mood.

**Cream/Ivory** (#FDFCF8) serves as the canvas, providing a softer, more inviting alternative to pure white, reminiscent of high-quality stationary. **Deep Charcoal/Onyx** (#1A1A1A) provides the structural weight for typography and borders, while a muted **Taupe Neutral** (#7A7267) handles secondary information and Dividers.

## Typography

This design system utilizes a high-contrast typographic pairing to establish an editorial hierarchy. **Playfair Display** provides the romantic, serif soul of the brand—used for large-scale storytelling and product titles. Its elegant ligatures and variable weights should be leveraged for a bespoke feel.

**Inter** acts as the functional counterpart. Its neutral, high-legibility character ensures that technical furniture specifications and navigation remain clear. We utilize an uppercase label style for metadata and small headers to evoke the feel of museum curation tags.

## Layout & Spacing

The layout philosophy follows a **Fixed Editorial Grid** (12 columns for desktop, 4 for mobile). We prioritize verticality and "breathing room." Section gaps are intentionally large (160px+) to ensure that distinct furniture collections do not visually bleed into one another.

On mobile, margins are tightened but typography remains generous. High-end photography should frequently break the grid or utilize "full-bleed" treatments to create a cinematic rhythm. Elements should often be center-aligned to maintain a sense of formal balance and symmetry.

## Elevation & Depth

To maintain a timeless feel, we avoid traditional drop shadows. Depth is instead conveyed through **Tonal Layering** and **Harsh Overlays**. 

- **Surface Levels:** The base is always the Warm Ivory. Overlays (such as Quick View modals) utilize the same color but are defined by a crisp 1px Deep Charcoal border rather than a shadow.
- **Glassmorphism:** A subtle backdrop blur (8px-12px) may be used on navigation bars when scrolling over high-detail photography to maintain legibility without losing the visual context of the image.
- **Interaction:** Depth is suggested through scale; on hover, product cards may subtly scale up (1.02x) rather than casting a shadow.

## Shapes

The shape language is strictly **Sharp (0)**. In luxury design, right angles denote precision, architectural stability, and a premium "no-default" look. 

All buttons, image containers, and input fields must have 0px border-radii. This geometric rigor creates a frame-like quality for the photography, treating every UI element as if it were a window into a high-end showroom.

## Components

### Buttons
Primary buttons are rectangular with a solid Deep Charcoal background and white text. Secondary buttons use a "Ghost" style: a 1px Charcoal border with no fill. The Signature Orange is reserved for the "Add to Collection" or "Purchase" final action.

### Input Fields
Minimalist underlines (1px) are preferred over full boxes for text inputs. Labels use the `label-caps` typography style and are positioned above the line.

### Cards
Product cards are borderless. The focus is entirely on the image, which should have a slight zoom-on-hover effect. Pricing and titles are center-aligned beneath the image using a combination of serif headings and sans-serif labels.

### Chips & Tags
Used sparingly for material types (e.g., "Italian Leather"). These should be styled as text-only with a leading dot in Signature Orange to draw the eye without adding bulk to the UI.

### Navigation
The navigation bar is minimal and transparent, transitioning to a soft Ivory blur upon scroll. Links are set in uppercase sans-serif with a tracking of 0.1em.