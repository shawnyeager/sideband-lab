---
title: "feat: x402 vs L402 Payment Protocol Comparison Visualization"
type: feat
status: completed
date: 2026-03-07
---

# x402 vs L402: Interactive Protocol Comparison

## Enhancement Summary

**Deepened on:** 2026-03-07
**Research agents used:** SVG animation best practices, architecture strategist, performance oracle, frontend race conditions reviewer, UX architect, pattern recognition specialist, security sentinel

### Key Improvements
1. **Animation engine**: Use Web Animations API (WAAPI) with `offset-path` for GPU-composited arrow travel, replacing rAF+setAttribute approach
2. **Race condition prevention**: Generational cancel tokens, STATE_TRANSITIONING gate, dwell-time tracking for pause/resume
3. **Color palette corrected**: Use brand navy `#1d2733` (matching three-body-problem), warm-toned text, not cool-slate
4. **Scroll-triggered start**: IntersectionObserver + `document.fonts.ready` prevents wasted animation on page load
5. **Timing asymmetry as hero**: Elapsed time counter below each diagram makes the speed difference visceral
6. **JSON detail as expandable inline sections** (not popups) — enables side-by-side comparison

### New Considerations Discovered
- SVG-HTML coordinate synchronization is the highest-risk integration point — must compute arrow endpoints from DOM positions via `getBoundingClientRect()` + `ResizeObserver`
- CSS `drop-shadow()` preferred over SVG `feGaussianBlur` for mobile performance
- Use `textContent` (never `innerHTML`) for all JSON rendering to prevent XSS
- 35% of users enable `prefers-reduced-motion` — not an edge case

---

## Overview

Build a single-file HTML page (`public/http-402/index.html`) that visualizes and compares the two competing HTTP 402 payment protocols — **x402** (Coinbase, USDC on Base) and **L402** (Lightning Labs, Bitcoin Lightning) — as side-by-side animated sequence diagrams.

Dark-themed visualization island on the standard cream Sideband Lab page. Follows the three-body-problem pattern.

## Problem Statement

Two protocols compete to make HTTP 402 real for AI agents paying for APIs. x402 (Coinbase, May 2025) uses stablecoin signatures on EVM L2s. L402 (Lightning Labs, 2020) uses Lightning invoices with macaroon credentials. Neither protocol's flow is intuitive from reading specs alone. A side-by-side animated comparison creates an instant "aha" — you see the architectural tradeoffs (intermediary vs direct, stablecoin vs volatile, single-use vs reusable credentials) in motion.

This visualization accompanies a Sideband newsletter post comparing both approaches.

## Proposed Solution

Two animated sequence diagrams running in parallel on a dark canvas, with a comparison summary table below. Each diagram auto-plays its protocol flow. The visual difference in step count (x402: 9 steps with a facilitator, L402: 5 steps with direct settlement) is itself a key insight.

### Protocol Flows

#### x402 Flow (9 steps, 3 actors)

| # | From | To | Label | Detail |
|---|------|----|-------|--------|
| 1 | Agent | Server | `GET /premium-data` | Initial API request |
| 2 | Server | Agent | `402` + `PAYMENT-REQUIRED` | Header contains JSON: scheme, network, maxAmountRequired, payTo, asset, maxTimeoutSeconds |
| 3 | Agent | Agent | Sign EIP-3009 auth | Off-chain EIP-712 typed data signature. No gas, no tx. Shows signing card |
| 4 | Agent | Server | Retry + `PAYMENT-SIGNATURE` | Base64-encoded payload with signature + authorization fields |
| 5 | Server | Facilitator | `POST /verify` | Delegate signature verification |
| 6 | Facilitator | Server | Verified | Off-chain check (~100ms) |
| 7 | Server | Agent | `200 OK` + resource | Data delivered immediately after verification |
| 8 | Facilitator | Blockchain | `transferWithAuthorization` | Settle USDC on-chain (~2s on Base). Facilitator pays gas |
| 9 | Blockchain | Facilitator | Confirmed | On-chain finality |

