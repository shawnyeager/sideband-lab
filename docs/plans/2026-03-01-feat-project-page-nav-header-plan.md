---
title: Add navigation header to project pages
type: feat
status: active
date: 2026-03-01
---

# Add navigation header to project pages

Project pages like `/three-body-problem/` serve raw HTML via `Response()` in Astro's frontmatter, bypassing the Base layout entirely. Users land on a project page with zero navigation — no way to get back to the homepage or to sideband.pub.

## Solution

Inject a minimal header HTML string into the raw HTML before serving it. The Astro page at `src/pages/three-body-problem/index.astro` already reads the HTML file and returns a `Response` — insert a nav snippet after `<body>`.

### Header design

A thin fixed bar at the top — same pattern as sideband.pub. Cream background (`#eeebe4`) matching the project page's `--site-bg`. Contains:
- Left: "Sideband Lab" brand link → `/`
- Right: "← sideband.pub" back link → `https://sideband.pub`

Self-contained CSS (inline `<style>` block) so it doesn't conflict with the project's own styles. Uses the project page's own font stack (Inter) rather than importing Zilla Slab/Space Grotesk just for a nav bar.

### Implementation

Create a shared nav snippet as a string constant in `src/lib/project-nav.ts`:

```ts
export const projectNav = `
<style>
  .lab-nav { position:sticky; top:0; z-index:1000; display:flex; align-items:center; justify-content:space-between; padding:12px 24px; background:#eeebe4; border-bottom:1px solid #d5d2cb; font-family:Inter,system-ui,sans-serif; font-size:14px; }
  .lab-nav a { color:#393a3a; text-decoration:none; }
  .lab-nav a:hover { color:#0ea5c9; }
  .lab-nav__brand { font-weight:600; letter-spacing:0.01em; }
  .lab-nav__back { color:#6b6966; }
</style>
<nav class="lab-nav">
  <a href="/" class="lab-nav__brand">Sideband Lab</a>
  <a href="https://sideband.pub" class="lab-nav__back">← sideband.pub</a>
</nav>
`;
```

Then in `src/pages/three-body-problem/index.astro`:

```astro
---
import fs from 'node:fs';
import path from 'node:path';
import { projectNav } from '../../lib/project-nav';

const htmlPath = path.resolve('public/three-body-problem/index.html');
let html = fs.readFileSync(htmlPath, 'utf-8');
html = html.replace('<body', '<body' ).replace(/<body([^>]*)>/, `<body$1>${projectNav}`);

return new Response(html, {
  headers: { 'content-type': 'text/html; charset=utf-8' }
});
---
```

## Acceptance Criteria

- [ ] `/three-body-problem/` shows a sticky nav bar at the top
- [ ] "Sideband Lab" links to `/` (homepage)
- [ ] "← sideband.pub" links to `https://sideband.pub`
- [ ] Nav bar matches cream palette (`#eeebe4` bg, `#393a3a` text, `#d5d2cb` border)
- [ ] Nav doesn't interfere with chart page layout or scrolling
- [ ] Pattern is reusable for future raw-HTML project pages
- [ ] `npx astro build` clean
