#!/usr/bin/env node

// Seed source_urls for all map entities so the scoring pipeline has evidence to work from.
// Run once, then run score-entities.mjs to score against the evidence.

import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_PATH = join(__dirname, '..', 'data', 'map-data.json');

// ---------------------------------------------------------------------------
// Source URLs by entity full_name
// ---------------------------------------------------------------------------

const SOURCES = {
  // --- COMPUTE ---
  'OpenAI / Anthropic / Google API': [
    'https://platform.openai.com/docs/overview',
    'https://docs.anthropic.com/en/docs/about-claude/models',
    'https://ai.google.dev/gemini-api/docs',
  ],
  'Apple Neural Engine': [
    'https://machinelearning.apple.com/research/neural-engine-transformers',
    'https://developer.apple.com/machine-learning/core-ml/',
  ],
  'Open-weight on cloud': [
    'https://ai.meta.com/llama/',
    'https://aws.amazon.com/bedrock/llama/',
    'https://together.ai/blog/llama-3',
  ],
  'Open-weight on local': [
    'https://ollama.com/',
    'https://lmstudio.ai/',
    'https://ai.meta.com/llama/',
  ],
  'Qualcomm / MediaTek NPUs': [
    'https://www.qualcomm.com/developer/artificial-intelligence',
    'https://developer.mediatek.com/neuropilot',
  ],

  // --- PROTOCOLS ---
  'MCP (spec)': [
    'https://modelcontextprotocol.io/introduction',
    'https://spec.modelcontextprotocol.io/',
    'https://github.com/modelcontextprotocol/specification',
  ],
  'MCP (self-hosted)': [
    'https://modelcontextprotocol.io/introduction',
    'https://github.com/modelcontextprotocol/servers',
  ],
  'MCP (enterprise)': [
    'https://modelcontextprotocol.io/specification/2025-03-26/basic/authorization',
    'https://stainlessapi.com/blog/model-context-protocol-mcp-security',
  ],
  'A2A Agent Cards': [
    'https://google.github.io/A2A/',
    'https://github.com/google/A2A',
    'https://google.github.io/A2A/specification/',
  ],
  'Copilot Studio': [
    'https://www.microsoft.com/en-us/microsoft-copilot/microsoft-copilot-studio',
    'https://learn.microsoft.com/en-us/microsoft-copilot-studio/fundamentals-what-is-copilot-studio',
  ],
  'Salesforce Agentforce': [
    'https://www.salesforce.com/agentforce/',
    'https://developer.salesforce.com/docs/einstein/genai/guide/agentforce.html',
  ],

  // --- DISCOVERY ---
  'GPT Store': [
    'https://openai.com/index/introducing-the-gpt-store/',
    'https://chat.openai.com/gpts',
  ],
  'Oracle / Salesforce Marketplaces': [
    'https://www.oracle.com/artificial-intelligence/ai-agents/',
    'https://appexchange.salesforce.com/',
  ],
  'MCP Registry': [
    'https://modelcontextprotocol.io/specification/2025-03-26/basic/index',
    'https://github.com/modelcontextprotocol/registry',
  ],
  'Smithery / PulseMCP': [
    'https://smithery.ai/',
    'https://www.pulsemcp.com/',
  ],
  // A2A Agent Cards in discovery layer — same entity name, different layer
  // We'll handle this by matching on full_name + layer

  'AGNTCY DHT': [
    'https://agntcy.org/',
    'https://github.com/agntcy/agentic-apps',
    'https://docs.agntcy.org/pages/agws/overview/',
  ],
  'NANDA Index (MIT)': [
    'https://nanda-discover.org/',
    'https://github.com/nanda-ai',
  ],

  // --- IDENTITY ---
  'Microsoft Entra Agent ID': [
    'https://learn.microsoft.com/en-us/entra/identity/',
    'https://www.microsoft.com/en-us/security/business/identity-access/microsoft-entra-id',
  ],
  'OAuth 2.1 (enterprise)': [
    'https://datatracker.ietf.org/doc/html/draft-ietf-oauth-v2-1-12',
    'https://oauth.net/2.1/',
  ],
  'Descope / WorkOS': [
    'https://www.descope.com/',
    'https://workos.com/',
  ],
  'IETF delegation draft': [
    'https://datatracker.ietf.org/doc/draft-ietf-oauth-transaction-tokens/',
    'https://datatracker.ietf.org/doc/draft-ietf-gnap-core-protocol/',
  ],
  'W3C DIDs': [
    'https://www.w3.org/TR/did-core/',
    'https://w3c.github.io/did-extensions/',
  ],
  'UCAN': [
    'https://ucan.xyz/',
    'https://github.com/ucan-wg/spec',
  ],
  'Keypair identity (Nostr)': [
    'https://nostr.com/',
    'https://github.com/nostr-protocol/nips',
  ],

  // --- PAYMENTS ---
  'Visa / Mastercard': [
    'https://developer.visa.com/',
    'https://developer.mastercard.com/',
  ],
  'Stripe SPTs': [
    'https://stripe.com/docs/api',
    'https://stripe.com/docs/connect',
  ],
  'Google AP2': [
    'https://developers.google.com/pay/api',
    'https://blog.google/products/google-pay/',
  ],
  'USDC / stablecoins': [
    'https://www.circle.com/usdc',
    'https://developers.circle.com/stablecoins/docs',
  ],
  'Coinbase x402': [
    'https://github.com/coinbase/x402',
    'https://www.x402.org/',
  ],
  'Lightning': [
    'https://lightning.network/',
    'https://github.com/lightning/bolts',
    'https://mempool.space/lightning',
  ],
  'Cashu': [
    'https://cashu.space/',
    'https://github.com/cashubtc/nuts',
  ],
  'Nostr zaps': [
    'https://github.com/nostr-protocol/nips/blob/master/57.md',
    'https://nostr.com/',
  ],
};

// ---------------------------------------------------------------------------
// Update
// ---------------------------------------------------------------------------

const data = JSON.parse(readFileSync(DATA_PATH, 'utf8'));

let updated = 0;
let skipped = 0;
let notFound = 0;

for (const entity of data.entities) {
  const urls = SOURCES[entity.full_name];

  if (!urls) {
    console.log(`NO URLS  ${entity.full_name} (${entity.layer})`);
    notFound++;
    continue;
  }

  // Skip if already has source_urls
  if (entity.source_urls && entity.source_urls.length > 0) {
    console.log(`EXISTS   ${entity.full_name} (${entity.layer}) — ${entity.source_urls.length} URLs`);
    skipped++;
    continue;
  }

  entity.source_urls = urls;
  console.log(`SEEDED   ${entity.full_name} (${entity.layer}) — ${urls.length} URLs`);
  updated++;
}

if (updated > 0) {
  data.exported_at = new Date().toISOString();
  writeFileSync(DATA_PATH, JSON.stringify(data, null, 2) + '\n');
}

console.log(`\nDone: ${updated} seeded, ${skipped} already had URLs, ${notFound} not in source map`);
