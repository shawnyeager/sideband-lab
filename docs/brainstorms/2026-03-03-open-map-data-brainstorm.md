---
date: 2026-03-03
topic: open-map-data
---

# Open-sharing the map data

## What we're building

A JSON snapshot of the Agent-Era Infrastructure Map dataset, exported from Supabase and committed to the repo. One file per export: `data/map-entities.json`. Contains every reviewed entity with its layer, scores, reasoning, and source URLs.

## Why this approach

- **Supabase stays canonical.** The DB has score history, computed maturity labels, audit trails. The scoring script already writes there. No reason to move the source of truth.
- **The snapshot is a mirror, not a source.** Exported after each scoring run. Anyone can browse it on GitHub, download it, or build on it.
- **Issues for contributions, not PRs against data files.** The "Suggest a company" and "Challenge a score" issue templates are lower friction than cloning a repo and editing JSON. Most people who care about the data aren't developers.
- **No separate data repo.** Adds coordination overhead for zero benefit at 33 entities. Revisit if the dataset grows significantly.
- **Current scores only.** Score history is empty right now (everything scored once). Export history when there's history to export.

## Key decisions

- **Format:** JSON (structured, includes reasoning and source URLs)
- **Scope:** Current scores only, not score history (yet)
- **Location:** `data/map-entities.json` in the main repo
- **Trigger:** Export runs as part of `score-entities.mjs` or as a standalone command
- **Layers included:** Export layers with their maturity status alongside entities

## Open questions

None — straightforward implementation.

## Next steps

→ `/workflows:plan` for implementation details