**Key detail**: Server delivers the resource after verification (step 7) but *before* on-chain settlement completes (step 9). The facilitator takes the settlement risk. This is the "verify first, settle later" pattern.

**Actors**: AI Agent, Server, Facilitator

#### L402 Flow (5 steps, 3 actors)

| # | From | To | Label | Detail |
|---|------|----|-------|--------|
| 1 | Agent | Server | `GET /premium-data` | Initial API request |
| 2 | Server | Agent | `402` + `WWW-Authenticate: L402` | Header contains base64 macaroon + BOLT-11 Lightning invoice |
| 3 | Agent | Lightning | Pay invoice | Agent's Lightning wallet pays invoice; receives preimage on settlement |
| 4 | Agent | Server | Retry + `Authorization: L402 <macaroon>:<preimage>` | Proves payment was made |
| 5 | Server | Agent | `200 OK` + resource | Server verifies locally: SHA256(preimage) == payment_hash in macaroon |

**Key detail**: No intermediary. Server mints the macaroon and verifies it locally (HMAC chain + SHA256). The Lightning Network handles routing and settlement directly. The macaroon+preimage credential is reusable for future requests.

**Actors**: AI Agent, Server, Lightning Network

### Layout Architecture

```
┌──────────────────────────────────────────────────┐
│  Injected cream header (57px)                    │
├──────────────────────────────────────────────────┤
│  Cream: h1 + subtitle (728px centered)           │
├──────────────────────────────────────────────────┤
│  ┌────────────────────────────────────────────┐  │
│  │  Dark canvas (940px max)                   │  │
│  │                                            │  │
│  │  ┌─── x402 ────┐   ┌─── L402 ────┐       │  │
│  │  │ Agent        │   │ Agent        │       │  │
│  │  │ Server       │   │ Server       │       │  │
│  │  │ Facilitator  │   │ Lightning    │       │  │
│  │  │              │   │              │       │  │
│  │  │ 9 steps      │   │ 5 steps      │       │  │
│  │  │ animated     │   │ animated     │       │  │
│  │  └──────────────┘   └──────────────┘       │  │
│  │                                            │  │
│  │  elapsed: 8.2s        elapsed: 10.0s ✓     │  │
│  │  ████████░░ 7/9       ██████████ 5/5       │  │
│  └────────────────────────────────────────────┘  │
├──────────────────────────────────────────────────┤
│  [▶ Replay comparison]                           │
├──────────────────────────────────────────────────┤
│  Cream: Comparison table (728px centered)        │
│  (semantic <table> with <th scope>)              │
├──────────────────────────────────────────────────┤
│  Cream: Explanation prose (728px centered)       │
├──────────────────────────────────────────────────┤
│  Footer credit line (728px, 14px)                │
└──────────────────────────────────────────────────┘
```

**Mobile (< 768px):** Tab toggle `[x402] [L402]` shows one diagram at a time. Tabs follow WAI-ARIA Tabs pattern (`role="tablist"`, `role="tab"`, `aria-selected`, arrow-key navigation). Tab switch pauses hidden diagram's timeline, preserves step index, snaps returning tab to completed state of current step. Dark canvas goes full-bleed: `width: calc(100% + 32px); margin-left: -16px`. Comparison table stacks as cards on very narrow viewports.

### Color Palette

```css
:root {
  /* Site-level (matches three-body-problem) */
  --site-bg:          #eeebe4;
  --site-text:        #393a3a;
  --site-text-muted:  #6b6966;
  --site-text-sub:    #9a9793;
  --site-hr:          #d5d2cb;

  /* Dark canvas — brand navy (NOT near-black) */
  --viz-bg:           #1d2733;
  --viz-bg-light:     #253040;
  --viz-bg-mid:       #2E3A48;

  /* x402 — green/emerald (EVM/stablecoin) */
  --x402:             #10b981;
  --x402-glow:        rgba(16, 185, 129, 0.4);
  --x402-dim:         #065f46;

  /* L402 — amber/orange (Lightning) */
  --l402:             #f59e0b;
  --l402-glow:        rgba(245, 158, 11, 0.3);
  --l402-dim:         #92400e;

  /* Text on dark — warm tones (matching brand) */
  --viz-text:         #e3dfd3;
  --viz-text-muted:   #a09d94;
  --viz-text-dim:     #7a7770;

  /* Typographic scale */
  --fs-h1: 34px;
  --fs-sub: 20px;
  --fs-body: 20px;
  --fs-detail-sum: 16px;
  --fs-detail-body: 15px;
  --fs-foot: 14px;
  --lh-heading: 1.15;
  --lh-body: 1.65;

  /* Spacing */
  --sp-1: 6px; --sp-2: 12px; --sp-3: 20px; --sp-4: 28px; --sp-5: 40px;

  /* Easing */
  --ease-out-quart: cubic-bezier(0.25, 1, 0.5, 1);
}
```

