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
    layer:          { type: 'string' },
    id:             { type: 'string' },
    'dry-run':      { type: 'boolean', default: false },
    'extract-only': { type: 'boolean', default: false },
  },
  strict: true,
});

const dryRun = flags['dry-run'];
const extractOnly = flags['extract-only'];

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
// Signal schemas & weight tables (OpenSSF Scorecard pattern)
// ---------------------------------------------------------------------------

// Point values map to rubric band midpoints: 10 (Closed/Centralized),
// 30 (Gated/Hosted), 50 (Mixed/Federated), 70 (Open-governed/Multi-op),
// 90 (Permissionless/Fully distributed). No 0s or 100s — every signal
// has a floor and ceiling that matches the rubric's continuous scale.

// X-axis: Who decides if you can participate? (Closed 0 → Open 100)
const X_SIGNALS = {
  spec_license: {
    question: 'What license governs using this specific thing (not the underlying protocol, but THIS deployment/product)?',
    type: 'enum',
    values: ['proprietary', 'source-available', 'open-standard', 'public-domain'],
    points: { proprietary: 10, 'source-available': 40, 'open-standard': 75, 'public-domain': 90 },
    weight: 0.15,
  },
  governance: {
    question: 'Who controls how this specific thing evolves? (If an open spec has vendor-controlled deployment, answer about the deployment.)',
    type: 'enum',
    values: ['single-company', 'consortium', 'neutral-foundation', 'no-governance'],
    points: { 'single-company': 10, consortium: 40, 'neutral-foundation': 75, 'no-governance': 90 },
    weight: 0.15,
  },
  permission_required: {
    question: 'To USE this specific thing as described, must you register, create an account, get API keys, or obtain approval from any entity? (Include OAuth client registration, RBAC enrollment, app store approval, etc.)',
    type: 'boolean',
    points: { true: 10, false: 90 },
    weight: 0.25,
  },
  independent_implementations: {
    question: 'How many independent implementations of THIS specific deployment pattern exist? (Not the underlying protocol — the specific pattern described.)',
    type: 'enum',
    values: ['zero', 'one', 'few', 'several', 'many'],
    points: { zero: 10, one: 25, few: 45, several: 70, many: 90 },
    weight: 0.15,
  },
  fork_modify_allowed: {
    question: 'Can anyone fork, modify, and deploy their own version without permission from any entity?',
    type: 'boolean',
    points: { true: 90, false: 10 },
    weight: 0.15,
  },
  tos_restrictions: {
    question: 'Are there Terms of Service, acceptable use policies, or platform rules that restrict how this can be used?',
    type: 'boolean',
    points: { true: 10, false: 90 },
    weight: 0.15,
  },
};

// Y-axis: Where does it run and who operates it? (Centralized 0 → Distributed 100)
const Y_SIGNALS = {
  deployment_model: {
    question: 'Where does THIS specific thing physically run? (Not where it COULD run — where it ACTUALLY runs as described.)',
    type: 'enum',
    values: ['single-server', 'few-providers', 'federated', 'p2p-or-on-device'],
    points: { 'single-server': 10, 'few-providers': 30, federated: 60, 'p2p-or-on-device': 90 },
    weight: 0.25,
  },
  operator_count: {
    question: 'How many independent operators currently run THIS specific deployment pattern?',
    type: 'enum',
    values: ['one', '2-5', '6-50', '50-plus', 'thousands-plus'],
    points: { one: 10, '2-5': 25, '6-50': 50, '50-plus': 75, 'thousands-plus': 90 },
    weight: 0.25,
  },
  single_point_of_failure: {
    question: 'If one operator disappears, do users of THIS specific thing lose functionality or assets? (For payments: include whether users would lose funds or access to their balance.)',
    type: 'boolean',
    points: { true: 10, false: 90 },
    weight: 0.20,
  },
  self_hostable: {
    question: 'Can anyone run their own instance of THIS specific thing without permission?',
    type: 'boolean',
    points: { true: 90, false: 10 },
    weight: 0.10,
  },
  works_offline: {
    question: 'Does THIS specific thing function without internet connectivity?',
    type: 'boolean',
    points: { true: 90, false: 10 },
    weight: 0.10,
  },
  central_coordination_required: {
    question: 'Is a central authority (auth server, registry, coordinator) required for THIS specific thing to operate?',
    type: 'boolean',
    points: { true: 10, false: 90 },
    weight: 0.10,
  },
};

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
// Extraction prompt (LLM extracts facts, never picks scores)
// ---------------------------------------------------------------------------

