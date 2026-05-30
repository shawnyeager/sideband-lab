# Product

## Register

brand

## Users

Founders, builders, and investors tracking shifts in AI and agent infrastructure. They are technically literate: they already know what an API is, what Lightning is, what a stablecoin is. They arrive from the Sideband newsletter (sideband.pub) to see an idea made tangible, not explained from scratch. They have little patience for preamble and a strong nose for sales pitch. The win is when one of them sees a pattern they had not seen before and sends it to a peer.

## Product Purpose

Sideband Lab (lab.sideband.pub) is a collection of interactive projects that accompany the Sideband newsletter. Each project takes one complex idea in AI and agent infrastructure and makes its underlying pattern visible through interaction: a force simulation, an explorable dataset, an animated sequence. The lab maps territory. It finds structure in fast-moving, messy systems and makes that structure legible. Success is comprehension and circulation: a visitor understands something faster than prose could have told them, and wants to share it.

## Brand Personality

Sharp, curious, structural. The lab assumes intelligence and does not dumb things down. No thought-leadership posturing, no growth-hack energy, no decoration for its own sake. The voice is claim-first and specific: it states what a thing reveals, not what it is, and never describes its own format ("an interactive comparison of..."). Copy canon lives in VOICE.md. Key rules: em dashes have no spaces in project copy (`word—word`), no CTAs or reader-addressing, no hedging, short and punchy and concrete. Featured copy passes the humanizer before it ships.

## Anti-references

- **Startup marketing.** Gradient blobs, hero illustrations, floating UI mockups, "Schedule a demo" energy.
- **Dashboard SaaS.** Dense metric-tile grids, sidebar navs, the big-number-with-tiny-label hero template.
- **Generic AI-tool aesthetics.** Neon-on-black, glassmorphism, the interchangeable "AI product" look.
- **Decoration without meaning.** Any element that does not make something clearer does not belong.

## Design Principles

1. **No decoration.** Every visual element earns its place by making something clearer. If it does not carry meaning, it is cut.
2. **Interaction over illustration.** Show the system working, not a picture of the system. Animated sequences, force simulations, and explorable data beat static infographics.
3. **The visualization is the argument.** The prose frames it, the data proves it. If the visualization does not change what the reader understands, it failed.
4. **Respect the reader's time and intelligence.** Fast load, immediate clarity, no preamble, no hand-holding. The thesis lands within seconds of the first scroll.
5. **Shared shell, sovereign content.** The header and footer are shared and quiet (cream, #EEEBE4). Each project owns its content canvas and its tools (D3, React, Svelte, vanilla JS, WebGL, whatever the idea demands). Dark visualization islands (#1D2733) live as deliberate contrast inside the warm shell.

## Accessibility & Inclusion

- Target WCAG 2.1 AA contrast across text and meaningful UI.
- Honor `prefers-reduced-motion`: animations, transitions, and force simulations degrade to a static or settled state.
- Interactions are keyboard navigable, with visible focus indicators.
- Light mode only. The cream background is the brand; there is no dark mode. (Visualizations may use dark islands, but the shell stays light.)
