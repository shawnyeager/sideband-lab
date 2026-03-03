#!/usr/bin/env node

// Load .env if present (Node 21+ built-in)
try { process.loadEnvFile(); } catch {}

import { createClient } from '@supabase/supabase-js';
import Anthropic from '@anthropic-ai/sdk';
import { parseArgs } from 'node:util';

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------

const { values: flags } = parseArgs({
  options: {
    layer:    { type: 'string' },
    id:       { type: 'string' },
    'dry-run': { type: 'boolean', default: false },
  },
  strict: true,
});

const dryRun = flags['dry-run'];

// ---------------------------------------------------------------------------
// Env
// ---------------------------------------------------------------------------

const SUPABASE_URL = process.env.SUPABASE_MAP_URL;
const SUPABASE_KEY = process.env.SUPABASE_MAP_SERVICE_ROLE_KEY;
const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY;

const missing = [];
if (!SUPABASE_URL)  missing.push('SUPABASE_MAP_URL');
if (!SUPABASE_KEY)  missing.push('SUPABASE_MAP_SERVICE_ROLE_KEY');
if (!ANTHROPIC_KEY) missing.push('ANTHROPIC_API_KEY');
if (missing.length) {
  console.error(`Missing env vars: ${missing.join(', ')}`);
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const anthropic = new Anthropic({ apiKey: ANTHROPIC_KEY });

// ---------------------------------------------------------------------------
// Rubric (embedded from build spec)
// ---------------------------------------------------------------------------

const RUBRIC = `X Axis: Closed (0) to Open (100) — Who decides if you can participate?

| Score | Label | Criteria | Diagnostic test |
|-------|-------|----------|-----------------|
| 0-20 | Closed | Single entity controls access, pricing, rules, and can revoke at will. Proprietary spec or no spec. | Can you use this without one company's agreement? No. |
| 20-40 | Gated | Multiple vendors or open-ish spec, but participation requires approval or ecosystem buy-in. | Could a solo dev ship on this in a weekend without asking? Unlikely. |
| 40-60 | Mixed | Open spec, but practical usage involves controlled components: auth layers, hosting, compliance. | Open spec AND usable without a controlled dependency? Partially. |
| 60-80 | Open-governed | Open spec under neutral governance (IETF, Linux Foundation, W3C). Anyone can implement. | Neutral governance body AND multiple independent implementations? Yes. |
| 80-100 | Permissionless | No permission needed. No account, no API key, no ToS. Fork it, run it, modify it. | Use it right now with zero interaction with any organization? Yes. |

Y Axis: Centralized (0) to Distributed (100) — Where does it run and who operates it?

| Score | Label | Criteria | Diagnostic test |
|-------|-------|----------|-----------------|
| 0-20 | Centralized | One company's infrastructure. Single point of failure. One operator. | Company's servers go down, everything stops? Yes. |
| 20-40 | Hosted | Shared infrastructure, small number of providers. Self-hosting possible but rare. | Fewer than 5 meaningful operators? Yes. |
| 40-60 | Federated | Multiple independent operators, compatible infrastructure. No single point of failure. | 10+ independent parties operate without coordinating? Getting there. |
| 60-80 | Multi-operator | Many independent operators. No single entity required. Some concentration remains. | Top 3 operators vanish, keeps working? Probably. |
| 80-100 | Fully distributed | Thousands+ independent nodes. No privileged operator. Peer-to-peer or on-device. | Works offline or on peer mesh, no central coordination? Yes. |`;

// ---------------------------------------------------------------------------
// Evidence fetching
// ---------------------------------------------------------------------------

const FETCH_TIMEOUT = 10_000;
const MAX_URLS = 5;
const MAX_PER_URL = 8_000;
const MAX_EVIDENCE = 40_000;

function stripHtml(html) {
  return html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

async function fetchEvidence(sourceUrls) {
  const urls = (sourceUrls || []).slice(0, MAX_URLS);
  const results = [];
  const failed = [];

  for (const url of urls) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT);
      const res = await fetch(url, {
        signal: controller.signal,
        headers: { 'User-Agent': 'SidebandScorer/1.0' },
      });
      clearTimeout(timer);

      if (!res.ok) {
        failed.push({ url, reason: `HTTP ${res.status}` });
        continue;
      }

      const text = stripHtml(await res.text()).slice(0, MAX_PER_URL);
      results.push({ url, text });
    } catch (err) {
      failed.push({ url, reason: err.name === 'AbortError' ? 'timeout' : err.message });
    }
  }

  return { results, failed };
}

function buildEvidenceBlock(results, failed) {
  let block = '';
  for (const { url, text } of results) {
    block += `--- ${url} ---\n${text}\n\n`;
  }
  if (failed.length) {
    block += `[Failed to fetch: ${failed.map(f => `${f.url} (${f.reason})`).join(', ')}]\n`;
  }
  return block.slice(0, MAX_EVIDENCE);
}