function buildSignalSchemaBlock(signals) {
  const lines = [];
  for (const [key, sig] of Object.entries(signals)) {
    if (sig.type === 'boolean') {
      lines.push(`  "${key}": { "value": true|false|null, "citation": "..." }  // ${sig.question}`);
    } else {
      lines.push(`  "${key}": { "value": "${sig.values.join('"|"')}"|null, "citation": "..." }  // ${sig.question}`);
    }
  }
  return lines.join('\n');
}

function buildExtractionPrompt(entity, layerName, evidence) {
  return `You are extracting factual signals about a SPECIFIC DEPLOYMENT PATTERN for the Sideband Agent-Era Infrastructure Map.

ENTITY: ${entity.full_name}
LAYER: ${layerName}
DESCRIPTION: ${entity.note || 'No description provided'}

CRITICAL: You are scoring the DEPLOYMENT PATTERN described, NOT the underlying protocol or technology.

Think of it this way: if a developer wants to USE "${entity.full_name}" as the DESCRIPTION describes it, what would they actually encounter?

Examples of the distinction:
- "MCP (enterprise)" described as "Open spec + OAuth/RBAC adds control" → The underlying MCP spec is open, but THIS entity is about enterprise deployment WITH OAuth. A developer MUST set up OAuth client registration to participate. Answer about the enterprise deployment, not the open spec.
- "Apple Neural Engine" described as "2.5B devices, but Apple controls chip + App Store" → The chips are physically distributed on billions of devices. But access requires Apple hardware and App Store approval. Answer about what a developer encounters.
- "OAuth 2.1 (enterprise)" described as "Open spec, centralized deployment" → The IETF spec is open, but enterprise OAuth runs on centralized auth servers (Azure AD, Okta). Answer about the enterprise deployment.

FRAMING CHECK: Before answering each signal, ask yourself: "Am I answering about ${entity.full_name} AS DESCRIBED ('${entity.note || ''}'), or about the underlying technology?" If the latter, reframe your answer.

SOURCE MATERIAL:
${evidence}

For each signal, extract the answer as it applies to THIS SPECIFIC DEPLOYMENT PATTERN.
- "value": the answer (use the exact enum values or true/false)
- "citation": a direct quote from source material OR "DESCRIPTION" if the description provides the answer
- If the source material does NOT contain evidence, set BOTH value and citation to null
- Do NOT guess. Only report what evidence states or what directly follows from the DESCRIPTION.

Respond with this exact JSON structure:
{
  "x_signals": {
${buildSignalSchemaBlock(X_SIGNALS)}
  },
  "y_signals": {
${buildSignalSchemaBlock(Y_SIGNALS)}
  }
}`;
}

// ---------------------------------------------------------------------------
// Claude API call (extraction, not scoring)
// ---------------------------------------------------------------------------

async function extractSignals(prompt) {
  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-5-20250929',
    max_tokens: 4096,
    temperature: 0,
    messages: [{ role: 'user', content: prompt }],
  });

  const text = message.content[0]?.text;
  if (!text) throw new Error('Empty response from Claude');

  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error(`No JSON found in response: ${text.slice(0, 200)}`);

  const parsed = JSON.parse(jsonMatch[0]);

  if (!parsed.x_signals || !parsed.y_signals) {
    throw new Error('Missing x_signals or y_signals in response');
  }

  return parsed;
}

// ---------------------------------------------------------------------------
// Deterministic scoring (pure arithmetic, no LLM)
// ---------------------------------------------------------------------------

