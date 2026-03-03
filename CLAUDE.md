# Sideband Lab

Interactive projects that accompany the Sideband newsletter (sideband.pub).
Hosted at lab.sideband.pub.

## Stack
- Astro (static site generator)
- Deployed to Vercel
- No framework mandate per-project (use React, Svelte, D3, vanilla JS — whatever fits)

## Brand
- Page background: cream #EEEBE4
- Primary accent: cyan #0EA5C9
- Secondary accent: amber #A97C40
- Text: #393a3a, muted: #6b6966, subtle: #9a9793
- Display font: Roboto Slab Bold 700 (letter-spacing: 0.01em) — matches sideband.pub
- Body font: Lora (serif) — matches sideband.pub
- UI/label font: Space Grotesk (sans-serif)
- Fonts are self-hosted in /public/fonts/
- Header: full-width bleed, 56px tall (44px mobile), 28px icon, 1px solid #D6D4CD border-bottom

## Adding a new project

When the user wants to add a new project (e.g. "add a project called X"), scaffold it automatically:

### 1. Create the Astro page route

Create `src/pages/[slug]/index.astro` with this exact template:

```astro
---
import fs from 'node:fs';
import path from 'node:path';
import { projectHeader, fontPreload, projectMeta } from '../../lib/header';
import projects from '../../content/projects.json';

const project = projects.find(p => p.slug === '[slug]');
const meta = project ? projectMeta(project) : '';

const htmlPath = path.resolve('public/[slug]/index.html');
let html = fs.readFileSync(htmlPath, 'utf-8');
html = html.replace(/<head([^>]*)>/, `<head$1>${fontPreload}${meta}`);
html = html.replace(/<body([^>]*)>/, `<body$1>${projectHeader}`);

return new Response(html, {
  headers: { 'content-type': 'text/html; charset=utf-8' }
});
---
```

Replace `[slug]` with the actual slug in both the `find()` and `path.resolve()` calls.

### 2. Create `public/[slug]/` directory

The user will add their standalone `index.html` here. It must have `<head>` and `<body>` tags (the Astro route injects font preloads into head and the fixed header into body).

Project HTML should follow these conventions (see `public/three-body-problem/index.html` as reference):
- Reading column: max-width 728px, centered via `margin-left: auto; margin-right: auto`. Applies to h1, subtitle, body text, accordions, HRs, and footer credit line. Charts/visuals can be wider (940px).
- Type scale for 728px column: body 20px, subtitle 20px, detail-summary 16px, detail-body 15px, footer 14px. h1 stays 34px.
- Footer: left-aligned credit line within the 728px centered column. No subscribe CTA on project pages.
- Fonts injected by projectHeader: Roboto Slab for h1-h4, Lora for body, Space Grotesk for UI. Raw HTML pages don't get global.css — projectHeader handles font loading and overrides.
- All `<img>` tags must have `alt`, `width`, `height`, and `loading` attributes. All icon-only `<a>` tags must have `aria-label`.

### 3. Add entry to `src/content/projects.json`

```json
{
  "slug": "[slug]",
  "title": "...",
  "description": "...",
  "date": "YYYY-MM-DD",
  "thumbnail": "[slug]",
  "ogImage": "/img/og/[slug].png",
  "status": "draft"
}
```

- `thumbnail`: Just the slug name (no path, no extension). Must match a file at `src/assets/projects/[slug].png`. Used by the homepage card via Astro's `<Image>` component for build-time optimization.
- `ogImage`: Full path relative to `public/`. Must be a real file at `public/img/og/[slug].png`. Used for Open Graph / Twitter Card meta tags — social crawlers fetch this directly, so it must be a static file in `public/`.

Optional fields: `substackUrl`, `substackTitle` (shown on the card as a link).

Set status to `"draft"` initially. The homepage only shows `"live"` projects (filtered by `getActiveProjects()` in `src/lib/utils.ts`). Change to `"live"` once the HTML, thumbnail, and OG image are in place.

### 4. Add images

Two image files are required per project:

1. **Thumbnail** — `src/assets/projects/[slug].png`
   Used on the homepage card. Processed by Astro's `<Image>` component (converted to webp, resized). Should be a high-quality screenshot or preview of the project.

2. **OG image** — `public/img/og/[slug].png`
   Used for social sharing previews (Open Graph, Twitter Cards). Must be in `public/` so social crawlers can fetch it directly. Recommended: 1200x630px. Can be the same image as the thumbnail or a custom social card.

### 5. Tell the user what's done and what's still needed

After scaffolding, report what was created and what the user still needs to provide (the actual project HTML and thumbnail image).

## Pre-push checklist

**MANDATORY before every push.** Do not push if any item fails.

### For new projects:
- [ ] `src/pages/[slug]/index.astro` exists and injects `projectHeader` + `projectMeta`
- [ ] `public/[slug]/index.html` exists with `<head>` and `<body>` tags
- [ ] `src/content/projects.json` entry has ALL required fields: `slug`, `title`, `description`, `date`, `thumbnail`, `ogImage`, `status`
- [ ] Thumbnail exists at `src/assets/projects/[slug].png`
- [ ] OG image exists at `public/img/og/[slug].png`
- [ ] `npm run build` succeeds with zero errors

### For all pushes:
- [ ] `npm run build` succeeds with zero errors
- [ ] No broken OG image paths — verify `projectMeta()` output resolves to real files
- [ ] Every `<img>` has `alt`, `width`, `height`, and `loading` attributes (`eager` for above-fold, `lazy` for below)
- [ ] Every icon-only `<a>` has `aria-label`; every SVG inside a link has `aria-hidden="true"`
- [ ] All images in `src/assets/` that are referenced by `projects.json` exist
- [ ] All images in `public/img/og/` that are referenced by `projects.json` exist
- [ ] Astro dev toolbar audit shows zero accessibility and zero performance issues

## Conventions
- No decorative elements. If it doesn't carry meaning, it doesn't belong.
- Every project links back to its companion Substack post.
- Projects own their content area. The shell (header/footer) is shared.
- Page background matches sideband.pub: cream (#EEEBE4). Header is always cream. Projects own their content canvas (dark visualizations are fine as islands within cream).

## Image rules

Every `<img>` tag — whether in Astro components, raw HTML project pages, or template strings like `header.ts` — must have:
- `alt` — descriptive text (or `alt=""` for purely decorative images)
- `width` and `height` — explicit dimensions to prevent layout shift
- `loading` — `"eager"` for above-the-fold (header icon, hero images), `"lazy"` for everything else

For icon-only links (`<a>` containing only an SVG or image with no visible text):
- The `<a>` must have `aria-label` describing the link destination
- Any `<svg>` inside must have `aria-hidden="true"`

Use Astro's `<Image>` component (`astro:assets`) for images in `.astro` files — it handles format conversion, responsive sizing, and attribute generation. Raw `<img>` tags are only for injected HTML strings (e.g. `projectHeader` in `header.ts`) and standalone project HTML in `public/`.
