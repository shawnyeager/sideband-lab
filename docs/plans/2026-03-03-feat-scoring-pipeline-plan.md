---
title: Scoring pipeline for Agent-Era Infrastructure Map
type: feat
status: superseded-by-2026-03-04-refactor-deterministic-entity-scoring-plan
date: 2026-03-03
---

# Scoring Pipeline

## Overview

A Node.js script (`scripts/score-entities.mjs`) that scores entities against the published rubric using Claude, writes results to Supabase, and computes layer maturity labels. Run manually or scheduled. Single-user editorial tool.

## Problem Statement

Entity scores are currently hand-entered seed data. The pipeline automates evidence collection, rubric application, and scoring — producing cited reasoning that backs each placement on the map. Layer maturity labels (Settling, Splitting, etc.) are also hand-entered. The pipeline computes suggested labels from entity score distributions so the editor can accept or override.

## Architecture

```
scripts/score-entities.mjs
  ├─ reads entities + source_urls from Supabase (service role key)
  ├─ fetches evidence from source_urls (built-in fetch, 10s timeout)
  ├─ builds prompt (rubric + evidence + previous score)
  ├─ calls Claude Sonnet API (@anthropic-ai/sdk)
  ├─ writes score_history + updates entity (reviewed=false)
  └─ computes layer maturity (k-means, silhouette, spread, center gap)
       └─ writes computed_status + computed_status_note to layers table
```

No API routes, no edge functions, no UI. Just a script.

## CLI Interface

```bash
node scripts/score-entities.mjs                    # score all entities with source_urls
node scripts/score-entities.mjs --layer identity   # score one layer
node scripts/score-entities.mjs --id <uuid>        # score one entity
node scripts/score-entities.mjs --dry-run          # fetch + score but don't write to DB
```

After `--id` or `--layer` runs, maturity is recomputed for the affected layer(s) only, using all current scores in those layers (not just the entities just scored).

## Env Vars

Add to `.env` (server-side only, no `PUBLIC_` prefix):

```
SUPABASE_MAP_URL=https://your-project.supabase.co
SUPABASE_MAP_SERVICE_ROLE_KEY=your-service-role-key
ANTHROPIC_API_KEY=sk-ant-...
```

`SUPABASE_MAP_URL` is the same URL as `PUBLIC_SUPABASE_MAP_URL` — just without the `PUBLIC_` prefix so Astro doesn't bundle it.

## Dependencies

```bash
npm install @anthropic-ai/sdk
```

Everything else is already available:
- `@supabase/supabase-js` ^2.98.0 (installed)
- Node.js 25+ built-in `fetch` (no node-fetch needed)
- Top-level `await` (`.mjs` + `"type": "module"`)

## Claude API

**Model:** `claude-sonnet-4-5-20250929` (pinned for reproducibility)
**Temperature:** 0 (deterministic scoring)
**Max tokens:** 2048 (enough for structured reasoning)

**Response JSON schema** (from build spec):

```json
{
  "x_score": 72,
  "x_reasoning": "reasoning with specific citations",
  "y_score": 45,
  "y_reasoning": "reasoning with specific citations",
  "confidence_notes": "anything uncertain",
  "change_summary": "what moved and why, or null"
}
```

Field mapping to DB:
- `x_score` → `entities.current_x`, `score_history.x`
- `y_score` → `entities.current_y`, `score_history.y`
- `x_reasoning` → `entities.x_reasoning`, `score_history.x_reasoning`
- `y_reasoning` → `entities.y_reasoning`, `score_history.y_reasoning`
- `change_summary` → `score_history.change_note`
- `confidence_notes` → included in `x_reasoning`/`y_reasoning` or logged to stdout

**Prompt template:** Defined in the build spec (`aei-map-build-spec.md`, "Scoring prompt template" section). The rubric, entity metadata, fetched evidence, and previous score are assembled per the spec.

## Evidence Fetching

For each entity's `source_urls` array:
- Fetch each URL with 10-second timeout
- Strip HTML tags, extract text content (basic regex strip — no heavy DOM parsing)
- Truncate each URL's content to 8,000 characters
- Cap at 5 URLs per entity (skip remainder)
- Combined evidence cap: 40,000 characters total per entity prompt
- If all URLs fail: skip the entity, log warning, do not write scores
- If some URLs fail: score with available evidence, note gaps in prompt

## Entity Scoring Loop

**Concurrency:** Serial (one entity at a time). 33 entities at ~3s each = ~100s total. Avoids Claude rate limits and DB write conflicts. Simple, predictable.

**For each entity:**
1. Skip if `source_urls` is empty or null
2. Fetch evidence from source URLs
3. Query previous scores (current_x, current_y, x_reasoning, y_reasoning) if they exist
4. Build prompt from template
5. Call Claude, parse JSON response
6. On success:
   - `INSERT INTO score_history` (entity_id, x, y, x_reasoning, y_reasoning, change_note, scored_at=now(), reviewed=false)
   - `UPDATE entities SET current_x, current_y, x_reasoning, y_reasoning, scored_at=now(), reviewed=false, updated_at=now()`
7. On failure (malformed JSON, API error, refusal):
   - Log error with entity name and error details
   - Skip to next entity
   - Do not write any scores for this entity