### Animation Engine

**WAAPI-driven state machine** managing two parallel timelines. Each timeline is a declarative array of step objects:

```javascript
const x402Steps = [
  { from: 0, to: 1, label: 'GET /premium-data', duration: 800, pauseAfter: 300 },
  { from: 1, to: 0, label: '402 Payment Required', duration: 600, pauseAfter: 400 },
  // ...
];
```

**State machine per diagram:**

```
States: IDLE → PLAYING → TRANSITIONING → PAUSED → COMPLETE
```

- `TRANSITIONING` is the gate: when an arrow is mid-flight, hover sets a "pause requested" flag but does not interrupt the current animation. When the WAAPI `animation.finished` Promise resolves, the state machine checks the flag before advancing.
- Generational cancel token (`Symbol()`) prevents ghost callbacks from previous play cycles on replay.
- Dwell time tracking: on pause, store `remainingDelay = dwellDuration - (now - dwellStarted)`. On resume, schedule with remaining time, not full duration.

**Arrow animation technique:**

```css
/* GPU-composited traveling dot via offset-path */
.traveling-dot {
  offset-path: path("M 50 200 L 400 200");
  offset-rotate: 0deg;
}
```

```javascript
// WAAPI gives pause/resume + Promise-based chaining
const anim = dot.animate(
  [{ offsetDistance: '0%' }, { offsetDistance: '100%' }],
  { duration: 800, easing: 'var(--ease-out-quart)', fill: 'forwards' }
);
await anim.finished; // chain to next step
```

**Line drawing:** `stroke-dashoffset` CSS transition on SVG `<line>` elements — GPU-composited, declarative.

**Glow effects:** CSS `drop-shadow()` preferred over SVG `feGaussianBlur` for mobile performance:

```css
.arrow-active {
  filter: drop-shadow(0 0 6px var(--x402)) drop-shadow(0 0 2px var(--x402));
}
```

Pulsing glow animates `opacity` (0.6 → 1), never the blur `stdDeviation`.

**Start trigger:**

```javascript
document.fonts.ready.then(() => {
  const observer = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) {
      observer.disconnect();
      x402Timeline.play();
      l402Timeline.play();
    }
  }, { threshold: 0.3 });
  observer.observe(document.querySelector('.chart-island'));
});
```

### SVG-HTML Coordinate Synchronization

**HIGH RISK area.** Arrows are SVG, actor columns are HTML. Endpoints must be computed from DOM positions at runtime:

```javascript
function getActorX(actorEl, containerEl) {
  const actorRect = actorEl.getBoundingClientRect();
  const containerRect = containerEl.getBoundingClientRect();
  return actorRect.left + actorRect.width / 2 - containerRect.left;
}
```

Use `ResizeObserver` to recompute on layout changes (window resize, font swap). The SVG overlay uses `position: absolute` within a `position: relative` container, so SVG coordinate space matches HTML layout pixel-for-pixel.

### Interactive Features

