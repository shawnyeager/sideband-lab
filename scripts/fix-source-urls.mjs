#!/usr/bin/env node

// Fix broken source_urls discovered during dry-run scoring.
// Replaces 404/403/unreachable URLs with verified working alternatives.

try { process.loadEnvFile(); } catch {}

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_MAP_URL;
const SUPABASE_KEY = process.env.SUPABASE_MAP_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing SUPABASE_MAP_URL or SUPABASE_MAP_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Map of full_name → new source_urls (fully replacing the old set)
const FIXES = {
  'Qualcomm / MediaTek NPUs': [
    'https://www.qualcomm.com/developer/artificial-intelligence',
    'https://www.mediatek.com/technology/artificial-intelligence',
  ],
  'Salesforce Agentforce': [
    'https://www.salesforce.com/agentforce/',
    'https://help.salesforce.com/s/articleView?id=sf.agents_overview.htm',
  ],
  'AGNTCY DHT': [
    'https://agntcy.org/',
    'https://github.com/agntcy/agp',
  ],
  'A2A Agent Cards': [
    // Used by both protocols and discovery layers
    'https://a2aprotocol.ai/',
    'https://github.com/google/A2A',
  ],
  'NANDA Index (MIT)': [
    'https://nanda.ai/',
  ],
  'GPT Store': [
    'https://en.wikipedia.org/wiki/GPT_Store',
  ],
  'OpenAI / Anthropic / Google API': [
    // OpenAI blocks bots; use Wikipedia + Anthropic + Google which work
    'https://en.wikipedia.org/wiki/OpenAI',
    'https://docs.anthropic.com/en/docs/about-claude/models',
    'https://ai.google.dev/gemini-api/docs',
  ],
  'MCP (spec)': [
    'https://modelcontextprotocol.io/introduction',
    'https://modelcontextprotocol.io/specification/2025-03-26',
    'https://github.com/modelcontextprotocol/specification',
  ],
  'MCP (enterprise)': [
    'https://modelcontextprotocol.io/specification/2025-03-26/basic/authorization',
    'https://modelcontextprotocol.io/introduction',
  ],
  'Smithery / PulseMCP': [
    // Smithery rate-limits all scrapers; PulseMCP works
    'https://www.pulsemcp.com/',
  ],
  'Open-weight on cloud': [
    'https://ai.meta.com/llama/',
    'https://aws.amazon.com/bedrock/llama/',
    'https://www.together.ai/models',
  ],
};

const { data: entities, error } = await supabase
  .from('entities')
  .select('id, full_name, layer');

if (error) {
  console.error(`Failed to fetch entities: ${error.message}`);
  process.exit(1);
}

let updated = 0;

for (const entity of entities) {
  const urls = FIXES[entity.full_name];
  if (!urls) continue;

  const { error: updateErr } = await supabase
    .from('entities')
    .update({ source_urls: urls })
    .eq('id', entity.id);

  if (updateErr) {
    console.error(`FAIL  ${entity.full_name}: ${updateErr.message}`);
  } else {
    console.log(`FIXED ${entity.full_name} (${entity.layer}) → ${urls.length} URLs`);
    updated++;
  }
}

console.log(`\nFixed ${updated} entities`);
