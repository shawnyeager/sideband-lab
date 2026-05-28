---
title: Generate chart screenshot for project thumbnail
type: feat
status: active
date: 2026-03-01
---

# Generate chart screenshot for project thumbnail

The homepage project card references `/img/projects/three-body-problem.png` but no current screenshot exists. The D3 chart at `/three-body-problem/` runs a force simulation that requires JavaScript execution — a real browser is needed.

## Solution

Playwright is available via npx (v1.58.2). One command captures the chart:

```bash
npx playwright screenshot \
  --wait-for-timeout 3000 \
  --viewport-size "1050,800" \
  http://localhost:4322/three-body-problem/ \
  public/img/projects/three-body-problem.png
```

- `--wait-for-timeout 3000`: D3 simulation runs 800 ticks on load, 3s is ample
- `--viewport-size "1050,800"`: matches the page's designed width (`<meta viewport content="width=1050">`)
- Captures the visible viewport (title + chart + zone bar) — exactly what a card preview needs

## Acceptance Criteria

- [ ] Screenshot captures the live D3 chart (not the old manual SVG version)
- [ ] Saved to `public/img/projects/three-body-problem.png`
- [ ] `projects.json` thumbnail field points to `/img/projects/three-body-problem.png`
- [ ] Card on homepage displays the preview image
- [ ] Delete stale `public/img/projects/payment-flows.png`
- [ ] Delete leftover `agent-payment-gravity.html` from project root
- [ ] Commit
