---
title: "feat: Add meta and og:image tags to project pages"
type: feat
status: active
date: 2026-03-01
---

# feat: Add meta and og:image tags to project pages

Project pages currently have no meta description or og:image tags. They bypass `Base.astro` and `SEO.astro` entirely — the Astro route reads raw HTML and returns it as a `Response`. When shared on social media, these pages show no preview image or description.

All the data needed already exists in `src/content/projects.json` (title, description, thumbnail).

## Approach

Create a `projectMeta(project)` helper in `src/lib/header.ts` that generates meta tag HTML from project data. Inject it into `<head>` alongside the existing `fontPreload` injection.

### `src/lib/header.ts` — new export

```ts
export function projectMeta(project: {
  title: string;
  description: string;
  thumbnail: string;
}) {
  const siteUrl = 'https://lab.sideband.pub';
  const pageTitle = `${project.title} | Sideband Lab`;
  const ogImage = `${siteUrl}${project.thumbnail}`;
  return `
<meta name="description" content="${project.description}" />
<meta property="og:type" content="website" />
<meta property="og:title" content="${pageTitle}" />
<meta property="og:description" content="${project.description}" />
<meta property="og:image" content="${ogImage}" />
<meta property="og:site_name" content="Sideband Lab" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${pageTitle}" />
<meta name="twitter:description" content="${project.description}" />
<meta name="twitter:image" content="${ogImage}" />
`;
}
```

### `src/pages/[slug]/index.astro` — updated template

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

## Files to modify

- `src/lib/header.ts` — add `projectMeta()` export
- `src/pages/three-body-problem/index.astro` — import projects.json, look up project, inject meta
- `CLAUDE.md` — update project template to include meta injection

## Also fix

- `src/components/SEO.astro:32` — still preloads old `ZillaSlab-SemiBold.woff2`, should be `RobotoSlab-Bold.woff2`. Also add Lora preload.

## Acceptance Criteria

- [ ] `curl -s http://localhost:4322/three-body-problem/ | grep 'og:image'` returns the thumbnail URL
- [ ] `og:title` includes the project title
- [ ] `og:description` matches the project description from projects.json
- [ ] `twitter:card` is `summary_large_image`
- [ ] Image URL is absolute (`https://lab.sideband.pub/img/projects/...`)
- [ ] Homepage SEO.astro font preloads updated to current fonts
