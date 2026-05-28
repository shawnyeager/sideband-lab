# New Project Checklist

Every new project on lab.sideband.pub must pass every item in this checklist before it ships. Run the verification command in each row — if it fails, the project doesn't ship.

This document is the single source of truth. If a rule changes, update it here, then update `CLAUDE.md` to match.

---

## 1. File structure

| # | Rule | Verification |
|---|------|-------------|
| 1.1 | Page route exists at `src/pages/[slug]/index.astro` using the standard Project layout template | `test -f src/pages/[slug]/index.astro && grep -q "Project slug=" src/pages/[slug]/index.astro` |
| 1.2 | Project HTML at `src/projects/[slug].html`, NOT `public/[slug]/index.html` (that path collides with the page route) | `test -f src/projects/[slug].html && ! test -f public/[slug]/index.html` |
| 1.3 | `<head>` and `<body>` tags present in the project HTML (the route extracts and re-injects them) | `grep -q '<head' src/projects/[slug].html && grep -q '<body' src/projects/[slug].html` |
| 1.4 | Static asset files (JS, fonts, images referenced by the project HTML) live in `public/[slug]/` | `[ ! -d public/[slug] ] || find public/[slug] -type f \| head` |
| 1.5 | `projects.json` entry has every required field | See section 2 |

---

## 2. `src/content/projects.json` entry

Required fields:

| Field | Type | Example | Notes |
|---|------|---------|-------|
| `slug` | string | `"safety-trap"` | URL slug, kebab-case |
| `title` | string | `"Task complete. Safety violated."` | Page heading. Voice rules apply (section 4). |
| `description` | string | `"BeSafe-Bench tested 13 production-grade agents..."` | Used in homepage card, OG meta, social cards. 1-3 sentences. |
| `date` | string | `"2026-05-27"` | ISO date. Used for sort order and byline. |
| `thumbnail` | string | `"safety-trap"` | Bare slug name (no extension). Must match a file at `src/assets/projects/[slug].png`. |
| `ogImage` | string | `"/img/og/safety-trap.png"` | Absolute path under `public/`. |
| `status` | string | `"draft"` then `"live"` | Only `"live"` projects appear on the homepage. |

Optional fields: `substackUrl`, `substackTitle`, `featured` (boolean — but prefer dropping this entirely; the homepage falls back to the newest live project as featured automatically).

**Verify:**

```bash
jq -e --arg s "[slug]" '.[] | select(.slug == $s) | (.title and .description and .date and .thumbnail and .ogImage and .status)' src/content/projects.json
```

---

## 3. Project HTML CSS conventions

The project HTML's `<head>` `<style>` block must follow these rules. The shared `projectHeader` (in `src/lib/header.ts`) provides font-face, body/heading font overrides, the fixed site header, AND shared CSS classes for `.disclosure`, `.hr-subtle`, `.project-credit`, `.project-prose`, `.project-cta`, `.project-essay-cta`, `.project-byline`. Don't duplicate them.

| # | Rule | Why |
|---|------|-----|
| 3.1 | The title-block must use **all three** of these values exactly. The four-line block below produces consistent h1 → subtitle (6px) → byline (6px) → chart-island (40px) rhythm across every project. | The shared `.project-byline` injection assumes this exact spacing. Drift on any one of the three values (title-block bottom margin, h1 bottom margin, subtitle line-height) makes the byline gap differ visibly between projects. |

```css
.title-block          { margin: 0 auto var(--sp-1); }                /* sp-1 — NOT sp-4 or sp-5 */
.title-block h1       { margin-bottom: var(--sp-1); }                /* sp-1 — NOT sp-2 */
.title-block .subtitle{ line-height: var(--lh-body); }               /* lh-body — NOT 1.4 or 1.45 */
```
| 3.2 | Do NOT redefine `.disclosure`, `summary`, `.chev`, `.disclosure-body`, `.hr-subtle`, or `.project-credit` | `projectHeader` provides these. Redefining causes silent drift from the shared design. |
| 3.3 | Do NOT declare `@font-face` for `Roboto Slab`, `Lora`, or `Space Grotesk` | `projectHeader` declares these once. Duplicates conflict. |
| 3.4 | Do NOT preload `Inter-Variable.woff2` or set `font-family: 'Inter'` on body | Body is forced to `Lora !important` by `projectHeader`. Inter declarations are dead weight; chart UI should use `font-family: 'Space Grotesk', system-ui, sans-serif` (the `--font-sans` token). |
| 3.5 | Reading column max-width: `728px` (h1, subtitle, prose, disclosures, hr, footer) | Matches the rest of the site. |
| 3.6 | Chart island max-width: `940px` (charts/visuals can be wider than the reading column) | Lets visualizations breathe wider than prose. |
| 3.7 | Type scale: body 20px / subtitle 20px / h1 34px / detail-summary 16px / detail-body 15px / footer 14px | Inside the 728px reading column. |

