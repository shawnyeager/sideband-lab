---
date: 2026-03-08
topic: communication-lines
---

# Sequence Diagram Lifelines for HTTP 402 Visualization

## What we're building

Replace the current floating horizontal arrows with a proper sequence-diagram layout: persistent vertical lifelines dropping from each actor name, with connection dots marking involvement at each step. Horizontal arrows animate between the dots. When the sequence completes, the dots remain as a visual summary — creating a "communication fingerprint" that immediately shows how many actors each protocol requires.

## Why this approach

- **The problem is spatial.** Current arrows draw in empty space with no visual anchor to the actor columns above. A reader has to read the "Agent → Server" text label to know who's communicating — the animation doesn't tell them.
- **Sequence diagrams are a known pattern.** Vertical lifelines with horizontal messages is the UML sequence diagram idiom. The audience (founders, builders, engineers) already reads this pattern. No learning curve.
- **The dots create a visual argument.** When both timelines finish, x402 shows dots spread across three columns (heavy Facilitator involvement); L402 shows dots concentrated on two columns. The difference is visible at a glance — the visualization makes its thesis without words.
- **Minimal structural change.** The `.actor-line` elements already exist. The SVG overlay already positions elements relative to actor X coordinates. This is an enhancement of the existing system, not a rebuild.

## Key decisions

- **Lifeline visibility:** Increase `.actor-line` from 10% opacity (`--viz-line`) to ~18% — visible enough to trace but not competing with content
- **Connection dots:** SVG circles (r=3.5) placed at each involved actor's X position at each step's Y position. Use protocol color (cyan for x402, amber for L402). Active dot = full opacity; completed = 0.5 opacity; future = not rendered yet
- **Horizontal arrows stay:** The stroke-dasharray line-drawing animation and traveling dot continue to work. The traveling dot bridges between the stationary connection dots
- **Dots persist after completion:** `markComplete()` clears horizontal lines but keeps connection dots. This creates the visual summary
- **No layout restructuring:** Step rows keep their current flex layout (`[num] [arrow-text] [label]`). The arrow-text remains for accessibility and as a redundant channel. The visual and the text reinforce each other
- **Self-actions (from === to):** Steps like "Sign EIP-3009 auth" get a single dot on their actor's lifeline, no horizontal arrow. A subtle pulse animation marks the local action

## Open questions

None — design decisions are resolved.
