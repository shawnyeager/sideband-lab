# Sideband Lab

Visual projects exploring control, trust, money, and who wins as AI reshapes everything — the lab for [Sideband](https://www.sideband.pub).

**[lab.sideband.pub](https://lab.sideband.pub)**

## Projects

| Project | What it is |
|---------|-----------|
| [Agent-Era Infrastructure Map](https://lab.sideband.pub/map/) | Companies and protocols scored on openness and distribution across five layers of the emerging agent stack |
| [U.S. GDP Status](https://lab.sideband.pub/status/) | A status page for the economy where the components are AI providers and the metric is GDP |
| [Three-Body Problem](https://lab.sideband.pub/three-body-problem/) | A force simulation of the three-way gravitational fight between state regulators, card networks, and open protocols |

## Stack

- **[Astro](https://astro.build)** — static site generator, renders the shell
- **[React](https://react.dev)** — component islands (map)
- **[D3.js](https://d3js.org)** — force simulations, vendored for supply chain integrity
- **[Supabase](https://supabase.com)** — entity scores and layer data
- **[Vercel](https://vercel.com)** — deployment

Projects are framework-agnostic. Each one uses whatever fits — React, vanilla JS, D3, or plain HTML. The Astro shell wraps them with a shared header and meta tags.

## Local development

```bash
git clone https://github.com/shawnyeager/sideband-lab.git
cd sideband-lab
npm install
cp .env.example .env   # fill in Supabase keys if you want live map data
npm run dev
```

The map works without Supabase credentials — it just won't load entity data. The other projects are fully static.

## Adding a project

Each project is a standalone HTML page in `public/[slug]/index.html`, wrapped by an Astro route that injects the shared header and meta tags.

1. Create `src/pages/[slug]/index.astro` — reads the HTML file and injects `projectHeader` + `projectMeta`
2. Create `public/[slug]/index.html` — your project's standalone HTML (must have `<head>` and `<body>` tags)
3. Add an entry to `src/content/projects.json` with `status: "draft"`
4. Add a thumbnail at `src/assets/projects/[slug].png` and an OG image at `public/img/og/[slug].png`
5. Set `status: "live"` when ready

See `CLAUDE.md` for the full scaffolding template and conventions.

## Project structure

```
src/           Source code — components, pages, layouts, styles
public/        Static assets — fonts, images, project HTML
scripts/       CLI tools — screenshot capture, entity scoring
supabase/      Database migrations
```

## Contributing

Issues and PRs are welcome. If you spot a bug, have a data correction for the map, or want to propose a new project idea, [open an issue](https://github.com/shawnyeager/sideband-lab/issues).

## License

[MIT](LICENSE)