function computeAxisScore(signals, signalDefs) {
  let weightedSum = 0;
  let totalWeight = 0;
  const details = {};

  for (const [key, def] of Object.entries(signalDefs)) {
    const extracted = signals[key];
    const value = extracted?.value;

    if (value == null) {
      details[key] = { value: null, points: null, weight: def.weight, citation: null };
      continue;
    }

    // Look up points for this value
    const pointKey = typeof value === 'boolean' ? String(value) : value;
    const points = def.points[pointKey];

    if (points == null) {
      details[key] = { value, points: null, weight: def.weight, citation: extracted?.citation, error: `unknown value: ${value}` };
      continue;
    }

    weightedSum += points * def.weight;
    totalWeight += def.weight;
    details[key] = { value, points, weight: def.weight, citation: extracted?.citation };
  }

  // Normalize: score out of 100, using only non-null signals
  const score = totalWeight > 0 ? Math.round(weightedSum / totalWeight) : null;
  const coverage = Object.keys(signalDefs).length;
  const answered = Object.values(details).filter(d => d.points != null).length;

  return { score, details, coverage: `${answered}/${coverage}` };
}

function buildAxisReasoning(details, signalDefs, axisLabel) {
  const parts = [];
  for (const [key, d] of Object.entries(details)) {
    const def = signalDefs[key];
    if (d.value == null) {
      parts.push(`${key}: no evidence found`);
    } else if (d.error) {
      parts.push(`${key}: ${d.error}`);
    } else {
      const citation = d.citation ? ` (${d.citation})` : '';
      parts.push(`${key}=${d.value} → ${d.points}pts${citation}`);
    }
  }
  return parts.join('; ');
}

function computeScores(extracted) {
  const x = computeAxisScore(extracted.x_signals, X_SIGNALS);
  const y = computeAxisScore(extracted.y_signals, Y_SIGNALS);

  const xNulls = Object.entries(x.details).filter(([, d]) => d.value == null).map(([k]) => k);
  const yNulls = Object.entries(y.details).filter(([, d]) => d.value == null).map(([k]) => k);
  const allNulls = [...xNulls, ...yNulls];
  const totalSignals = Object.keys(X_SIGNALS).length + Object.keys(Y_SIGNALS).length;
  const lowCoverage = allNulls.length / totalSignals > 0.4;

  return {
    x_score: x.score,
    y_score: y.score,
    x_reasoning: buildAxisReasoning(x.details, X_SIGNALS, 'X'),
    y_reasoning: buildAxisReasoning(y.details, Y_SIGNALS, 'Y'),
    x_coverage: x.coverage,
    y_coverage: y.coverage,
    null_signals: allNulls.length > 0 ? allNulls : null,
    low_coverage: lowCoverage,
    extracted_signals: extracted,
  };
}

// ---------------------------------------------------------------------------
// DB writes
// ---------------------------------------------------------------------------

async function writeScore(entity, result) {
  // Insert score_history row with extracted signals for auditability
  const { error: histErr } = await supabase.from('score_history').insert({
    entity_id: entity.id,
    x: result.x_score,
    y: result.y_score,
    x_reasoning: result.x_reasoning,
    y_reasoning: result.y_reasoning,
    change_note: null,
    reviewed: false,
    extracted_signals: result.extracted_signals || null,
  });
  if (histErr) throw new Error(`score_history insert: ${histErr.message}`);

  // Update entity — do NOT set reviewed=false here; that would hide the entity
  const { error: entErr } = await supabase.from('entities').update({
    current_x: result.x_score,
    current_y: result.y_score,
    x_reasoning: result.x_reasoning,
    y_reasoning: result.y_reasoning,
    scored_at: new Date().toISOString(),
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

  // 2. Extract structured signals via LLM
  const prompt = buildExtractionPrompt(entity, layerMap[entity.layer] || entity.layer, evidence);

  try {
    const extracted = await extractSignals(prompt);

    if (extractOnly) {
      console.log(`  signals: ${JSON.stringify(extracted, null, 2)}`);
      scored++;
      affectedLayers.add(entity.layer);
      continue;
    }

    // 3. Compute scores deterministically
    const result = computeScores(extracted);

    if (result.x_score == null || result.y_score == null) {
      console.log(`  SKIP — insufficient signal coverage (x=${result.x_coverage}, y=${result.y_coverage})`);
      skipped++;
      continue;
    }

    console.log(`  x=${result.x_score} (${result.x_coverage}) y=${result.y_score} (${result.y_coverage})`);
    if (result.low_coverage) {
      console.log(`  ⚠ low coverage — null signals: ${result.null_signals.join(', ')}`);
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
