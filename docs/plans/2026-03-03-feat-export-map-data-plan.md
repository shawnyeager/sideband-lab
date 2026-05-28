---
title: "feat: Export map data as JSON snapshot"
type: feat
status: completed
date: 2026-03-03
---

# Export map data as JSON snapshot

## Overview

Add a script that exports the Agent-Era Infrastructure Map dataset from Supabase to a JSON file committed to the repo at `data/map-entities.json`. The file includes layers (with maturity status) and all reviewed entities (with scores, reasoning, and source URLs). The export runs standalone or as a post-scoring hook.

## Motivation

The map data lives in Supabase behind an anon key. Nobody can browse the raw scores, reasoning, or sources without loading the site. An exported snapshot enables:

- **Transparency:** Anyone can inspect the data on GitHub
- **Reuse:** Researchers can download and analyze the dataset
- **Contribution context:** Issue reporters can reference exact scores when challenging or suggesting

## Proposed solution

### New script: `scripts/export-map-data.mjs`

Standalone CLI script. No flags needed — it just dumps the current state.

```bash
./scripts/export-map-data.mjs
```

**What it does:**

1. Connect to Supabase using the same env vars as `score-entities.mjs` (`SUPABASE_MAP_URL`, `SUPABASE_MAP_SERVICE_ROLE_KEY`)
2. Fetch all layers ordered by `sort_order`
3. Fetch all entities where `reviewed = true`
4. Shape the output:

```json
{
  "exported_at": "2026-03-03T15:00:00Z",
  "rubric": {
    "x_axis": "Closed (0) → Open (100): Who decides if you can participate?",
    "y_axis": "Centralized (0) → Distributed (100): Where does it run and who operates it?"
  },
  "layers": [
    {
      "key": "compute",
      "name": "Compute",
      "color": "#0EA5C9",
      "status": "Splitting",
      "status_note": "Two distinct camps forming, neither dominant"
    }
  ],
  "entities": [
    {
      "name": "Open-weight on local",
      "short_name": "Llama/local",
      "layer": "compute",
      "x": 92,
      "y": 95,
      "note": "No API key, no account, runs offline",
      "x_reasoning": "...",
      "y_reasoning": "...",
      "source_urls": [],
      "scored_at": "2026-03-03T12:00:00Z"
    }
  ]
}
```

5. Write to `data/map-entities.json` (pretty-printed, 2-space indent)
6. Print summary: `Exported N entities across M layers → data/map-entities.json`

### Hook into scoring script

- [ ] Add a call to the export at the end of `score-entities.mjs` (after scoring + maturity computation)
- [ ] Skip the export if `--dry-run` is set

### Output location

- [ ] `data/map-entities.json` — the snapshot
- [ ] Add `data/` to the repo (not gitignored)

## Acceptance criteria

- [ ] `./scripts/export-map-data.mjs` runs and produces `data/map-entities.json`
- [ ] Output includes `exported_at`, `rubric`, `layers`, and `entities` fields
- [ ] Entities are sorted by layer then by name
- [ ] Only `reviewed = true` entities are included
- [ ] `score-entities.mjs` calls the export after scoring (unless `--dry-run`)
- [ ] `npm run build` still succeeds
- [ ] The JSON file is committed and pushed

## Files to create/modify

| File | Action |
|------|--------|
| `scripts/export-map-data.mjs` | Create — standalone export script |
| `scripts/score-entities.mjs` | Modify — call export after scoring |
| `data/map-entities.json` | Create — generated output |

## References

- Brainstorm: `docs/brainstorms/2026-03-03-open-map-data-brainstorm.md`
- Scoring script: `scripts/score-entities.mjs`
- Supabase client: `src/lib/supabase.ts`
- Supabase schema: `supabase/migrations/20260303150000_create_map_tables.sql`
