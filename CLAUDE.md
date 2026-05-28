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

**Every new project must pass every rule in [docs/new-project-checklist.md](docs/new-project-checklist.md) before it ships.** That file is the single source of truth — file structure, projects.json fields, CSS conventions, voice rules, image dimensions, image attributes, SEO/schema, build verification, flip-to-live. Run the quick verification one-liner at the bottom of the checklist before commit.

When the user asks to add a project (e.g. "add a project called X"), scaffold it automatically by following the checklist sections 1-3 (page route, project HTML, projects.json entry), then generate the images with `scripts/capture-og.sh [slug]` (section 5), then run the verification one-liner (section "Quick verification").

The canonical reference for a well-formed project is `src/projects/http-402.html`. When in doubt, compare your new project against that one.

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