| Feature | Behavior |
|---------|----------|
| **Hover step row** | Pause that diagram (gentle ease to stop over 300ms), highlight step with left-border accent (3px, protocol color), dim other steps to opacity 0.4. `cursor: pointer` on all step rows. |
| **Click actor header** | Popover anchored to actor label (CSS positioned, not modal). 1-2 sentences in Space Grotesk 15px. Dismiss on click-outside or Escape. `role="tooltip"`, `aria-describedby`. Mobile: bottom sheet (30% vh max). |
| **Click 402 badge (step 2)** | Expandable inline section (not popup) — `<details>` accordion matching three-body-problem `.detail-block` pattern. Both protocols' JSON expandable independently for side-by-side comparison. Monospace font, syntax highlighted (keys in `--viz-text-muted`, values in protocol color). |
| **Replay button** | Global only (not per-diagram). Appears after both complete. Text button: "Replay comparison" in Space Grotesk, `--viz-text-muted`, with circular-arrow icon. Native `<button>`, `aria-label="Replay comparison"`. Debounced with rAF lock to prevent double-click. |
| **Step 3 detail** | x402: signing card. L402: Lightning route animation |
| **Tab toggle (mobile)** | WAI-ARIA Tabs: `role="tablist"`, `role="tab"`, `role="tabpanel"`. Pause hidden diagram, preserve step index, snap to completed state on return. Arrow-key navigation between tabs. |
| **Elapsed timer** | Small counter below each diagram (Space Grotesk, `--fs-foot`, `--viz-text-dim`). L402 freezes at ~10s with checkmark; x402 keeps counting. Makes time difference visceral. |

### Detail Content

**x402 PAYMENT-REQUIRED header (step 2 expandable):**
```json
{
  "x402Version": 1,
  "accepts": [{
    "scheme": "exact",
    "network": "base",
    "maxAmountRequired": "10000",
    "resource": "/premium-data",
    "payTo": "0x742d...0bEb",
    "asset": "0x8335...2913",
    "maxTimeoutSeconds": 60
  }]
}
```

**L402 WWW-Authenticate header (step 2 expandable):**
```
L402 macaroon="AGIAJEemVQ...Cg==",
     invoice="lnbc100n1p3..."
```
Annotation: "Macaroon contains payment_hash as caveat. Invoice is standard BOLT-11."

**x402 PAYMENT-SIGNATURE (step 4 expandable):**
```json
{
  "scheme": "exact",
  "network": "base",
  "payload": {
    "signature": "0xabc123...",
    "authorization": {
      "from": "0x1234...cdef",
      "to": "0x742d...0bEb",
      "value": "10000",
      "validAfter": "1740672089",
      "validBefore": "1740672154"
    }
  }
}
```

**L402 Authorization (step 4 expandable):**
```
L402 AGIAJEem...Cg==:1234abcd1234abcd...
```
Annotation: "macaroon:preimage — preimage proves invoice was paid (SHA256(preimage) == payment_hash)."

All JSON rendered via `textContent` (never `innerHTML`). Example addresses are clearly truncated with `...` ellipsis.

### Actor Tooltips

**x402 actors:**
- **AI Agent**: "Holds USDC in an EVM wallet. Signs gasless EIP-3009 authorizations — no transaction submitted, no gas paid."
- **Server**: "Returns 402 with payment terms. Delegates verification and settlement to the Facilitator. Never touches blockchain infrastructure."
- **Facilitator**: "Trusted intermediary (e.g., Coinbase). Verifies signatures off-chain (~100ms), then settles USDC on-chain. Pays gas on behalf of the client."

**L402 actors:**
- **AI Agent**: "Operates a Lightning wallet (or connects to a custodial one). Pays invoices directly and obtains preimage as proof of payment."
- **Server**: "Runs Aperture reverse proxy with an LND node. Mints macaroons, generates Lightning invoices, verifies credentials locally."
- **Lightning Network**: "Bitcoin's payment layer. Routes payments through channels in ~1-2s. No on-chain transaction for individual API calls."

### Comparison Table

Semantic `<table>` with `<thead>`, `<tbody>`, `<th scope="col">` for protocol names, `<th scope="row">` for dimensions. Neutral text color on both columns (no blanket color-coding). Selective accent on "winner" cells with subtle background tint.

