---
name: Sideband Lab
description: Interactive visual essays that map AI and agent infrastructure
colors:
  cream-paper: "#EEEBE4"
  ink: "#393A3A"
  ink-muted: "#6B6966"
  ink-sub: "#9A9793"
  rule: "#D5D2CB"
  rule-header: "#D6D4CD"
  cyan: "#0EA5C9"
  cyan-light: "#38BDF8"
  amber: "#A97C40"
  amber-light: "#C9A050"
  mid-green: "#5B9B84"
  signal-red: "#D4716B"
  cta-ink: "#075570"
  navy-island: "#1D2733"
  navy-light: "#243040"
  viz-text: "#E3DFD3"
  viz-num: "#A8B8C8"
typography:
  display:
    fontFamily: "Roboto Slab, Georgia, 'Times New Roman', serif"
    fontSize: "clamp(1.75rem, 4vw, 2.75rem)"
    fontWeight: 700
    lineHeight: 1.15
    letterSpacing: "0.01em"
  headline:
    fontFamily: "Roboto Slab, Georgia, serif"
    fontSize: "clamp(1.35rem, 2.5vw, 1.65rem)"
    fontWeight: 700
    lineHeight: 1.15
  title:
    fontFamily: "Roboto Slab, Georgia, serif"
    fontSize: "1.125rem"
    fontWeight: 700
    lineHeight: 1.15
  body:
    fontFamily: "Lora, Georgia, 'Times New Roman', serif"
    fontSize: "20px"
    fontWeight: 400
    lineHeight: 1.65
  label:
    fontFamily: "Space Grotesk, system-ui, -apple-system, sans-serif"
    fontSize: "14px"
    fontWeight: 500
    lineHeight: 1.2
    letterSpacing: "0.05em"
  mono:
    fontFamily: "SF Mono, 'Cascadia Code', 'Fira Code', monospace"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.5
rounded:
  sm: "4px"
spacing:
  xs: "0.5rem"
  sm: "1rem"
  md: "1.5rem"
  lg: "3rem"
  xl: "5rem"
components:
  cta:
    backgroundColor: "{colors.cyan}"
    textColor: "{colors.cta-ink}"
    rounded: "{rounded.sm}"
    padding: "5px 14px"
    typography: "{typography.label}"
  cta-hover:
    backgroundColor: "{colors.cyan}"
    textColor: "{colors.cta-ink}"
  filter-chip:
    textColor: "{colors.ink}"
    rounded: "{rounded.sm}"
    padding: "5px 14px"
    typography: "{typography.label}"
  card:
    backgroundColor: "{colors.cream-paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.sm}"
    padding: "1.5rem"
---

# Design System: Sideband Lab

## 1. Overview

**Creative North Star: "The Cartographer's Table"**

