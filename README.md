# Sideband Lab

Visual projects exploring control, trust, money, and who wins as AI reshapes everything — the lab for [Sideband](https://www.sideband.pub).

**[lab.sideband.pub](https://lab.sideband.pub)**

## Projects

| Project | What it is |
|---------|-----------|
| [The AI market hyperscalers can't reach](https://lab.sideband.pub/cloud-cant-follow/) | Armada raised $230M for modular AI data centers on military bases, oil platforms, and air-gapped sites—a map of how far AI's market extends beyond the cloud |
| [Task complete. Safety violated.](https://lab.sideband.pub/safety-trap/) | 13 production-grade agents run against BeSafe-Bench. None cleared 40% safe task completion, and the best performers were the most dangerous |
| [The return of the computer](https://lab.sideband.pub/return-of-the-computer/) | Infrastructure primitives shrank for three decades—30-minute sessions down to 10ms hops. Agents reversed the curve back to hour-long tasks |
| [Payment Required](https://lab.sideband.pub/http-402/) | x402 routes every agent payment through Coinbase to verify and settle; L402 routes through no one. The protocol decides who can shut your agent off |
| [Agent-Era Infrastructure Map](https://lab.sideband.pub/map/) | Companies and protocols scored on openness and distribution across five layers of the emerging agent stack |
| [U.S. GDP Status](https://lab.sideband.pub/status/) | A status page for the economy where the components are AI providers and the metric is GDP |
| [Three-Body Problem](https://lab.sideband.pub/three-body-problem/) | A force simulation of the three-way gravitational fight between state regulators, card networks, and open protocols |

## Stack

- **[Astro](https://astro.build)** — static site generator, renders the shell
- **[React](https://react.dev)** — component islands (map)
- **[D3.js](https://d3js.org)** — force simulations, vendored for supply chain integrity
- **[Anthropic SDK](https://docs.anthropic.com)** — signal extraction for the map scoring pipeline
- **[Vercel](https://vercel.com)** — deployment

Projects are framework-agnostic. Each one uses whatever fits — React, vanilla JS, D3, or plain HTML. The Astro shell wraps them with a shared header and meta tags.

## Local development

```bash
git clone https://github.com/shawnyeager/sideband-lab.git
cd sideband-lab
npm install
npm run dev
```

Everything is static. You don't need any environment variables to run the site; the map's data is baked into the build from `data/map-data.json`. The only key you'll need is `ANTHROPIC_API_KEY` (see `.env.example`), and only if you want to re-run the map scoring pipeline.

## Adding a project

Each project is a standalone HTML page in `src/projects/[slug].html`, wrapped by an Astro route that extracts its `<head>`/`<body>` and re-injects them inside the shared shell.

1. Create `src/pages/[slug]/index.astro` — reads `src/projects/[slug].html` and renders it through the `Project` layout
2. Create `src/projects/[slug].html` — your project's standalone HTML (must have `<head>` and `<body>` tags)
3. Add an entry to `src/content/projects.json` with `status: "draft"`
4. Add a thumbnail at `src/assets/projects/[slug].png` and an OG image at `public/img/og/[slug].png`
5. Put any static assets the project references (JS, fonts, images) in `public/[slug]/`
6. Set `status: "live"` when ready

`docs/new-project-checklist.md` is the single source of truth for the full process — file structure, `projects.json` fields, CSS conventions, voice rules, image attributes, and the build verification one-liner. `CLAUDE.md` summarizes the conventions.

## Project structure

```
src/           Source code — components, pages, layouts, styles, project HTML
public/        Static assets — fonts, images, per-project assets
scripts/       CLI tools — screenshot capture, map scoring, OG capture
data/          Map data and scores (map-data.json)
docs/          New-project checklist and conventions
```

## Map scoring

Entity scores are computed deterministically from structured signals. An LLM reads source material and extracts factual signals (license type, governance model, operator count, etc.) — it never picks a score. A weighted formula then computes the 0-100 position on each axis from those signals.

**X-axis** (Closed → Open): `spec_license`, `governance`, `permission_required`, `independent_implementations`, `fork_modify_allowed`, `tos_restrictions`

**Y-axis** (Centralized → Distributed): `deployment_model`, `operator_count`, `single_point_of_failure`, `self_hostable`, `works_offline`, `central_coordination_required`

Same evidence in, same score out. Each score is auditable: you can trace exactly which signal contributed how many points and what source text supported it. Signal definitions and weights live in `scripts/score-entities.mjs`; the scored entities live in `data/map-data.json`.

## Contributing

Issues and PRs are welcome. If you spot a bug, have a data correction for the map, or want to propose a new project idea, [open an issue](https://github.com/shawnyeager/sideband-lab/issues).

## License

[MIT](LICENSE)