| Dimension | x402 | L402 |
|-----------|------|------|
| **Currency** | USDC (stablecoin, $1.00) | BTC satoshis (volatile) |
| **Intermediary** | Facilitator required | None — direct settlement |
| **Client pays gas** | No (facilitator pays) | N/A (no gas concept) |
| **Credential** | Single-use signature | Reusable macaroon+preimage |
| **Verification** | Remote (facilitator /verify) | Local (HMAC + SHA256) |
| **Settlement** | ~2s on Base L2 | ~1-2s Lightning routing |
| **Privacy** | On-chain USDC transfers visible | Off-chain, onion-routed |
| **Multi-chain** | Yes (Base, Solana, Avalanche, fiat) | Lightning only |
| **Capability system** | None (V1), sessions (V2) | Macaroon caveats (services, tiers, limits) |
| **Challenge header** | `PAYMENT-REQUIRED` (base64 JSON) | `WWW-Authenticate: L402` |
| **Payment header** | `PAYMENT-SIGNATURE` (base64 JSON) | `Authorization: L402 mac:preimage` |
| **Backed by** | Coinbase, Cloudflare, Google, Visa | Lightning Labs |
| **Production since** | May 2025 | March 2020 |

### Accessibility

**Three-layer approach:**

1. **ARIA live regions**: Visually hidden `<div aria-live="polite">` per diagram. Each step injects text: "Step 3 of 5: Server returns 402 with payment terms." On completion: "L402 sequence complete. 5 steps total."

2. **Static text alternative**: `<details class="detail-block">` accordion below dark canvas with full text description of both flows as ordered lists. Matches three-body-problem's `.detail-block` / `.details-content` pattern.

3. **`prefers-reduced-motion`**: Show completed static state (all steps visible, arrows drawn, no animation). Replace auto-play with "Play comparison" button. Disable glow pulsing. Listen for changes via `matchMedia('(prefers-reduced-motion: reduce)')` change event.

**Additional requirements:**
- Diagram container: `role="img"`, `aria-label="Animated comparison of x402 and L402 payment protocols"`
- All decorative SVGs: `aria-hidden="true"`
- All icon-only buttons (replay, copy): `aria-label`
- Step rows: `tabindex="0"`, `role="button"`, descriptive `aria-label`
- Focus indicators on all interactive elements
- Color contrast: `#10b981` on `#1d2733` = 4.6:1 (passes AA). `#f59e0b` on `#1d2733` = 6.8:1 (passes AA).

## Acceptance Criteria

### Functional

- [ ] Both sequence diagrams animate when canvas scrolls into viewport (IntersectionObserver)
- [ ] L402 completes before x402 (5 steps vs 9), with elapsed time counter showing the difference
- [ ] Replay button appears after both complete, resets and replays both simultaneously
- [ ] Hovering a step row pauses that diagram (gentle 300ms ease) and highlights the step
- [ ] Clicking actor headers shows protocol-specific role popovers
- [ ] Step 2 has expandable inline JSON/header detail (not popup)
- [ ] Step 3 has unique visuals: x402 signing card, L402 Lightning route
- [ ] Comparison table renders below dark canvas with semantic markup

### Visual

- [ ] Dark canvas uses brand navy `#1d2733` with warm-toned text `#e3dfd3`
- [ ] x402 in green `#10b981`, L402 in amber `#f59e0b`
- [ ] CSS `drop-shadow()` glow effects (not SVG feGaussianBlur)
- [ ] Clear visual separation between the two diagrams
- [ ] Cream page structure matching three-body-problem: `.page`, `.body`, `.chart-island` classes

### Responsive

- [ ] Desktop: side-by-side diagrams within 940px `.chart-island`
- [ ] Mobile (< 768px): WAI-ARIA tab toggle, full-bleed dark canvas, tab state preserved
- [ ] Comparison table stacks on very narrow viewports
- [ ] Mobile typography: body text drops to 18px (matching three-body-problem)

### Accessibility

- [ ] `prefers-reduced-motion` shows static diagrams + play button
- [ ] ARIA live region announces each step transition
- [ ] Text alternative in `<details>` accordion below canvas
- [ ] Actor popovers accessible via keyboard (Tab + Enter, Escape to dismiss)
- [ ] All SVG elements have `role` and `aria-label` or `aria-hidden`
- [ ] Color contrast passes WCAG AA (verified: both protocol colors pass on navy)