// ---------------------------------------------------------------------------
// Scoring prompt
// ---------------------------------------------------------------------------

function buildPrompt(entity, layerName, evidence, previous) {
  let previousBlock = 'None (first score)';
  if (previous) {
    previousBlock = `X: ${previous.current_x} — ${previous.x_reasoning || 'no reasoning recorded'}
Y: ${previous.current_y} — ${previous.y_reasoning || 'no reasoning recorded'}`;
  }

  return `You are scoring an entity for the Sideband Agent-Era Infrastructure Map.

ENTITY: ${entity.full_name}
LAYER: ${layerName}

SOURCE MATERIAL:
${evidence}

PREVIOUS SCORE (if any):
${previousBlock}

RUBRIC:
${RUBRIC}

Score this entity on both axes. For each axis:
1. Apply each rubric level's diagnostic test
2. Identify which level best fits based on the evidence
3. Assign a specific score within that level's range
4. Cite specific evidence from the source material supporting your score

If this is a re-score, note what changed from the previous assessment and why.

Respond in this exact JSON format:
{
  "x_score": <integer 0-100>,
  "x_reasoning": "<reasoning with specific citations>",
  "y_score": <integer 0-100>,
  "y_reasoning": "<reasoning with specific citations>",
  "confidence_notes": "<anything uncertain or worth flagging for editorial review>",
  "change_summary": "<if re-score, what moved and why; null otherwise>"
}`;
}

// ---------------------------------------------------------------------------
// Claude API call
// ---------------------------------------------------------------------------

async function scoreEntity(prompt) {
  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-5-20250929',
    max_tokens: 2048,
    temperature: 0,
    messages: [{ role: 'user', content: prompt }],
  });

  const text = message.content[0]?.text;
  if (!text) throw new Error('Empty response from Claude');

  // Extract JSON from response (may be wrapped in markdown code fences)
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error(`No JSON found in response: ${text.slice(0, 200)}`);

  const parsed = JSON.parse(jsonMatch[0]);

  // Validate required fields
  if (typeof parsed.x_score !== 'number' || typeof parsed.y_score !== 'number') {
    throw new Error('Missing x_score or y_score in response');
  }
  if (parsed.x_score < 0 || parsed.x_score > 100 || parsed.y_score < 0 || parsed.y_score > 100) {
    throw new Error(`Scores out of range: x=${parsed.x_score}, y=${parsed.y_score}`);
  }

  return parsed;
}

// ---------------------------------------------------------------------------
// DB writes
// ---------------------------------------------------------------------------

async function writeScore(entity, result) {
  // Insert score_history row
  const { error: histErr } = await supabase.from('score_history').insert({
    entity_id: entity.id,
    x: result.x_score,
    y: result.y_score,
    x_reasoning: result.x_reasoning,
    y_reasoning: result.y_reasoning,
    change_note: result.change_summary || null,
    reviewed: false,
  });
  if (histErr) throw new Error(`score_history insert: ${histErr.message}`);

  // Update entity
  const { error: entErr } = await supabase.from('entities').update({
    current_x: result.x_score,
    current_y: result.y_score,
    x_reasoning: result.x_reasoning,
    y_reasoning: result.y_reasoning,
    scored_at: new Date().toISOString(),
    reviewed: false,
    updated_at: new Date().toISOString(),
  }).eq('id', entity.id);
  if (entErr) throw new Error(`entity update: ${entErr.message}`);
}

// ---------------------------------------------------------------------------
// Layer maturity computation
// ---------------------------------------------------------------------------