**Re-scoring:** When an entity already has scores, the previous values are included in the prompt per the spec template. Claude is instructed to note what changed.

## Layer Maturity Computation

Runs after all entity scoring completes. Uses `current_x` and `current_y` from ALL reviewed entities in each layer (not just those scored in this run).

### Metrics per layer

1. **Entity count** — number of reviewed entities
2. **Centroid** — mean x, mean y
3. **Spread** — standard deviation on both axes
4. **k-means k=2** — deterministic init (sort entities by id, pick first two as initial centroids), max 50 iterations
   - Distance between two centroids
   - Average radius of each cluster
   - Silhouette score (mean over all points: (b-a)/max(a,b) where a=mean dist to own cluster, b=mean dist to nearest other cluster)
5. **Center gap** — count of entities where both x and y are in 35-65 range

### Label assignment rules (from addendum)

| Label | Conditions |
|---|---|
| **Wide open** | < 4 entities, OR spread > 35 on either axis, OR strong bifurcation + few entities |
| **Settling** | Single dominant cluster. Silhouette for k=2 < 0.5. Spread < 25 on both axes. If history exists, spread decreasing. |
| **Splitting** | Two clear clusters. Silhouette for k=2 >= 0.5. Centroid distance > 40. Center gap empty or near-empty. |
| **Forking** | Same as Splitting, but temporal drift shows clusters moving apart across snapshots. Requires >= 2 scoring cycles. Falls back to Splitting before history exists. |
| **Fragmenting** | High spread (> 30) with no clean k=2 separation (silhouette < 0.5). Entities scattered without converging. |

### Temporal drift (requires score_history)

Compare current per-layer metrics against previous snapshot. "Previous snapshot" = the most recent `scored_at` before the current run for each entity. If < 2 scoring cycles exist, temporal detection is unavailable — Forking falls back to Splitting.

Drift measured on cluster centroids: if the two k=2 centroids are moving apart (Euclidean distance increasing between snapshots), label as Forking instead of Splitting.

### Output

Write to `layers` table:
- `computed_status` — the computed label
- `computed_status_note` — metrics summary (e.g. "2 clusters, silhouette=0.72, centroid distance=52, spread x=28 y=31")

Never overwrite `status` or `status_note` — those remain editorial. The `status_override` boolean and `override_rationale` are managed by the admin UI (future), not the pipeline.

## Component Impact

**None.** `AgentInfraMap.jsx` reads `status` and `status_note` (the editorial columns). The `computed_status` columns are for admin review only. The pipeline sets `reviewed=false` on scored entities, which removes them from the public map until the editor approves — this is the intended editorial gate.

## Summary Output

Print to stdout after completion:

```
Scored 28 of 33 entities (5 skipped: no source_urls)
Errors: 0

Layer maturity:
  compute    Splitting  (silhouette=0.68, spread=24/31)
  protocols  Settling   (silhouette=0.31, spread=18/22)
  discovery  Fragmenting (silhouette=0.22, spread=34/38)
  identity   Wide open  (4 entities, spread=39/41)
  payments   Splitting  (silhouette=0.71, spread=26/33)
```

Exit codes: 0 = all scored entities succeeded, 1 = env var missing or can't connect, 2 = partial failure (some entities errored).

## Files

| File | Action |
|---|---|
| `scripts/score-entities.mjs` | New — the pipeline script |
| `package.json` | Add `@anthropic-ai/sdk` |
| `.env` | Add `SUPABASE_MAP_URL`, `SUPABASE_MAP_SERVICE_ROLE_KEY`, `ANTHROPIC_API_KEY` |
| `.env.example` | Add placeholders for above |

## Acceptance Criteria

- [ ] `node scripts/score-entities.mjs --dry-run` fetches evidence, calls Claude, prints scores without writing to DB
- [ ] `node scripts/score-entities.mjs --id <uuid>` scores a single entity, writes score_history, updates entity, recomputes layer maturity
- [ ] `node scripts/score-entities.mjs --layer compute` scores all compute entities with source_urls
- [ ] `node scripts/score-entities.mjs` scores all entities, computes all layer maturities
- [ ] Entities are set to `reviewed=false` after scoring (drop off public map until approved)
- [ ] `score_history` rows are created with reasoning and change_note
- [ ] `computed_status` and `computed_status_note` written to layers table
- [ ] Entities with empty `source_urls` are skipped with a log message
- [ ] URL fetch failures are handled gracefully (log + continue)
- [ ] Claude API errors are handled gracefully (log + skip entity)
- [ ] Missing env vars produce a clear error message and exit 1
- [ ] Summary table printed to stdout on completion

## References

- Build spec: `/home/shawn/Downloads/aei-map-build-spec.md` (scoring prompt template, rubric, pipeline steps)
- Maturity addendum: conversation context (k-means rules, label assignment, temporal drift)
- Supabase schema: `supabase/migrations/20260303150000_create_map_tables.sql`
- Maturity columns: `supabase/migrations/20260303160000_add_computed_maturity_columns.sql`
- Existing script pattern: `scripts/screenshot.mjs` (plain .mjs, top-level await, ad hoc execution)