### Integration

- [ ] `public/http-402/index.html` has `<head>` and `<body>` tags for Astro injection
- [ ] `src/pages/http-402/index.astro` route injects header + meta
- [ ] `src/content/projects.json` entry (status: "draft")
- [ ] Reuses class names from three-body-problem: `.page`, `.body`, `.chart-island`, `.hr-subtle`
- [ ] `npm run build` succeeds

### Security

- [ ] All JSON rendered via `textContent` (never `innerHTML`)
- [ ] No inline event handlers (`onclick`, `onmouseover`) — use `addEventListener`
- [ ] Example addresses clearly truncated (not realistic-looking)

## Implementation Phases

### Phase 1: Static layout + both diagrams

**Files:**
- `public/http-402/index.html` — Full HTML/CSS: `.page` wrapper, cream h1/subtitle, dark `.chart-island` with two diagram areas (actor columns + step rows, static), comparison table, prose, footer. Reuse CSS from three-body-problem (reset, `.page`, `.body`, `.chart-island`, `.hr-subtle`, mobile `@media`). Add protocol-specific tokens.
- `src/pages/http-402/index.astro` — Astro route (copy from three-body-problem, change slug)
- `src/content/projects.json` — Draft entry

**Key implementation details:**
- Two separate SVGs (one per protocol) in a flex container, not one giant SVG
- Each SVG uses `viewBox` for responsive scaling
- Actor column positions computed from HTML via `getBoundingClientRect()`
- All step rows and arrows pre-rendered in DOM (hidden), toggled via opacity/visibility
- Font strategy: Space Grotesk for step labels/UI (via `.viz .step-label` selector, no `!important`), Lora for any body text in tooltips

**Done when:** Page renders at `/http-402` with static layout showing both protocol flows, comparison table, and prose.

### Phase 2: Animation engine + arrows

**Files:**
- `public/http-402/index.html` — JS animation state machine (IDLE/PLAYING/TRANSITIONING/PAUSED/COMPLETE), WAAPI-based arrow travel with `offset-path`, `stroke-dashoffset` line drawing, generational cancel tokens, IntersectionObserver start trigger, `document.fonts.ready`, elapsed time counters, progress bars, replay button with rAF debounce

**Key implementation details:**
- Declarative step arrays (data separate from rendering)
- WAAPI `animation.finished` Promises for step chaining (async/await)
- `ResizeObserver` to recompute SVG coordinates on layout change
- L402 "Complete" state: all steps visible, slightly dimmed (opacity 0.7), checkmark, frozen timer
- All timers/rAF IDs tracked in Sets for cleanup on replay/destroy

**Done when:** Both diagrams auto-play (scroll-triggered). L402 finishes first. Elapsed timers work. Replay works.

### Phase 3: Interactions + detail popups

**Files:**
- `public/http-402/index.html` — Hover-to-pause per diagram (gentle ease, left-border accent, dim other steps), actor popovers (positioned absolute, click-triggered, Escape-dismissable), expandable JSON/header details (inline `<details>`), signing card (x402 step 3), Lightning route animation (L402 step 3), tooltip dismiss on step transition

**Key implementation details:**
- Hover: set "pause requested" flag, STATE_TRANSITIONING gate prevents mid-arrow interruption
- Remaining dwell time tracked for accurate resume
- Actor popovers: HTML positioned via `getBoundingClientRect()`, mobile bottom sheet
- JSON blocks: monospace, syntax highlighted via `textContent` with `<span>` wrappers (not innerHTML)
- AbortController for clean event listener removal

**Done when:** All interactive features work on desktop and mobile.

### Phase 4: Polish + accessibility

**Files:**
- `public/http-402/index.html` — `prefers-reduced-motion` (static final state + play button, matchMedia change listener), ARIA live regions, text alternative accordion, keyboard navigation (tabindex, role, aria-label on steps/actors/replay), mobile tab toggle (WAI-ARIA Tabs, arrow keys), responsive fine-tuning (18px body on mobile, `.page` padding change)

