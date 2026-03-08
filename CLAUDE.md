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

### 4. Generate preview images with Puppeteer

Two image files are required per project. **Generate them automatically** — do not ask the user to provide them.

Prerequisites: the project HTML must be in place and the dev server running at `localhost:4321`.

Use Puppeteer (available via `require('puppeteer')`) to capture screenshots. Run as a `node -e "..."` bash command. Template:

```javascript
const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 900, deviceScaleFactor: 2 });
  await page.goto('http://localhost:4321/[slug]/', { waitUntil: 'networkidle0' });

  // If the page has animations, wait for a completion indicator:
  // await page.waitForSelector('.done-indicator', { timeout: 60000 });

  // Clean up for capture
  await page.evaluate(() => {
    // Hide site header
    const header = document.querySelector('#site-header');
    if (header) header.style.display = 'none';
    document.body.style.paddingTop = '0';
    // Set body background to match the visualization background (no cream bleed)
    document.body.style.background = '#1D2733';
  });

  // THUMBNAIL — element screenshot of the main visualization
  // Find the primary visual element (chart, canvas, visualization container)
  const viz = await page.$('.primary-visual-selector');
  await viz.screenshot({ path: 'src/assets/projects/[slug].png', type: 'png' });

  // OG IMAGE — 1200:630 aspect ratio crop of the visualization
  // For tall elements, clip to the most informative portion
  const box = await viz.boundingBox();
  const clipHeight = Math.min(box.height, (630 / 1200) * box.width);
  await page.screenshot({
    path: 'public/img/og/[slug].png',
    type: 'png',
    clip: { x: box.x, y: box.y, width: box.width, height: clipHeight }
  });

  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
```

Key rules:
- `deviceScaleFactor: 2` always — retina-quality captures
- Hide the site header and set `body.background` to the visualization's background color so no cream bleeds at edges
- Remove `border-radius` on the captured element if it has rounded corners
- For animated pages, wait for the completion state before capturing
- For tall visualizations that don't fit 1200:630, collapse expandable content (accordions, detail blocks) before the OG capture
- Verify both images look correct by reading them with the Read tool after generation

### 5. Flip to live

Once images are generated and verified:
1. Change `"status": "draft"` to `"status": "live"` in `projects.json`
2. Run `npm run build` to verify zero errors
3. Report what was created

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
- **No hardcoded values in CSS.** Use design tokens from `global.css` (`--space-*`, `--text`, `--text-muted`, `--font-display`, etc.). If a token doesn't exist, create one. Never inline magic numbers for spacing, colors, or font sizes when a variable exists or should exist.

## Image rules

Every `<img>` tag — whether in Astro components, raw HTML project pages, or template strings like `header.ts` — must have:
- `alt` — descriptive text (or `alt=""` for purely decorative images)
- `width` and `height` — explicit dimensions to prevent layout shift
- `loading` — `"eager"` for above-the-fold (header icon, hero images), `"lazy"` for everything else

For icon-only links (`<a>` containing only an SVG or image with no visible text):
- The `<a>` must have `aria-label` describing the link destination
- Any `<svg>` inside must have `aria-hidden="true"`

Use Astro's `<Image>` component (`astro:assets`) for images in `.astro` files — it handles format conversion, responsive sizing, and attribute generation. Raw `<img>` tags are only for injected HTML strings (e.g. `projectHeader` in `header.ts`) and standalone project HTML in `public/`.

## Design Context

### Users
Founders, builders, and investors following AI infrastructure shifts. They know what an API is, what Lightning is, what a stablecoin is. They arrive from the Sideband newsletter (sideband.pub) and want to see an idea made tangible — not explained from scratch.

### Brand Personality
**Sharp, curious, structural.** The lab maps territory. It finds patterns in complex systems and makes them visible. No sales pitch, no thought-leadership posturing, no decoration for its own sake.

### Voice Rules

**Read `VOICE.md` (symlinked in project root) before writing any copy.** It is the canonical voice reference for all Sideband writing.

Key rules for project copy (titles, subtitles, descriptions in `projects.json`):
- Em dashes have **no spaces**: `word—word` not `word — word`
- No format-describing copy ("An interactive comparison of..."). Lead with the insight or tension, not the container.
- No CTAs or reader-addressing ("See how...", "Try this..."). State claims directly.
- No hedging ("I think", "arguably", "it seems").
- All featured copy must pass the humanizer skill before committing. No AI slop.
- Match the register of existing descriptions: short, punchy, specific. State what the project reveals, not what it is.

### Emotional Goals
- **Clarity.** The visitor sees something they didn't see before. Complexity resolved, not simplified.
- **Respect.** The work assumes intelligence. No hand-holding, no dumbing down, no explainers for things the audience knows.
- **Curiosity.** The visitor wants to explore further and share what they found.

### Aesthetic Direction
- **Reference:** Pudding.cool — visual essays that explain through interaction, not decoration. Each project earns its format.
- **Anti-references:** Startup marketing (gradient blobs, hero illustrations, "Schedule a demo" energy). Dashboard SaaS (dense grids, metric tiles, sidebar navs).
- **Theme:** Cream background (#EEEBE4) with dark visualization islands (#1D2733). The shell is warm and quiet. The visualizations are dense and precise. Contrast between the two is deliberate — the data lives in a different register than the prose.
- **Mode:** Light only. No dark mode. The cream background is the brand.

### Design Principles
1. **No decoration.** If it doesn't carry meaning, it doesn't belong. Every visual element must earn its place by making something clearer.
2. **Interaction over illustration.** Show the system working, not a picture of the system. Animated sequences, force simulations, explorable data — not static infographics.
3. **The visualization is the argument.** The prose frames it, the data proves it. If the visualization doesn't change what the reader understands, it failed.
4. **Respect the reader's time.** Fast load, immediate clarity, no preamble. The project should communicate its thesis within seconds of the first scroll.
5. **Each project owns its tools.** No framework mandate. Use D3, React, Svelte, vanilla JS, WebGL — whatever the visualization demands. The shell is shared; the content is sovereign.