Sideband Lab is a working surface, not a showroom. The shell is warm cream paper (#EEEBE4): quiet, matte, the color of a field map left on a table. The instruments are laid out with intent (serif prose, slab-serif labels, hairline rules), and the maps themselves are dark plotted charts (#1D2733 navy islands) set into the paper as deliberate cold contrast. The lab's job is to map territory: to find structure in fast-moving AI and agent infrastructure and make that structure legible at a glance. Every surface should feel like a cartographer's bench, precise and unfussy, where the data is the only thing allowed to be loud.

The system runs in two registers held in tension. The **shell** is calm: cream background, dark ink (#393A3A), one hairline divider weight, almost no shadow. The **visualization islands** are dense: navy canvas, light readout text (#E3DFD3), layer-colored data points, a dashed diagonal. The contrast between the warm paper and the cold chart is the whole identity. Neither register decorates; the shell frames the argument, the island proves it.

This system explicitly rejects startup-marketing gloss (gradient blobs, floating hero illustrations, "Schedule a demo" energy), dashboard-SaaS density (metric-tile grids, sidebar navs, the big-number hero), and the interchangeable AI-tool look (neon on black, glassmorphism). If an element does not make something clearer, it is cut.

**Key Characteristics:**
- Warm cream paper shell, cold navy data islands, nothing in between.
- Slab-serif display (Roboto Slab), serif body (Lora), sans labels (Space Grotesk).
- Flat by default: one hairline rule weight, depth only inside the dark islands.
- Light mode only. The cream background is the brand.
- Color is meaning: each accent maps to a layer or a signal, never to decoration.

## 2. Colors

A warm, low-chroma paper base carrying a small set of meaning-bearing accents; the palette never spends color it has not earned.

### Primary
- **Signal Cyan** (#0EA5C9): The lab's primary accent and interactive color. Carries calls-to-action (as a translucent fill with deep-cyan ink, #075570), links, and the "compute" layer in data viz. Used sparingly against cream so it always reads as "this is live."
- **Sky Cyan** (#38BDF8): Lighter cyan partner for a second data series or a brighter on-navy plot point.

### Secondary
- **Field Amber** (#A97C40): The warm counter-accent, drawn from the same earth family as the paper. Marks the "payments" layer and warm-toned series; pairs with cream without clashing.
- **Pale Amber** (#C9A050): Lighter amber for a second warm series or an insight card keyed to the amber family.

### Tertiary
- **Survey Green** (#5B9B84): A muted topographic green for a third data role (the "discovery" layer). Quiet enough to sit beside cyan and amber without competing.
- **Signal Red** (#D4716B): Reserved strictly for warnings and danger states (failure, alert). Never decorative; its rarity is its meaning.

### Neutral
- **Cream Paper** (#EEEBE4): The page and header background. The brand's resting surface.
- **Ink** (#393A3A): Primary body and heading text on cream. Never pure black.
- **Ink Muted** (#6B6966): Secondary text, captions, supporting copy.
- **Ink Sub** (#9A9793): Tertiary text, fine print, axis minor labels.
- **Rule** (#D5D2CB) / **Header Rule** (#D6D4CD): The single hairline divider weight for content and for the header's 1px bottom border.

### Island Neutrals (dark visualization surfaces)
- **Navy Island** (#1D2733): The visualization canvas. The cold register.
- **Navy Light** (#243040): Raised surfaces inside an island (cards, tooltips, plot area).
- **Readout Text** (#E3DFD3) / **Readout Number** (#A8B8C8): Light text and numerals on navy.

### Named Rules
**The Earned Color Rule.** On the cream shell, accents stay under ~10% of the surface; a Restrained strategy. Inside a dark visualization island the rules invert: color becomes a full categorical palette where every hue is a layer or a series, used deliberately. Color outside those two jobs (accent on the shell, category in the island) is forbidden.

**The Red-Means-Danger Rule.** Signal Red (#D4716B) appears only for failure and warning. It is never a fourth decorative accent.

## 3. Typography

**Display Font:** Roboto Slab (with Georgia, Times New Roman fallback)
**Body Font:** Lora (with Georgia fallback)
**Label/UI Font:** Space Grotesk (with system-ui fallback)
**Mono Font:** SF Mono (with Cascadia Code, Fira Code fallback), for code and dense data readouts

**Character:** A field-manual pairing. Roboto Slab gives headings a structural, surveyed weight; Lora keeps long-form prose warm and readable; Space Grotesk handles labels, filters, and axis text with a clean technical edge. The three voices map to the three jobs: title, read, operate.

### Hierarchy
- **Display** (Roboto Slab 700, clamp(1.75rem, 4vw, 2.75rem), line-height 1.15, tracking 0.01em): Project and page titles.
- **Headline** (Roboto Slab 700, clamp(1.35rem, 2.5vw, 1.65rem), line-height 1.15): Section headings.
- **Title** (Roboto Slab 700, 1.125rem): Sub-section and card titles.
- **Body** (Lora 400, 20px, line-height 1.65): Long-form prose. Capped at the `--content-max` of 680px (roughly 65 to 75 characters).
- **Label** (Space Grotesk 500, 14px, letter-spacing 0.05em): Filters, axis labels, UI chrome, kickers. Track-spaced; uppercase only for short kickers, never for sentences.
- **Mono** (SF Mono 400, 15px): Code blocks and dense numeric readouts inside islands.

### Named Rules
**The Three-Voice Rule.** Slab serif titles, serif body, sans labels. Each font has one job. Do not set body copy in Space Grotesk or labels in Lora.

**The Caps-Are-Labels Rule.** All-caps and 0.05em tracking are reserved for short labels and kickers. Body copy is never set in caps.

## 4. Elevation

Flat by default. The cream shell has effectively no shadows: depth comes from a single hairline rule (#D5D2CB) and from spacing, not from lifting surfaces. The only place depth exists is inside the dark visualization islands, where one soft drop shadow and a colored glow lift plot points and tooltips off the navy.

### Shadow Vocabulary (islands only)
- **Island Shadow** (`box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3)`): Lifts tooltips and raised cards off the navy canvas.
- **Accent Glow** (`rgba(14, 165, 201, 0.4)` cyan, `rgba(184, 137, 63, 0.3)` amber, `rgba(212, 113, 107, 0.3)` red): A soft halo on active or hovered data points. Atmospheric, not structural.

### Named Rules
**The Flat Shell Rule.** Surfaces on the cream shell are flat. Separation is achieved with the hairline rule and whitespace, never with a drop shadow. Shadows live only inside the dark islands, and only to lift interactive plot elements.

## 5. Components

### Buttons
- **Shape:** Gently squared (4px radius, `--card-radius`).
- **Primary / CTA:** Translucent Signal Cyan fill (`rgba(14,165,201,0.18)`) with deep-cyan ink (#075570), Space Grotesk label, 5px by 14px padding. The fill is a tint of the accent, not a solid block, so it reads as quiet and live at once.
- **Hover / Focus:** Fill deepens (`rgba(14,165,201,0.30)`), active deepens further (`0.36`). Transitions are quick (150ms) and ease-out. Focus shows a visible ring; never remove focus without replacement.
- **Filter chips:** Transparent at rest with ink text and a layer-colored dot; selected state gains a faint tinted background and full-opacity text. Used for layer toggles in visualizations.

### Cards / Containers
- **Corner Style:** 4px radius.
- **Background:** Transparent or cream by default (`--card-bg: transparent`); cards earn a fill only when grouping genuinely needs it.
- **Shadow Strategy:** None on the shell (see Elevation). Flat.
- **Border:** A single hairline (#D5D2CB). No colored side-stripes, ever.
- **Internal Padding:** `--space-md` (1.5rem). Max width `--card-max` of 480px for readable measure.

### Navigation (header)
- **Style:** Full-bleed cream bar, 56px tall (44px on mobile), with a 28px Sideband icon and a 1px bottom border (#D6D4CD). Quiet and fixed; it frames, it does not announce.
- **Typography:** Space Grotesk labels.
- **States:** Hover and focus shift opacity and color subtly; the header never competes with the project canvas below it.

### Rules / Dividers
- **Style:** One hairline weight (#D5D2CB, with #E0DDD6 as a subtler variant). Equal gaps inside a title group, a clear break before the visualization island.

### Signature Component: The Visualization Island
- **Canvas:** Navy (#1D2733), set into the cream page as a distinct cold region with a 4px radius.
- **Readout:** Light text (#E3DFD3) and numerals (#A8B8C8); layer-colored data points (cyan, sky, amber, pale amber, green); a dashed reference diagonal.
- **Interaction:** Points glow on hover or pin (Accent Glow); tooltips ride on Navy Light (#243040) with the Island Shadow. Filters live as chips above the canvas.
- **Behavior:** The island is sovereign. Each project may build it in D3, React, Svelte, vanilla JS, or WebGL. The shell stays constant; the island owns its tools.

## 6. Do's and Don'ts

### Do:
- **Do** keep the shell flat: separate with the hairline rule (#D5D2CB) and whitespace, not shadows.
- **Do** use design tokens from `global.css` (`--space-*`, `--text`, `--cyan`, `--font-display`). If a value is worth using twice, it is a token. Never inline a magic number.
- **Do** let color carry meaning: an accent is a layer or a signal, never a flourish. Inside an island, use the full categorical palette; on the shell, stay under ~10% accent.
- **Do** set the three voices to their jobs: Roboto Slab titles, Lora body, Space Grotesk labels.
- **Do** reserve all-caps and 0.05em tracking for short labels and kickers.
- **Do** write copy claim-first and specific. Em dashes in project copy have no spaces (`word—word`). No CTAs, no reader-addressing, no hedging. (See VOICE.md.)
- **Do** honor `prefers-reduced-motion`: animations and force simulations settle to a static state. Target WCAG AA contrast.

### Don't:
- **Don't** reach for startup-marketing gloss: gradient blobs, floating hero illustrations, "Schedule a demo" energy.
- **Don't** build dashboard-SaaS density: metric-tile grids, sidebar navs, or the big-number-with-tiny-label hero template.
- **Don't** use the interchangeable AI-tool look: neon-on-black, decorative glassmorphism, gradient text.
- **Don't** use a colored `border-left` or `border-right` greater than 1px as a stripe on cards, callouts, or list items. Use a full hairline border or nothing.
- **Don't** add decoration. If an element does not make something clearer, delete it.
- **Don't** add a dark mode. Light only; the cream background is the brand. (Dark belongs only inside visualization islands.)
- **Don't** spend Signal Red on anything but danger and failure.
