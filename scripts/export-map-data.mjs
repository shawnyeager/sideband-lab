#!/usr/bin/env node

// Load .env if present (Node 21+ built-in)
try { process.loadEnvFile(); } catch {}

import { createClient } from '@supabase/supabase-js';
import { writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

// ---------------------------------------------------------------------------
// Env
// ---------------------------------------------------------------------------

const SUPABASE_URL = process.env.SUPABASE_MAP_URL;
const SUPABASE_KEY = process.env.SUPABASE_MAP_SERVICE_ROLE_KEY
  || process.env.PUBLIC_SUPABASE_MAP_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing SUPABASE_MAP_URL or SUPABASE_MAP_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// ---------------------------------------------------------------------------
// Fetch
// ---------------------------------------------------------------------------

const [
  { data: layers, error: layersErr },
  { data: entities, error: entitiesErr },
] = await Promise.all([
  supabase.from('layers').select('*').order('sort_order'),
  supabase.from('entities').select('*').eq('reviewed', true),
]);

if (layersErr) { console.error(`layers: ${layersErr.message}`); process.exit(1); }
if (entitiesErr) { console.error(`entities: ${entitiesErr.message}`); process.exit(1); }

// ---------------------------------------------------------------------------
// Shape
// ---------------------------------------------------------------------------

const output = {
  exported_at: new Date().toISOString(),
  scoring: {
    method: 'deterministic-signal-extraction',
    description: 'LLM extracts structured factual signals from source material. A deterministic weighted formula computes scores from those signals. The LLM never picks a score.',
    x_axis: {
      label: 'Closed (0) → Open (100): Who decides if you can participate?',
      signals: ['spec_license', 'governance', 'permission_required', 'independent_implementations', 'fork_modify_allowed', 'tos_restrictions'],
    },
    y_axis: {
      label: 'Centralized (0) → Distributed (100): Where does it run and who operates it?',
      signals: ['deployment_model', 'operator_count', 'single_point_of_failure', 'self_hostable', 'works_offline', 'central_coordination_required'],
    },
  },
  layers: layers.map(l => ({
    key: l.key,
    name: l.name,
    color: l.color,
    status: l.status_override ? l.status : (l.computed_status || l.status),
    status_note: l.status_override ? l.status_note : (l.computed_status_note || l.status_note),
  })),
  entities: entities
    .map(e => ({
      name: e.full_name,
      short_name: e.short_name,
      layer: e.layer,
      x: e.current_x,
      y: e.current_y,
      note: e.note,
      x_reasoning: e.x_reasoning,
      y_reasoning: e.y_reasoning,
      source_urls: e.source_urls || [],
      scored_at: e.scored_at,
    }))
    .sort((a, b) => a.layer.localeCompare(b.layer) || a.name.localeCompare(b.name)),
};

// ---------------------------------------------------------------------------
// Write
// ---------------------------------------------------------------------------

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const outDir = join(root, 'data');
const outPath = join(outDir, 'map-entities.json');

mkdirSync(outDir, { recursive: true });
writeFileSync(outPath, JSON.stringify(output, null, 2) + '\n');

console.log(`Exported ${output.entities.length} entities across ${output.layers.length} layers → data/map-entities.json`);
