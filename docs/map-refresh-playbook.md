# Map Refresh Playbook

How to refresh the Agent-Era Infrastructure Map (`/map`): identify new players,
add them, score them, and publish. This is the repeatable method behind any
refresh. The data lives in `data/map-data.json`, which is the single source of
truth — the React island imports it directly and the build inlines it.

The flow has two human gates: **candidate approval** (which players go on) and
**score review** (do the computed positions hold up). The tooling automates the
mechanical stages between them.

```
research → candidate list → [APPROVE] → add-entity → score → [REVIEW] → publish → build
```

---

## 1. Identify candidates (research)

Scan each of the five layers for players that have emerged since the last
refresh or were missed. Use web research; this is judgment work, not crawling.

- **Layers:** `compute`, `protocols`, `discovery`, `identity`, `payments`. Find
  the current set in `data/map-data.json` (`layers[].key`).
- **What qualifies:** a real, usable deployment pattern in the agent stack — a
  product, protocol, or service someone could actually adopt. Not vaporware, not
  a feature of a player already on the map, not a rebrand of an existing entry.
- **Dedup:** check every candidate against the existing roster
  (`jq '.entities[] | "\(.layer)\t\(.full_name)"' data/map-data.json`). The same
  name can legitimately appear in two layers (e.g. "A2A Agent Cards" sits in both
  `protocols` and `discovery`) — dedup is on **name + layer**, not name alone.
- **Curation discipline:** the map's value is sharpness, not completeness. Prefer
  a small high-signal set. Prune before you pad — a player that doesn't change
  what a reader understands doesn't earn a dot.

For each candidate draft:

| Field | Notes |
|-------|-------|
| `layer` | Must exactly match a layer `key`. |
| `short_name` | Chart label. Keep it tight. |
| `full_name` | Tooltip title. The deployment pattern, not just the company. |
| `note` | One claim-first line stating the tension (see voice below). |
| `source_urls` | 2–3 authoritative URLs (see source bar below). |

**Voice for `note`:** match the existing register — terse, specific, states the
tension (e.g. "2.5B devices, but Apple controls chip + App Store"). Follow
`VOICE.md`: em dashes have no spaces (`word—word`), no format-describing copy, no
hedging. Run new copy through the humanizer before it ships.

**Note-vs-source fidelity (important).** The scorer treats the `note` as
authoritative evidence — a signal may be cited as `"DESCRIPTION"` and resolved
straight from the note. Because the note is human- or model-drafted, a confident
but wrong note propagates directly into the coordinates. Before approval, verify
each note against its `source_urls` — the note must be a faithful summary of what
the sources actually say, not an impression. This is the only ground-truth check
between drafting and scoring; do not skip it.

**Gate:** present candidates grouped by layer with a one-line rationale each. Get
explicit approval before anything is written to `data/map-data.json`.

---

## 2. Add (scaffold)

For each approved candidate:

```bash
node scripts/add-entity.mjs \
  --layer <key> \
  --short-name "<short>" \
  --full-name "<full>" \
  --note "<claim-first note>" \
  --source-url <url> --source-url <url> \
  --dry-run        # inspect first; drop --dry-run to write
```

`add-entity.mjs` mints the `id`, validates the layer key, enforces required
fields, refuses within-layer duplicates (`--force` to override), and writes the
entity with `current_x`/`current_y` as `null` and `reviewed: false`. It never
assigns a score — placement is the scorer's job.

---

## 3. Score

```bash
node scripts/score-entities.mjs --id <id>          # one entity
node scripts/score-entities.mjs --layer <key>      # a whole layer
node scripts/score-entities.mjs                     # everything
```

Requires `ANTHROPIC_API_KEY` in `.env`. The scorer fetches each entity's
`source_urls`, extracts cited signals via the LLM, computes x/y deterministically,
and recomputes per-layer maturity.

Inspect before committing:

```bash
node scripts/score-entities.mjs --id <id> --extract-only   # show extracted signals
node scripts/score-entities.mjs --id <id> --dry-run        # compute, write nothing
```

**What "deterministic" means here.** The scoring *arithmetic* is deterministic:
identical extracted signals always produce identical x/y, and the extraction call
runs at `temperature: 0`. It does **not** mean re-running on the same URLs always
yields the same score — the scorer fetches **live** pages, and when a page's
HTML changes between runs the extracted signals (and thus the position) can move.
Don't treat a coordinate shift across days as a regression; treat it as the web
changing. To check the formula itself, compare runs over the same `--extract-only`
signal set, not over live fetches.

---

## 4. Source reachability (the dominant practical risk)

The scorer does a plain `fetch` (10s timeout, up to 5 URLs, HTML stripped to
text). Modern infra sites are often client-rendered SPAs or sit behind bot
challenges, which yield a near-empty body → null signals → `low_coverage` or
"all URLs failed". When that happens, in order:

1. **Swap sources.** Prefer static-HTML primary material: spec pages, RFC/IETF
   drafts, GitHub READMEs, docs sites that server-render, primary announcement
   posts. A GitHub repo README is usually more fetchable than a marketing SPA.
2. **Add the note as evidence.** A precise `note` is itself scorable evidence
   (cited as `DESCRIPTION`). A well-sourced note can carry signals the fetch
   missed — provided it passes the note-vs-source check in step 1.
3. **Fetch the rendered page manually** (browser, reader-mode, or a rendering
   fetch) and paste the relevant text into a source you control, or hand-curate
   an evidence excerpt, rather than looping on "fix the URL and re-run" when no
   static source exists.
4. **Accept documented low coverage.** If a genuinely new player has no
   fetchable primary source, it's legitimate to score at low coverage and record
   why in the approval notes — but never hand-edit a coordinate. If you can't get
   defensible evidence, the player isn't ready for the map yet.

---

## 5. Review and publish

- Confirm every scored entity has `current_x` and `current_y` as integers in
  **0–100**. A `null` or out-of-range coordinate is a failed score.
- **Guard:** set `reviewed: true` **only** after confirming the score is non-null
  and in range. `reviewed` is the maturity-inclusion flag — `computeLayerMaturity`
  counts only `reviewed` entities. It is **not** a render gate: the component plots
  every entity regardless of `reviewed`, and a `null` coordinate does **not** get
  dropped — it plots a real-looking dot at the chart **origin (0,0)**. So a new
  entity left at `reviewed: false` still shows on the map, and an entity flipped to
  `reviewed: true` while unscored both lies at the origin and pollutes the maturity
  math. Score first, verify range, then flip.
- Re-run a scoring pass so layer maturity (`computed_status`) reflects the final
  point set. Note that `computed_status` is a suggestion; the displayed
  `status`/`status_note` are hand-authored and authoritative (see below).

---

## 6. Editorial (layers + insights)

These are hand-authored and not computed:

- **Layer status.** `status` / `status_note` are the displayed editorial verdict
  and override `computed_status`. Review them against the refreshed distribution.
- **Insights.** The `insights` array renders **in array order**; the component
  ignores both `active` and `sort_order`. To retire an insight, **remove the
  array element** (or reorder the array) — toggling `active: false` does nothing.
  Review the cards against the new data; revise or cut any that no longer hold.

All editorial copy follows `VOICE.md` and passes the humanizer.

---

## 7. Build and verify

```bash
npm run build
```

Then load the map (`npm run dev`) and confirm: new players appear in the correct
layer color and position, per-layer visible counts match the data, tooltips read
correctly, no dot sits at the (0,0) origin (a null-score tell), and the console is
clean. Regenerate the OG image (`scripts/capture-og.sh map`) only if the visual
changed enough to matter for sharing.
