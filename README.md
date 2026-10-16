# Birelle

Next.js (App Router) + Tailwind v4 storefront.

```bash
npm run dev
```

## Folder structure

```
src/
├── app/                      # Routes only — thin pages that compose sections
│   ├── layout.tsx            # <html>, fonts, global CSS, SiteLayout
│   ├── page.tsx              # Home → imports from components/sections/home
│   ├── about/page.tsx
│   └── contact/page.tsx
│
├── components/
│   ├── layout/               # Site chrome rendered on every page
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   └── SiteLayout.tsx
│   ├── providers/            # Client wrappers with no UI (smooth scroll, contexts)
│   │   └── LenisScroll.tsx
│   ├── sections/             # Page sections, one folder per page
│   │   └── home/
│   │       ├── HomeHero.tsx
│   │       └── index.ts      # barrel: export { HomeHero, ... }
│   └── ui/                   # Small reusable building blocks (Button, IconButton, ProductCard…)
│
├── config/                   # Static settings: site.ts (SEO/brand), navigation.ts
├── lib/                      # Framework helpers: seo.ts, fonts.ts
├── types/                    # Shared TS types (Product, SiteRoute…) + global .d.ts
├── styles/
│   ├── globals.css           # Tailwind, tokens, base, layout helpers
│   └── fonts.css             # Font scale, h1–h6, text styles
└── utils/                    # Pure functions (url.ts)
```

Add folders such as `hooks/`, `data/` (static content/mock products) or `services/` (API calls) when the first file needs them.

### Naming

| What | Convention | Example |
| --- | --- | --- |
| Section file | `<Page><Section>.tsx` in `sections/<page>/` | `sections/shop/ShopProductGrid.tsx` |
| Section root | `<section id="page-section" className="page-section …">` | `id="home-hero" className="home-hero"` |
| Inner elements | BEM-style hook class + Tailwind | `home-hero__title`, `home-hero__media` |
| Shared section used on many pages | put in `sections/shared/` | `sections/shared/Newsletter.tsx` |

The BEM hook classes carry no styles; they make DevTools readable and give GSAP stable selectors.

A new page = `app/<route>/page.tsx` + `components/sections/<route>/` + an entry in `config/site.ts` `siteRoutes`.

## Spacing tokens (`globals.css`)

Mobile values, growing at `md` (48rem). Each becomes a Tailwind utility.

| Token | Mobile → Desktop | Use | Utility |
| --- | --- | --- | --- |
| `section` | 4rem → 6rem | vertical padding of a section | `py-section` / `.section` |
| `stack` | 2.5rem → 3.5rem | gap between blocks in a section | `gap-stack`, `mt-stack` |
| `title` | 0.5rem | heading → text | `mb-title` |
| `grid` | 1rem → 1.25rem | product/card grid gap | `gap-grid` |
| `card` | 0.75rem → 1rem | card inner padding | `p-card` |
| `gutter` | 1rem → 2.5rem | page side padding | `px-gutter` / `.container` |
| `header` | 4rem → 4.5rem | header height / offset under it | `h-header`, `pt-header` |

Layout classes: `.container` (max-width 120rem + gutters), `.section`, `.h-screen` (svh), `.center`, `.cover`.
Colors: `ink`, `paper`, `muted`, `line` → `bg-ink`, `text-muted`, `border-line`.

## Typography (`fonts.css`)

| Class / tag | Mobile | ≥750px |
| --- | --- | --- |
| `h1` / `.h1` | 2.5rem | 3.75rem |
| `h2` / `.h2` | 2.25rem | 2.75rem |
| `h3` / `.h3` | 2rem | 2.5rem |
| `h4` / `.h4` | 1.75rem | 2rem |
| `h5` / `.h5` | 1.5rem | 1.75rem |
| `h6` / `.h6` | 1rem | 1.25rem |

Plus `.text-display` (viewport wordmark), `.text-eyebrow`, `.text-body-lg`, `.text-body`, `.text-caption`.
Use classes to decouple look from semantics: `<h2 className="h1">`.

Typical section:

```tsx
<section id="home-featured" className="home-featured section">
  <div className="container">
    <h2 className="mb-title">New in</h2>
    <p className="text-body text-muted">…</p>
    <div className="mt-stack grid grid-cols-2 gap-grid md:grid-cols-4">…</div>
  </div>
</section>
```