**Verify:**

```bash
# Title-block margin standard
grep -A2 "\\.title-block {" src/projects/[slug].html | grep -q 'var(--sp-1)' || echo "FAIL: title-block bottom margin must be var(--sp-1)"

# No Inter preload
! grep -q "Inter-Variable.woff2" src/projects/[slug].html || echo "FAIL: remove Inter preload"

# No duplicated shared classes
for cls in '\\.disclosure {' '\\.hr-subtle {' '\\.project-credit {' '@font-face'; do
  grep -q "$cls" src/projects/[slug].html && echo "FAIL: redefines $cls (shared)"
done
```

---

## 4. Voice rules (every public-facing string)

Applies to titles, subtitles, descriptions (in `projects.json`), finding paragraphs, disclosure bodies, chart labels — everything a reader sees.

| # | Rule | Why |
|---|------|-----|
| 4.1 | Em dashes have **no spaces**: `word—word`, never `word — word` or `word -- word` | Project voice. Catches the most common AI-slop tell. |
| 4.2 | No format-describing copy ("An interactive comparison of...", "Take a look at...") | Lead with the insight, not the container. |
| 4.3 | No CTAs or reader-addressing ("See how...", "Try this...") | Sideband doesn't ask for the click. State claims directly. |
| 4.4 | No hedging ("arguably", "it seems", "I think", "perhaps") | Direct claims only. |
| 4.5 | Featured copy must pass the `humanizer` skill | Run it before commit on title/description and any prose changes. |

**Verify:**

```bash
# Em-dash with surrounding spaces
grep -nE '\\s—\\s| -- ' src/projects/[slug].html src/content/projects.json && echo "FAIL: spaced em-dashes"

# Run humanizer on edited copy lines (manual: invoke /humanizer in the session)
```

---

## 5. Image assets

| # | Rule | Canonical |
|---|------|-----------|
| 5.1 | Thumbnail at `src/assets/projects/[slug].png`, dimensions **1880×1176** (16:10) | http-402.png (1880×1175) |
| 5.2 | OG image at `public/img/og/[slug].png`, dimensions **1880×988** (1.903 ratio) | http-402.png, three-body-problem.png |
| 5.3 | Both captured via `scripts/capture-og.sh [slug]` (enforces dimensions, fails if wrong) | — |
| 5.4 | Thumbnail must show ONLY the visualization (not page title, subtitle, or description text) | The homepage card displays title + description below. Baking them in the image creates redundancy. |

**Why these specific numbers:**
- 1880×1176 thumbnail matches the homepage card's `aspect-ratio: 16/10` with `object-fit: cover; object-position: top`. Off-ratio thumbnails get the bottom clipped at display time.
- 1880×988 OG matches `og:image:width=1200, og:image:height=630` declared by `projectMeta()`. Social platforms letterbox or center-crop images that don't match the declared ratio.

**Verify:**

```bash
identify -format "%f: %wx%h (ratio %[fx:w/h])\n" \
  src/assets/projects/[slug].png \
  public/img/og/[slug].png

# Expected output:
#   [slug].png: 1880x1176 (1.59864)  ← thumbnail
#   [slug].png: 1880x988 (1.90283)   ← og
```

---

## 6. Image attributes (HTML hygiene)

| # | Rule |
|---|------|
| 6.1 | Every `<img>` has `alt`, `width`, `height`, and `loading` attributes (`eager` above-the-fold, `lazy` below) |
| 6.2 | Every icon-only `<a>` has `aria-label` describing the destination |
| 6.3 | Every `<svg>` inside a link has `aria-hidden="true"` |