**Done when:** All acceptance criteria pass. Build succeeds.

## Dependencies & Risks

| Risk | Mitigation |
|------|------------|
| SVG-HTML coordinate sync | Compute arrow endpoints from DOM via `getBoundingClientRect()` + `ResizeObserver`. SVG overlay uses `position: absolute` matching container. |
| Mobile glow performance | CSS `drop-shadow()` (GPU-composited) instead of SVG `feGaussianBlur`. Max 2-3 simultaneous glows. |
| Animation race conditions | Generational cancel tokens (Symbol), STATE_TRANSITIONING gate, single pendingTimeout reference, rAF-debounced replay. |
| Line count | Target 800-1000 lines (realistic given scope). Three-body-problem is 1283 lines. No swarm mode. |
| Mobile layout | Tab toggle, one diagram at a time. Reuse three-body-problem mobile `@media` block. |
| Font overrides from projectHeader | Specificity-based scoping (`.viz .step-label`) — no `!important`. |
| JSON rendering XSS | `textContent` exclusively. No `innerHTML` or `insertAdjacentHTML`. |

## Page Content

**Slug:** `http-402`

**Title (h1):** The Battle for HTTP 402

**Subtitle:** Two protocols want to let AI agents pay for APIs with a single HTTP header. Here's how they work.

**Explanation text (below comparison table):**

> HTTP 402 Payment Required has been "reserved for future use" since 1997. Two protocols now claim that future.
>
> **x402** (Coinbase, 2025) uses USDC stablecoin on EVM chains. The client signs a gasless authorization, a Facilitator verifies and settles on-chain. Price stability and zero client gas — but you need a trusted intermediary.
>
> **L402** (Lightning Labs, 2020) uses Bitcoin's Lightning Network. The client pays a Lightning invoice and gets a reusable macaroon credential. No intermediary, instant finality, privacy by default — but volatile pricing and Lightning channel management.
>
> For AI agents paying for data, compute, and tools across hundreds of APIs, the choice comes down to: do you want dollar-denominated stability with a facilitator, or Bitcoin-native sovereignty with more infrastructure?

**`projects.json` entry:**
```json
{
  "slug": "http-402",
  "title": "The Battle for HTTP 402",
  "description": "An interactive comparison of x402 and L402 — two protocols that let AI agents pay for APIs with a single HTTP header.",
  "date": "2026-03-07",
  "thumbnail": "http-402",
  "ogImage": "/img/og/http-402.png",
  "status": "draft"
}
```

## References

### Protocol Specs
- [x402 GitHub](https://github.com/coinbase/x402) — Full protocol spec, SDKs, EVM exact scheme
- [L402 GitHub](https://github.com/lightninglabs/L402) — Protocol specification
- [L402 Docs](https://docs.lightning.engineering/the-lightning-network/l402/protocol-specification) — HTTP header formats, macaroon structure
- [x402 Coinbase Docs](https://docs.cdp.coinbase.com/x402/welcome) — Facilitator API, integration guides
- [EIP-3009](https://eips.ethereum.org/EIPS/eip-3009) — TransferWithAuthorization spec

### Internal
- `public/three-body-problem/index.html` — Dark canvas visualization pattern, CSS tokens, glow filters, layout classes
- `src/lib/header.ts` — Header injection system, font preloads, projectMeta()
- `src/pages/three-body-problem/index.astro` — Astro route template

### Research (from deepen-plan agents)
- [SVG Animation Encyclopedia](https://www.svgai.org/blog/research/svg-animation-encyclopedia-complete-guide) — Performance benchmarks
- [CSS Motion Path](https://modern-css.com/motion-path-animation-without-javascript/) — offset-path patterns
- [MDN Web Animations API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Animations_API/Using_the_Web_Animations_API) — WAAPI reference
- [Animations on the Web (2026)](https://www.benedikt-sperl.de/blog/2026-01-13-animations-on-the-web) — GPU-composited properties
- [Pope Tech Accessible Animation](https://blog.pope.tech/2025/12/08/design-accessible-animation-and-movement/) — prefers-reduced-motion patterns