function euclidean(a, b) {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

function mean(arr) {
  return arr.reduce((s, v) => s + v, 0) / arr.length;
}

function stddev(arr) {
  const m = mean(arr);
  return Math.sqrt(arr.reduce((s, v) => s + (v - m) ** 2, 0) / arr.length);
}

function kmeans2(points) {
  // Deterministic init: sort by id, pick first two as initial centroids
  const sorted = [...points].sort((a, b) => a.id.localeCompare(b.id));
  let c0 = { x: sorted[0].x, y: sorted[0].y };
  let c1 = { x: sorted[1].x, y: sorted[1].y };
  let assignments = new Array(points.length).fill(0);

  for (let iter = 0; iter < 50; iter++) {
    // Assign
    const newAssign = points.map(p =>
      euclidean(p, c0) <= euclidean(p, c1) ? 0 : 1
    );

    // Check convergence
    if (newAssign.every((a, i) => a === assignments[i])) {
      assignments = newAssign;
      break;
    }
    assignments = newAssign;

    // Update centroids
    const g0 = points.filter((_, i) => assignments[i] === 0);
    const g1 = points.filter((_, i) => assignments[i] === 1);
    if (g0.length) c0 = { x: mean(g0.map(p => p.x)), y: mean(g0.map(p => p.y)) };
    if (g1.length) c1 = { x: mean(g1.map(p => p.x)), y: mean(g1.map(p => p.y)) };
  }

  const cluster0 = points.filter((_, i) => assignments[i] === 0);
  const cluster1 = points.filter((_, i) => assignments[i] === 1);
  const centroidDist = euclidean(c0, c1);
  const avgRadius0 = cluster0.length ? mean(cluster0.map(p => euclidean(p, c0))) : 0;
  const avgRadius1 = cluster1.length ? mean(cluster1.map(p => euclidean(p, c1))) : 0;

  return { c0, c1, assignments, cluster0, cluster1, centroidDist, avgRadius0, avgRadius1 };
}

function silhouette(points, assignments) {
  if (points.length < 2) return 0;
  const scores = points.map((p, i) => {
    const ownCluster = points.filter((_, j) => j !== i && assignments[j] === assignments[i]);
    const otherCluster = points.filter((_, j) => assignments[j] !== assignments[i]);

    if (!ownCluster.length || !otherCluster.length) return 0;

    const a = mean(ownCluster.map(q => euclidean(p, q)));
    const b = mean(otherCluster.map(q => euclidean(p, q)));
    return (b - a) / Math.max(a, b);
  });
  return mean(scores);
}

function computeMaturity(points) {
  const n = points.length;

  // Too few entities
  if (n < 4) {
    const spreadX = n > 1 ? stddev(points.map(p => p.x)) : 99;
    const spreadY = n > 1 ? stddev(points.map(p => p.y)) : 99;
    return {
      label: 'Wide open',
      note: `${n} entities, spread=${Math.round(spreadX)}/${Math.round(spreadY)}`,
    };
  }

  const spreadX = stddev(points.map(p => p.x));
  const spreadY = stddev(points.map(p => p.y));

  // Wide spread on either axis
  if (spreadX > 35 || spreadY > 35) {
    // Check if also no clean separation → Fragmenting
    if (n >= 4) {
      const km = kmeans2(points);
      const sil = silhouette(points, km.assignments);
      if (sil < 0.5) {
        return {
          label: 'Fragmenting',
          note: `silhouette=${sil.toFixed(2)}, spread=${Math.round(spreadX)}/${Math.round(spreadY)}`,
        };
      }
    }
    return {
      label: 'Wide open',
      note: `spread=${Math.round(spreadX)}/${Math.round(spreadY)}`,
    };
  }

  // k-means analysis
  const km = kmeans2(points);
  const sil = silhouette(points, km.assignments);
  const centerGap = points.filter(p => p.x >= 35 && p.x <= 65 && p.y >= 35 && p.y <= 65).length;

  // Splitting: two clear clusters
  if (sil >= 0.5 && km.centroidDist > 40 && centerGap <= 1) {
    return {
      label: 'Splitting',
      note: `silhouette=${sil.toFixed(2)}, centroid distance=${Math.round(km.centroidDist)}, center gap=${centerGap}, spread=${Math.round(spreadX)}/${Math.round(spreadY)}`,
    };
  }

  // Settling: single dominant cluster
  if (sil < 0.5 && spreadX < 25 && spreadY < 25) {
    return {
      label: 'Settling',
      note: `silhouette=${sil.toFixed(2)}, spread=${Math.round(spreadX)}/${Math.round(spreadY)}`,
    };
  }

  // Fragmenting: high spread, no clean separation
  if (spreadX > 30 || spreadY > 30) {
    return {
      label: 'Fragmenting',
      note: `silhouette=${sil.toFixed(2)}, spread=${Math.round(spreadX)}/${Math.round(spreadY)}`,
    };
  }

  // Fallback: Settling (moderate spread, no clean split)
  return {
    label: 'Settling',
    note: `silhouette=${sil.toFixed(2)}, spread=${Math.round(spreadX)}/${Math.round(spreadY)}`,
  };
}

async function computeLayerMaturity(layerKeys) {
  const results = {};

  for (const layerKey of layerKeys) {
    // Get ALL reviewed entities in this layer (not just scored ones)
    const { data: entities, error } = await supabase
      .from('entities')
      .select('id, current_x, current_y')
      .eq('layer', layerKey)
      .eq('reviewed', true);

    if (error) {
      console.error(`  Failed to fetch entities for layer ${layerKey}: ${error.message}`);
      continue;
    }

    if (!entities || entities.length === 0) {
      results[layerKey] = { label: 'Wide open', note: '0 entities' };
      continue;
    }

    const points = entities.map(e => ({ id: e.id, x: e.current_x, y: e.current_y }));
    const maturity = computeMaturity(points);
    results[layerKey] = maturity;

    if (!dryRun) {
      const { error: updateErr } = await supabase
        .from('layers')
        .update({
          computed_status: maturity.label,
          computed_status_note: maturity.note,
        })
        .eq('key', layerKey);
      if (updateErr) {
        console.error(`  Failed to update layer ${layerKey}: ${updateErr.message}`);
      }
    }
  }

  return results;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

// Fetch layers (for name lookup)
const { data: layers, error: layersErr } = await supabase
  .from('layers')
  .select('key, name')
  .order('sort_order');

if (layersErr) {
  console.error(`Failed to fetch layers: ${layersErr.message}`);
  process.exit(1);
}

const layerMap = Object.fromEntries(layers.map(l => [l.key, l.name]));

// Fetch entities to score
let query = supabase.from('entities').select('*');

if (flags.id) {
  query = query.eq('id', flags.id);
} else if (flags.layer) {
  query = query.eq('layer', flags.layer);
}

const { data: entities, error: entitiesErr } = await query;

if (entitiesErr) {
  console.error(`Failed to fetch entities: ${entitiesErr.message}`);
  process.exit(1);
}

let scored = 0;
let skipped = 0;
let errors = 0;
const affectedLayers = new Set();

for (const entity of entities) {
  const label = `${entity.full_name} (${entity.layer})`;

  // Skip if no source_urls
  if (!entity.source_urls || entity.source_urls.length === 0) {
    console.log(`SKIP  ${label} — no source_urls`);
    skipped++;
    continue;
  }

  console.log(`SCORE ${label}`);

  // 1. Fetch evidence
  const { results: evidenceResults, failed: evidenceFailed } = await fetchEvidence(entity.source_urls);

  if (evidenceResults.length === 0) {
    console.log(`  SKIP — all ${evidenceFailed.length} URLs failed`);
    for (const f of evidenceFailed) {
      console.log(`    ${f.url}: ${f.reason}`);
    }
    skipped++;
    continue;
  }

  if (evidenceFailed.length) {
    console.log(`  ${evidenceFailed.length} URL(s) failed:`);
    for (const f of evidenceFailed) {
      console.log(`    ${f.url}: ${f.reason}`);
    }
  }

  const evidence = buildEvidenceBlock(evidenceResults, evidenceFailed);

  // 2. Build previous score context
  const previous = (entity.current_x != null && entity.scored_at)
    ? entity
    : null;

  // 3. Build prompt & call Claude
  const prompt = buildPrompt(entity, layerMap[entity.layer] || entity.layer, evidence, previous);

  try {
    const result = await scoreEntity(prompt);
    console.log(`  x=${result.x_score} y=${result.y_score}`);
    if (result.change_summary) {
      console.log(`  change: ${result.change_summary}`);
    }

    // 4. Write to DB
    if (dryRun) {
      console.log(`  [dry-run] would write scores`);
    } else {
      await writeScore(entity, result);
      console.log(`  written (reviewed=false)`);
    }

    scored++;
    affectedLayers.add(entity.layer);
  } catch (err) {
    console.error(`  ERROR: ${err.message}`);
    errors++;
  }
}

// ---------------------------------------------------------------------------
// Layer maturity
// ---------------------------------------------------------------------------

const layerKeysToCompute = flags.id || flags.layer
  ? [...affectedLayers]
  : layers.map(l => l.key);

if (layerKeysToCompute.length > 0) {
  console.log('\nLayer maturity:');
  const maturityResults = await computeLayerMaturity(layerKeysToCompute);
  for (const [key, m] of Object.entries(maturityResults)) {
    const pad = (layerMap[key] || key).padEnd(12);
    console.log(`  ${pad} ${m.label.padEnd(13)} (${m.note})`);
  }
}

// ---------------------------------------------------------------------------
// Export snapshot
// ---------------------------------------------------------------------------

if (!dryRun && scored > 0) {
  const { execFileSync } = await import('node:child_process');
  const { fileURLToPath } = await import('node:url');
  const { dirname, join } = await import('node:path');
  const scriptDir = dirname(fileURLToPath(import.meta.url));
  try {
    execFileSync('node', [join(scriptDir, 'export-map-data.mjs')], { stdio: 'inherit' });
  } catch {
    console.error('Warning: data export failed');
  }
}

// ---------------------------------------------------------------------------
// Summary
// ---------------------------------------------------------------------------

const total = entities.length;
console.log(`\nScored ${scored} of ${total} entities (${skipped} skipped${skipped ? ': no source_urls or fetch failed' : ''})`);
console.log(`Errors: ${errors}`);
if (dryRun) console.log('[dry-run mode — no data written]');

process.exit(errors > 0 ? 2 : 0);
