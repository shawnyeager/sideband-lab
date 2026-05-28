---
title: "Refactor: Deterministic entity scoring"
type: refactor
status: active
date: 2026-03-04
---

# Refactor: Deterministic entity scoring

## Overview

Replace the current LLM-as-judge scoring pipeline with a two-stage architecture: LLM extracts structured facts from source material, then a deterministic function computes scores from those facts. The LLM never picks a number.

## Problem statement

The current `score-entities.mjs` asks Claude to read evidence and output `x_score` / `y_score` integers. This produces:

- **Non-reproducible scores**: Same entity, same URLs, different runs yield different numbers. MCP enterprise scored 85/90, then 65/75, then 55/65 across three runs with prompt tweaks.
- **Conflation errors**: The LLM scores the abstract spec instead of the specific deployment pattern (MCP enterprise got the same score as MCP spec).
- **Invisible reasoning**: The score is a black box. When a score drifts 40 points between runs, there's no way to tell which input signal changed vs. which was an LLM mood swing.
- **Prompt fragility**: Every scoring improvement requires prompt engineering, which is slow, expensive, and non-transferable.

## Proposed solution

Modeled on [OpenSSF Scorecard](https://github.com/ossf/scorecard): decompose each axis into sub-criteria (checks), have the LLM extract factual signals for each check, then compute scores deterministically.

### Architecture

```
Source URLs → Crawl → Evidence text
                          ↓
                    Extract (LLM)
                    Structured facts per check
                          ↓
                    Score (deterministic)
                    Sub-criteria → weighted sum → 0-100
                          ↓
                    Write DB + export
```

### Stage 1: Crawl (unchanged)

`fetchEvidence()` stays as-is. Fetches up to 5 URLs, strips HTML, returns text blocks.

### Stage 2: Extract (LLM → structured facts)

The LLM reads evidence and outputs a fixed JSON schema of factual signals. It never outputs a score. Each signal is a boolean, enum, or bounded integer that can be verified against the source text.

**X-axis signals (openness):**

| Check | Signal type | Question |
|-------|------------|----------|
| `spec_license` | enum: `proprietary`, `source-available`, `open-standard`, `public-domain` | What license governs the specification/protocol? |
| `governance` | enum: `single-company`, `consortium`, `neutral-foundation`, `no-governance` | Who controls the spec's evolution? |
| `permission_required` | boolean | Do you need an account, API key, or approval to use it? |
| `independent_implementations` | integer (0-99) | How many independent implementations exist? |
| `fork_modify_allowed` | boolean | Can anyone fork and modify without permission? |
| `tos_restrictions` | boolean | Are there ToS that restrict usage beyond the license? |

**Y-axis signals (distribution):**

| Check | Signal type | Question |
|-------|------------|----------|
| `deployment_model` | enum: `single-server`, `few-providers`, `federated`, `p2p-or-on-device` | Where does it physically run? |
| `operator_count` | enum: `one`, `2-5`, `6-50`, `50-plus`, `thousands-plus` | How many independent operators run this? |
| `single_point_of_failure` | boolean | If one company's servers go down, does everything stop? |
| `self_hostable` | boolean | Can anyone run their own instance? |
| `works_offline` | boolean | Does it function without internet connectivity? |
| `central_coordination_required` | boolean | Is a central authority required for ongoing operation? |

Each signal includes a `citation` field: the substring from source text that supports the answer. If no evidence exists for a signal, the LLM returns `null` (not a guess).

**Extraction prompt structure:**

```
Given evidence about {entity} ({description}), extract these factual signals.
For each signal, provide the value AND a direct quote from the evidence.
If the evidence doesn't address a signal, set it to null.
Do NOT infer, estimate, or guess. Only report what the evidence explicitly states.

{schema}

Respond as JSON matching this exact schema.
```

### Stage 3: Score (deterministic formula)

Each signal maps to points via a lookup table. The formula is pure arithmetic — no LLM, no judgment.

**X-axis scoring:**

```javascript
const X_WEIGHTS = {
  spec_license:      { proprietary: 0, 'source-available': 15, 'open-standard': 30, 'public-domain': 35, _weight: 0.20 },
  governance:        { 'single-company': 0, consortium: 15, 'neutral-foundation': 30, 'no-governance': 35, _weight: 0.20 },
  permission_required: { true: 0, false: 30, _weight: 0.20 },
  independent_implementations: { /* 0→0, 1→5, 2-3→15, 4-10→25, 11+→30 */, _weight: 0.15 },
  fork_modify_allowed: { true: 25, false: 0, _weight: 0.15 },
  tos_restrictions:    { true: 0, false: 10, _weight: 0.10 },
};
// weighted_sum / max_possible * 100 → X score
```

**Y-axis scoring:**

```javascript
const Y_WEIGHTS = {
  deployment_model:   { 'single-server': 0, 'few-providers': 10, federated: 25, 'p2p-or-on-device': 35, _weight: 0.25 },
  operator_count:     { one: 0, '2-5': 8, '6-50': 18, '50-plus': 28, 'thousands-plus': 35, _weight: 0.25 },
  single_point_of_failure: { true: 0, false: 25, _weight: 0.20 },
  self_hostable:      { true: 15, false: 0, _weight: 0.10 },
  works_offline:      { true: 15, false: 0, _weight: 0.10 },
  central_coordination_required: { true: 0, false: 15, _weight: 0.10 },
};
```

**Null handling:** If a signal is null (no evidence), exclude it from both numerator and denominator. The score is computed from available evidence only. Flag entities with >40% null signals for editorial review.

**Confidence output:** Each score includes:
- `signal_coverage`: fraction of non-null signals (e.g., 10/12 = 0.83)
- `null_signals`: list of signals that couldn't be extracted
- `citations`: map of signal → source quote

### Changes to `score-entities.mjs`

- [ ] Define signal schemas as JSON Schema objects (for Claude's structured output)
- [ ] Replace `buildPrompt()` with `buildExtractionPrompt()` — asks for signals, not scores
- [ ] Replace `scoreEntity()` with `extractSignals()` — calls Claude with structured output schema
- [ ] Add `computeScore(signals, weights)` — pure function, no API calls
- [ ] Add `buildReasoning(signals, weights)` — generates human-readable reasoning from scored signals
- [ ] Update `writeScore()` to also store raw signals (new `extracted_signals` jsonb column on `score_history`)
- [ ] Keep `--dry-run` flag, add `--extract-only` flag to see raw signals without scoring

### DB changes

- [ ] Add `extracted_signals` jsonb column to `score_history` table
- [ ] Store the full extraction output for auditability

### Verification

After implementation:

1. Run extraction on 5 entities across different layers, inspect raw signals
2. Compare deterministic scores against current production scores — expected drift is fine, but directional agreement should hold (closed things should still score low-X, distributed things high-Y)
3. Run twice on the same entity — scores must be identical given identical source evidence
4. Run `npm run build` succeeds

## Acceptance criteria

- [ ] LLM never outputs a score — only structured facts
- [ ] Same evidence in, same score out (deterministic)
- [ ] Each score can be explained as "signal X contributed N points because [citation]"
- [ ] Null signals are flagged, not guessed
- [ ] Existing CLI interface preserved (`--layer`, `--id`, `--dry-run`)
- [ ] Scores directionally agree with current production values (no axis-level inversions)

## References

- Current scorer: `scripts/score-entities.mjs`
- OpenSSF Scorecard (reference architecture): https://github.com/ossf/scorecard
- Entity data shape: `data/map-entities.json`
