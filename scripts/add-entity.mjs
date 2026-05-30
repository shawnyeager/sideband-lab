#!/usr/bin/env node

// Scaffold a new entity into data/map-data.json with a valid shape, then hand
// off to score-entities.mjs for placement. Structural validation only — this
// script never picks a score. Model: seed-source-urls.mjs (read-modify-write).
//
// Usage:
//   node scripts/add-entity.mjs \
//     --layer payments \
//     --short-name "Skyfire" \
//     --full-name "Skyfire agent payments" \
//     --note "Agent-native card rails, but Skyfire is the issuer of record" \
//     --source-url https://skyfire.xyz/docs \
//     --source-url https://example.com/announcement
//
//   node scripts/add-entity.mjs ... --dry-run   # print entity, write nothing
//   node scripts/add-entity.mjs ... --force      # add even if a duplicate exists

import { parseArgs } from 'node:util';
import { randomUUID } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const { values: flags } = parseArgs({
  options: {
    layer:         { type: 'string' },
    'short-name':  { type: 'string' },
    'full-name':   { type: 'string' },
    note:          { type: 'string' },
    'source-url':  { type: 'string', multiple: true },
    'dry-run':     { type: 'boolean', default: false },
    force:         { type: 'boolean', default: false },
  },
  strict: true,
});

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_PATH = join(__dirname, '..', 'data', 'map-data.json');

const data = JSON.parse(readFileSync(DATA_PATH, 'utf8'));

// ---------------------------------------------------------------------------
// Validate
// ---------------------------------------------------------------------------

const validLayers = data.layers.map(l => l.key);
const errors = [];

const layer = flags.layer;
if (!layer) {
  errors.push('--layer is required');
} else if (!validLayers.includes(layer)) {
  errors.push(`--layer "${layer}" is not a valid layer key. Valid: ${validLayers.join(', ')}`);
}

const fullName = flags['full-name']?.trim();
if (!fullName) errors.push('--full-name is required and must be non-empty');

const shortName = flags['short-name']?.trim();
if (!shortName) errors.push('--short-name is required and must be non-empty');

const sourceUrls = (flags['source-url'] || []).map(u => u.trim()).filter(Boolean);
if (sourceUrls.length === 0) {
  errors.push('at least one --source-url is required (the scorer needs evidence to fetch)');
}

if (errors.length) {
  console.error('Cannot add entity:');
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}

// Dedup on full_name + layer — the map already has the same name in two layers
// (e.g. "A2A Agent Cards"), so a name collision only matters within a layer.
const duplicate = data.entities.find(
  e => e.full_name === fullName && e.layer === layer
);
if (duplicate && !flags.force) {
  console.error(`Duplicate: "${fullName}" already exists in layer "${layer}" (id ${duplicate.id}).`);
  console.error('Use --force to add anyway.');
  process.exit(1);
}

// ---------------------------------------------------------------------------
// Build
// ---------------------------------------------------------------------------

const now = new Date().toISOString();
const entity = {
  id: randomUUID(),
  layer,
  short_name: shortName,
  full_name: fullName,
  note: flags.note?.trim() || '',
  current_x: null,
  current_y: null,
  source_urls: sourceUrls,
  reviewed: false,
  created_at: now,
  updated_at: now,
};

if (flags['dry-run']) {
  console.log('[dry-run] would add this entity (nothing written):');
  console.log(JSON.stringify(entity, null, 2));
  console.log(`\n[dry-run] next: node scripts/score-entities.mjs --id ${entity.id}`);
  process.exit(0);
}

data.entities.push(entity);
data.exported_at = now;
writeFileSync(DATA_PATH, JSON.stringify(data, null, 2) + '\n');

console.log(`ADDED  ${entity.full_name} (${entity.layer}) — id ${entity.id}`);
console.log(`Next:  node scripts/score-entities.mjs --id ${entity.id}`);