**Verify:**

```bash
# Find imgs missing required attributes
grep -oE '<img[^>]*>' dist/[slug]/index.html | awk '
  !/alt=/    { print "missing alt: " $0 }
  !/width=/  { print "missing width: " $0 }
  !/height=/ { print "missing height: " $0 }
  !/loading=/{ print "missing loading: " $0 }
'
```

---

## 7. SEO + AI SEO

| # | Rule | Source of truth |
|---|------|-----------------|
| 7.1 | `projectMeta()` emits title, description, canonical, OG, Twitter Card, BreadcrumbList, Article schema, Person schema (with `sameAs` to shawnyeager.com), Organization schema | `src/lib/header.ts` |
| 7.2 | Project page has exactly **one** `<title>`, **one** `<h1>`, **one** `<meta charset>`, **one** `<meta name="viewport">` | `Project.astro` strips these from raw HTML to avoid duplicates |
| 7.3 | Project page has a visible byline ("By Shawn Yeager · [date]") with machine-readable `<time>` | Auto-injected by `Project.astro` from `projects.json.date` |
| 7.4 | `dateModified` defaults to `date` unless explicitly overridden | `projectMeta()` |

**Verify:**

```bash
URL="https://lab.sideband.pub/[slug]/"
for tag in '<title>' 'h1' 'meta charset' 'name="viewport"' 'application/ld+json'; do
  n=$(curl -s "$URL" | grep -c "$tag")
  echo "$tag: ${n}"
done
# Expected: 1, 1, 1, 1, 2  (the two schema scripts are BreadcrumbList + Article)
```

---

## 8. Build verification

| # | Rule |
|---|------|
| 8.1 | `npm run build` succeeds with zero errors |
| 8.2 | The new page appears in the build output and in `dist/sitemap-0.xml` |
| 8.3 | Astro dev toolbar audit on the live page shows zero accessibility and zero performance issues |

**Verify:**

```bash
npm run build && \
  grep -q "[slug]" dist/sitemap-0.xml && \
  grep -q "/[slug]/index.html" dist/<some-build-log> 2>/dev/null
```

---

## 9. Flip to live

Once everything above passes:

1. Change `"status": "draft"` to `"status": "live"` in `src/content/projects.json`
2. Run `npm run build` once more to confirm no regressions
3. Commit. **Don't push without explicit go-ahead from the user.**
4. After approval: push to master. Vercel auto-deploys.

---

## Quick verification one-liner

Paste this in a terminal with `[slug]` replaced. It runs the most important checks against a draft project before flip-to-live:

```bash
SLUG="safety-trap"  # ← edit
echo "── 1. Required files" && \
  ls -la src/pages/$SLUG/index.astro src/projects/$SLUG.html src/assets/projects/$SLUG.png public/img/og/$SLUG.png && \
echo "── 2. Image dimensions" && \
  identify -format "%f: %wx%h\n" src/assets/projects/$SLUG.png public/img/og/$SLUG.png && \
echo "── 3. Required projects.json fields" && \
  jq --arg s "$SLUG" '.[] | select(.slug == $s)' src/content/projects.json && \
echo "── 4. Title-block margin standard" && \
  grep -A2 "\\.title-block {" src/projects/$SLUG.html | grep -E "margin:.*var\\(--sp" && \
echo "── 5. No forbidden duplicates" && \
  ! grep -qE "@font-face.*'(Roboto Slab|Lora|Space Grotesk)'" src/projects/$SLUG.html && \
  ! grep -q "Inter-Variable.woff2" src/projects/$SLUG.html && \
echo "── 6. No spaced em-dashes in copy" && \
  ! grep -nE ' — ' src/projects/$SLUG.html src/content/projects.json && \
echo "── 7. Build" && \
  npm run build 2>&1 | grep -E "(error|Complete)" && \
echo "── 8. Verify rendered output" && \
  grep -c "<title>" dist/$SLUG/index.html && \
  grep -c "<h1" dist/$SLUG/index.html && \
echo "── ✅ all checks passed"
```

If any line fails, the project doesn't ship. Fix the underlying issue and re-run.
