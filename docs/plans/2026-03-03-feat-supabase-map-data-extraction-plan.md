---
title: Extract map data from JSX into Supabase
type: feat
status: active
date: 2026-03-03
---

# Extract map data from JSX into Supabase

## Overview

Move the three hardcoded data sources in `AgentInfraMap.jsx` (33 entities, 5 layers, 4 insight cards) into Supabase tables and fetch them client-side. The rubric accordion stays hardcoded. Schema follows the build spec (`aei-map-build-spec.md`).

## Problem Statement

All map data lives as JS constants in the component. Updating a score, adding an entity, or editing an insight card requires a code change and deploy. Moving data to Supabase lets the editor update the map without touching code — and lays groundwork for the scoring pipeline.

## Supabase Schema

Four tables, matching the build spec exactly:

### `layers`

| Column | Type | Notes |
|--------|------|-------|
| key | text | **PK**. `compute`, `protocols`, etc. |
| name | text | Display name |
| color | text | Hex color |
| status | text | Maturity label |
| status_note | text | One-line explanation |
| sort_order | integer | Display order (not in spec, needed for stable button/list ordering) |

### `entities`

| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK, default `gen_random_uuid()` |
| layer | text | FK-ish reference to `layers.key` |
| short_name | text | Label on dots → maps to component `d.short` |
| full_name | text | Hover name → maps to component `d.name` |
| note | text | Hover description |
| current_x | integer | Openness score 0-100 → maps to `d.x` |
| current_y | integer | Distribution score 0-100 → maps to `d.y` |
| source_urls | text[] | Evidence URLs (empty for now) |
| x_reasoning | text | (null for now) |
| y_reasoning | text | (null for now) |
| scored_at | timestamptz | (null for now) |
| reviewed | boolean | Default true for seed data |
| created_at | timestamptz | Default `now()` |
| updated_at | timestamptz | Default `now()` |

### `insights`

| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| title | text | Card title → maps to `card.title` |
| body | text | Card text → maps to component `card.text` |
| color | text | Accent hex → maps to `card.color` |
| sort_order | integer | Display order |
| active | boolean | Whether to show |

### `score_history`

| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| entity_id | uuid | FK to entities |
| x | integer | |
| y | integer | |
| x_reasoning | text | |
| y_reasoning | text | |
| change_note | text | |
| scored_at | timestamptz | |
| reviewed | boolean | |

Future infrastructure only — created but not wired to the component.

### RLS

- All tables: `SELECT` for `anon` role (public read)
- All tables: `INSERT`, `UPDATE`, `DELETE` for `authenticated` role only

## Column Mapping

DB snake_case → Component camelCase transformation after fetch:

```
entities:
  short_name  → short
  full_name   → name
  current_x   → x
  current_y   → y
  note        → note (same)
  layer       → layer (same)

layers:
  key         → object key
  status_note → statusNote

insights:
  body        → text
```

## Implementation

### 1. Supabase project setup

Create a new Supabase project (or use existing if one exists). Create the four tables via SQL. The full DDL + seed will be in `/scripts/seed-map.sql`.

### 2. Install dependency + create client singleton

```bash
npm install @supabase/supabase-js
```

Create `src/lib/supabase.ts`:
```ts
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  import.meta.env.PUBLIC_SUPABASE_URL,
  import.meta.env.PUBLIC_SUPABASE_ANON_KEY
);
```

### 3. Env vars

Add to `.env`:
```
PUBLIC_SUPABASE_URL=https://xxx.supabase.co
PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

Add `.env.example` with placeholder values for documentation.

Configure the same vars in Vercel project settings before deploying.

### 4. Modify `AgentInfraMap.jsx`

- Add `useEffect` that fetches all three tables in parallel via `Promise.all`
- Transform DB rows to match component's expected shapes (column mapping above)
- Derive `LAYER_KEYS` from fetched layers, sorted by `sort_order`
- Add loading state: render the SVG frame + axis labels with centered "Loading..." text in `#EEEBE4` at 40% opacity
- Add error state: centered error message on dark background
- Remove hardcoded `LAYERS`, `DATA`, and insight card arrays
- Keep `LAYER_KEYS` derivation, `RubricAccordion`, and all interaction logic unchanged

### 5. Seed script — `/scripts/seed-map.sql`

Committed SQL file containing:
- `CREATE TABLE` statements for all four tables
- `ALTER TABLE ... ENABLE ROW LEVEL SECURITY` + policies
- `INSERT` statements for all 33 entities, 5 layers, 4 insights
- Data extracted directly from the current JSX constants

### 6. React key stability

Change scatter plot keys from `${d.layer}-${d.short}-${i}` to use `d.id` (the uuid from the entities table), ensuring stable React reconciliation.

## Files touched

- `package.json` / `package-lock.json` — add `@supabase/supabase-js`
- `src/lib/supabase.ts` — new singleton client
- `src/components/map/AgentInfraMap.jsx` — replace hardcoded data with fetch
- `scripts/seed-map.sql` — new seed/migration script
- `.env` — add Supabase credentials
- `.env.example` — new, documents required vars

## Acceptance Criteria

- [ ] Map renders identically from Supabase data as it did from hardcoded constants
- [ ] Layer filter buttons, hover tooltips, diagonal toggle, rubric accordion all work
- [ ] Loading state is visible on first paint (dark background + monospace "Loading...")
- [ ] Error state renders if Supabase is unreachable
- [ ] Seed script creates all tables + inserts all 33 entities, 5 layers, 4 insights
- [ ] RLS allows anonymous reads, blocks anonymous writes
- [ ] `npm run build` succeeds
- [ ] Env vars documented in `.env.example`

## References

- Build spec: `/home/shawn/Downloads/aei-map-build-spec.md`
- Component: `src/components/map/AgentInfraMap.jsx`
- Astro page: `src/pages/map/index.astro`
- Supabase client pattern: `src/lib/header.ts` (singleton export pattern)
