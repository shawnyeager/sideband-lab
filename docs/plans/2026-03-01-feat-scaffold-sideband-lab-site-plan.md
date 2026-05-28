---
title: "feat: Scaffold Sideband Lab Site"
type: feat
status: active
date: 2026-03-01
---

# Scaffold lab.sideband.pub — Astro Site

Build the initial Sideband Lab site from scratch: Astro project with shared shell (header/footer), hub page with project card grid, and one project page stub. Deployed to Vercel at `lab.sideband.pub`.

Source spec: `~/Downloads/lab-architecture.md`

## Overview

Sideband Lab is a companion site to the Sideband newsletter (`sideband.pub`). It hosts interactive projects — D3 visualizations, prototypes, whatever fits — each as a route under a single Astro site. The site ships zero JS by default and uses Astro islands for per-project interactivity.

The MVP is:
1. Astro project with shared shell (Base layout, Header, Footer)
2. Hub page with one card
3. One project page (payment-flows stub)
4. Brand tokens, self-hosted fonts, and all config
5. CLAUDE.md for future Claude Code sessions

## Design Decisions (defaults from spec gaps)

These were not explicitly specified in the architecture doc. Defaults chosen here; override if needed.

| Decision | Default | Rationale |
|---|---|---|
| Header mark links to hub | Yes, `/` | Only way back to hub from project pages |
| `status` filtering | Only `"live"` entries render on hub; non-live pages still accessible by URL | Enables draft previews via Vercel preview URLs |
| Card sort order | Reverse chronological by `date` | Newest work first |
| Page title template | `[Title] \| Sideband Lab` (hub: `Sideband Lab`) | Standard SEO pattern |
| `font-display` | `swap` + `<link rel="preload">` | Avoids FOIT; preload minimizes FOUT |
| Responsive grid | `auto-fill, minmax(300px, 1fr)` | Auto-adapts without explicit breakpoints |
| 404 page | Branded, links back to hub | Essential for any site |
| Thumbnail fallback | CSS fallback (navy block + title) when image missing | No broken image icons |
| Substack CTA | Iframe embed | Most common pattern; easy to swap later |
| Preview deploy SEO | `noindex` on non-production (`VERCEL_ENV`) | Prevents duplicate content indexing |
| Amber text on navy | Use `--amber-light` (#C9A050) for body text, `--amber` for large text only | Amber (#A97C40) fails WCAG AA at body size (~3.5:1) |
| Canonical URLs | Set `canonical` to production URL | Prevents preview URL indexing |

## Technical Approach

### Architecture

Single Astro project. Static output. No SSR. Deployed to Vercel via Git integration.

```
src/
├── layouts/Base.astro          # Shell: <head>, header, footer
├── components/
│   ├── Header.astro            # Mark + "Sideband Lab" + newsletter link
│   ├── Footer.astro            # Subscribe CTA + attribution
│   ├── SubscribeCTA.astro      # Substack iframe embed
│   ├── ProjectCard.astro       # Card for hub grid
│   └── SEO.astro               # OG/meta tags component
├── styles/global.css           # Tokens, reset, typography, @font-face
├── content/projects.json       # Project registry
├── pages/
│   ├── index.astro             # Hub page (card grid)
│   ├── 404.astro               # Branded 404
│   └── payment-flows/
│       └── index.astro         # First project stub
└── lib/
    └── utils.ts                # Date formatting, project filtering
```

### Implementation Phases

#### Phase 1: Project Scaffolding

Set up the Astro project, tooling, and configuration files.

**Tasks:**
- [x] Initialize Astro project (`npm create astro@latest`) — `astro.config.mjs`
- [x] Configure `tsconfig.json` with strict mode
- [x] Create `.gitignore` (node_modules, dist, .vercel, .astro)
- [x] Add CLAUDE.md to repo root (per spec)
- [x] Create directory structure: `src/layouts/`, `src/components/`, `src/styles/`, `src/content/`, `src/lib/`, `src/pages/`

**Files created:**
- `package.json`
- `astro.config.mjs`
- `tsconfig.json`
- `.gitignore`
- `CLAUDE.md`

**Success criteria:** `npm run dev` starts without errors, blank page renders.

#### Phase 2: Design Tokens & Typography

Establish the visual foundation.

**Tasks:**
- [x] Create `src/styles/global.css` with CSS custom properties (all tokens from spec)
- [x] Add CSS reset (minimal — box-sizing, margin, list-style)
- [x] Download and add self-hosted fonts to `public/fonts/`:
  - `ZillaSlab-SemiBold.woff2` (from Google Fonts CDN, converted or downloaded directly)
  - `SpaceGrotesk-Variable.woff2`
- [x] Write `@font-face` declarations with `font-display: swap`
- [x] Define system font fallback stacks with similar metrics
- [x] Add base typography styles (body, headings, links, code)

**Files created/modified:**
- `src/styles/global.css`
- `public/fonts/ZillaSlab-SemiBold.woff2`
- `public/fonts/SpaceGrotesk-Variable.woff2`

**Success criteria:** Text renders in correct fonts on dev server. No FOIT. Tokens available via `var(--token)`.

#### Phase 3: Shared Shell (Base Layout)

Build the wrapper every page uses.

**Tasks:**
- [x] Create `src/components/SEO.astro` — accepts `title`, `description`, `ogImage`, `canonicalUrl` props; renders `<meta>` and OG tags; uses title template `[Title] | Sideband Lab`; adds `noindex` when `VERCEL_ENV !== 'production'`
- [x] Create `src/components/Header.astro` — Sideband mark SVG (small) + "Sideband Lab" text linking to `/`; right side: "← Newsletter" linking to `https://sideband.pub`
- [x] Create `src/components/SubscribeCTA.astro` — Substack subscribe iframe embed (lazy-loaded)
- [x] Create `src/components/Footer.astro` — uses SubscribeCTA; attribution line: "Part of Sideband — a publication about AI agents, control, trust, and money."; link to sideband.pub
- [x] Create `src/layouts/Base.astro` — imports global.css; uses SEO, Header, Footer; wraps `<slot />` in `<main>`; preloads fonts via `<link rel="preload">`
- [x] Add Sideband mark SVG to `public/img/sideband-mark.svg`
- [x] Add `public/favicon.svg`

**Files created:**
- `src/components/SEO.astro`
- `src/components/Header.astro`
- `src/components/Footer.astro`
- `src/components/SubscribeCTA.astro`
- `src/layouts/Base.astro`
- `public/img/sideband-mark.svg`
- `public/favicon.svg`

**Success criteria:** Any page using `<Base>` gets consistent header, footer, correct meta tags, fonts preloaded.

#### Phase 4: Hub Page

Build the index page with project card grid.

**Tasks:**
- [x] Create `src/content/projects.json` with one entry (payment-flows, status: "live")
- [x] Create `src/lib/utils.ts` — `getActiveProjects()`: filters by `status === "live"`, sorts by date descending; `formatDate(dateStr)`: renders as "March 2026" format
- [x] Create `src/components/ProjectCard.astro` — thumbnail with CSS fallback; title in Zilla Slab; one-line description in Space Grotesk; date; "From: [Post Title]" link to Substack post (using `--amber-light` for link color); entire card links to `/[slug]`
- [x] Create `src/pages/index.astro` — uses Base layout; imports projects.json; filters/sorts via utils; renders CSS Grid of ProjectCards; handles empty state ("Projects coming soon.")

**Files created:**
- `src/content/projects.json`
- `src/lib/utils.ts`
- `src/components/ProjectCard.astro`
- `src/pages/index.astro`

**Success criteria:** Hub renders card grid. Cards link to correct project URLs. Empty state renders gracefully. Grid is responsive.

#### Phase 5: Project Page & 404

Build the first project page and the error page.

**Tasks:**
- [x] Create `src/pages/payment-flows/index.astro` — uses Base layout with title/description/ogImage props; project header with title + meta line ("March 2026 · From: [Post Title]"); empty `project-canvas` div with `min-height: 60vh`; project-notes section with placeholder text; follows pattern from spec exactly
- [x] Create `src/pages/404.astro` — uses Base layout; branded message ("This project doesn't exist yet."); link back to hub
- [x] Add placeholder thumbnail `public/img/projects/payment-flows.png` (can be a solid branded placeholder)
- [x] Add `public/img/og-default.png` (1200x630, branded fallback)

**Files created:**
- `src/pages/payment-flows/index.astro`
- `src/pages/404.astro`
- `public/img/projects/payment-flows.png`
- `public/img/og-default.png`

**Success criteria:** Payment flows page renders with correct shell. 404 page renders for invalid routes. OG images resolve correctly.

#### Phase 6: Build Verification & Deploy Config

Ensure the site builds cleanly and is deploy-ready.

**Tasks:**
- [x] Run `npm run build` and verify clean output in `dist/`
- [x] Verify all pages render correctly in production build (`npm run preview`)
- [x] Check font loading (preload, swap, no FOIT)
- [x] Verify OG tags render correctly (check page source)
- [x] Verify responsive layout at mobile/tablet/desktop widths
- [x] Verify color contrast: amber-light on navy passes AA
- [x] Verify header mark links to hub from project pages
- [x] Verify 404 page renders for bad routes
- [ ] Commit all work

**Success criteria:** `npm run build` exits 0. All pages render correctly. Site is ready for Vercel deployment.

## Acceptance Criteria

### Functional Requirements

- [ ] Hub page renders project cards from `projects.json`
- [ ] Cards display: thumbnail (with fallback), title, description, date, companion post link
- [ ] Cards link to `/[slug]` routes
- [ ] Only `status: "live"` projects appear on hub
- [ ] Hub handles empty state gracefully
- [ ] Project pages use Base layout with correct OG tags
- [ ] Header: mark + "Sideband Lab" link to `/`, "← Newsletter" links to sideband.pub
- [ ] Footer: Substack subscribe CTA + attribution + sideband.pub link
- [ ] 404 page renders for unknown routes
- [ ] Fonts self-hosted, preloaded, render correctly

### Non-Functional Requirements

- [ ] Zero JavaScript on hub page (Astro static)
- [ ] WCAG AA color contrast for all text
- [ ] Responsive: single column mobile, multi-column desktop
- [ ] `font-display: swap` with preload to minimize FOUT
- [ ] Preview deploys get `noindex` meta
- [ ] Page titles follow `[Title] | Sideband Lab` pattern
- [ ] Clean `npm run build` with no warnings

## Dependencies & Prerequisites

- **Fonts**: Need to source woff2 files for Zilla Slab SemiBold and Space Grotesk Variable
- **Brand assets**: Need Sideband mark SVG, favicon SVG, and a default OG image (1200x630)
- **Substack embed**: Need the specific Substack publication URL for the subscribe widget (likely `sideband.pub` / `sideband.substack.com`)
- **DNS**: CNAME record `lab` → `cname.vercel-dns.com` (not part of this plan — done at registrar)
- **Vercel**: Project creation and domain configuration (post-deploy step)

## References

- Architecture spec: `~/Downloads/lab-architecture.md`
- Astro docs: https://docs.astro.build
- Vercel Astro deployment: https://docs.astro.build/en/guides/deploy/vercel/
- Substack embed: https://substack.com/embed
