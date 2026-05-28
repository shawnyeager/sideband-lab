---
title: "feat: Open-source the repo"
type: feat
status: active
date: 2026-03-03
---

# Open-source the Sideband Lab repo

## Context

Practice what we preach — open the GitHub repo (`shawnyeager/sideband-lab`, currently private). This means cleaning cruft, scrubbing credentials, documenting the codebase, writing a README, adding a GitHub link to the site, and squashing the entire history into a single clean commit.

## Phase 1: Security scrub

### 1a. Redact plan doc with real Supabase project ID

`docs/plans/2026-03-03-feat-scoring-pipeline-plan.md:49-51` contains the literal Supabase URL (`mgcmtxqppyqjyufrewpw.supabase.co`). Replace with placeholder:

```
SUPABASE_MAP_URL=https://your-project.supabase.co
SUPABASE_MAP_SERVICE_ROLE_KEY=your-service-role-key
ANTHROPIC_API_KEY=sk-ant-...
```

### 1b. Rotate keys after going public

Not a code change — but after the repo goes public, rotate:
- Supabase anon key + service role key (Dashboard → Settings → API)
- Anthropic API key

### 1c. Harden .gitignore

Add to root `.gitignore`:
```
.env.local
.env.*.local
```

## Phase 2: Remove cruft

### 2a. Delete `.vscode/`

Contains `extensions.json` (Astro extension recommendation) and `launch.json` (debug config). Neither belongs in a public repo — they're editor preferences.

### 2b. Evaluate `docs/plans/`

These are internal planning docs. Decision: **keep them.** They show the thinking behind the project — fits the open-source-everything ethos. Just scrub the credential from 1a.

### 2c. Evaluate `scripts/`

`scripts/score-entities.mjs` and `scripts/screenshot.mjs` — useful utilities. Keep them. They read env vars correctly (no hardcoded secrets).

## Phase 3: Package metadata

Update `package.json`:

```json
{
  "name": "sideband-lab",
  "description": "Interactive projects that accompany the Sideband newsletter",
  "repository": {
    "type": "git",
    "url": "https://github.com/shawnyeager/sideband-lab"
  },
  "author": "Shawn Yeager",
  "license": "MIT"
}
```

## Phase 4: Add LICENSE

Create `LICENSE` — MIT license, copyright Shawn Yeager 2026.

## Phase 5: Write README.md

Structure:

```
# Sideband Lab

One-liner: Interactive projects that accompany sideband.pub.

## Projects
- Three-Body Problem — force simulation of agent payment tensions
- U.S. GDP Status — LLM uptime as a macroeconomic indicator
- Agent-Era Infrastructure Map — openness/distribution scatter plot

## Stack
Astro, React, D3, Supabase, Vercel

## Local dev
git clone / npm install / cp .env.example .env / npm run dev

## Adding a project
Brief version of the CLAUDE.md scaffolding instructions

## Contributing
Issues and PRs welcome. Link to GitHub issues.

## License
MIT
```

## Phase 6: Update site header + footer

### 6a. Header — add GitHub link

In `src/lib/header.ts`, add a GitHub icon/link to `headerMarkup` next to the `← sideband.pub` back link. Small, muted, doesn't compete with the brand.

Use an inline SVG for the GitHub mark (no external dependency). Style it to match the existing `site-header__back` link — same font-size neighborhood, same muted color, same hover behavior.

### 6b. Footer — add open-source callout

In `src/components/Footer.astro`, add a line after the existing copy mentioning the repo is open source. Something like: "This site is open source — [view on GitHub](repo-url)."

## Phase 7: Squash commit

After all changes are committed:

```bash
git checkout --orphan fresh
git add -A
git commit -m "Initial commit: Sideband Lab — open-source interactive projects"
git branch -M fresh master
git push --force origin master
```

This replaces the entire history with a single clean commit. No credentials, no messy history, fresh start.

## Files touched

- `.gitignore` — add `.env.local` patterns
- `.vscode/` — delete directory
- `docs/plans/2026-03-03-feat-scoring-pipeline-plan.md` — redact Supabase URL
- `package.json` — add metadata fields
- `LICENSE` — new file (MIT)
- `README.md` — new file
- `src/lib/header.ts` — add GitHub link to header
- `src/components/Footer.astro` — add open-source callout

## Verification

- [ ] `grep -r "mgcmtxqppyqjyufrewpw" .` returns zero results (excluding .env, node_modules, dist)
- [ ] `grep -r "eyJ" . --include="*.md" --include="*.ts" --include="*.js" --include="*.mjs"` returns zero results
- [ ] No `.vscode/` directory
- [ ] `npm run build` succeeds
- [ ] README renders correctly on GitHub
- [ ] Header shows GitHub link, footer shows open-source callout
- [ ] After squash: `git log --oneline` shows exactly 1 commit
