-- Agent-Era Infrastructure Map — Schema + Seed Data
-- Run this in the Supabase SQL editor or via `supabase db push`

-- ============================================================
-- TABLES
-- ============================================================

create table if not exists layers (
  key text primary key,
  name text not null,
  color text not null,
  status text not null,
  status_note text not null,
  sort_order integer not null default 0
);

create table if not exists entities (
  id uuid primary key default gen_random_uuid(),
  layer text not null references layers(key),
  short_name text not null,
  full_name text not null,
  note text not null,
  current_x integer not null,
  current_y integer not null,
  source_urls text[] default '{}',
  x_reasoning text,
  y_reasoning text,
  scored_at timestamptz,
  reviewed boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists insights (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text not null,
  color text not null,
  sort_order integer not null default 0,
  active boolean not null default true
);

create table if not exists score_history (
  id uuid primary key default gen_random_uuid(),
  entity_id uuid not null references entities(id),
  x integer not null,
  y integer not null,
  x_reasoning text,
  y_reasoning text,
  change_note text,
  scored_at timestamptz not null default now(),
  reviewed boolean not null default false
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table layers enable row level security;
alter table entities enable row level security;
alter table insights enable row level security;
alter table score_history enable row level security;

-- Public read
create policy "Public read layers" on layers for select using (true);
create policy "Public read entities" on entities for select using (true);
create policy "Public read insights" on insights for select using (true);
create policy "Public read score_history" on score_history for select using (true);

-- Authenticated write
create policy "Auth write layers" on layers for all using (auth.role() = 'authenticated');
create policy "Auth write entities" on entities for all using (auth.role() = 'authenticated');
create policy "Auth write insights" on insights for all using (auth.role() = 'authenticated');
create policy "Auth write score_history" on score_history for all using (auth.role() = 'authenticated');

-- ============================================================
-- SEED: LAYERS
-- ============================================================

insert into layers (key, name, color, status, status_note, sort_order) values
  ('compute',   'Compute',   '#0EA5C9', 'Splitting',    'Two distinct camps forming, neither dominant', 0),
  ('protocols', 'Protocols', '#38BDF8', 'Settling',     'Clear winners emerging, governance established', 1),
  ('discovery', 'Discovery', '#5B9B84', 'Fragmenting',  'Multiple competing approaches, no convergence yet', 2),
  ('identity',  'Identity',  '#C9A050', 'Wide open',    'Critical gap, almost nothing production-ready', 3),
  ('payments',  'Payments',  '#A97C40', 'Forking',      'Two paradigms diverging: platform-mediated vs. permissionless', 4)
on conflict (key) do nothing;

-- ============================================================
-- SEED: ENTITIES
-- ============================================================

insert into entities (layer, short_name, full_name, current_x, current_y, note) values
  -- Compute
  ('compute', 'Cloud APIs',   'OpenAI / Anthropic / Google API', 10, 10, 'Proprietary models, API keys, content policy'),
  ('compute', 'Apple',        'Apple Neural Engine',              15, 85, '2.5B devices, but Apple controls chip + App Store'),
  ('compute', 'Llama/cloud',  'Open-weight on cloud',             70, 15, 'Llama on AWS, open model, rented infra'),
  ('compute', 'Llama/local',  'Open-weight on local',             92, 95, 'No API key, no account, runs offline'),
  ('compute', 'NPUs',         'Qualcomm / MediaTek NPUs',         45, 82, 'Distributed hardware, vendor SDK control'),
  -- Protocols
  ('protocols', 'MCP spec',        'MCP (spec)',            85, 55, 'Linux Foundation/AAIF, 97M SDK downloads'),
  ('protocols', 'MCP self-host',   'MCP (self-hosted)',     88, 85, 'Anyone runs a server, anyone connects'),
  ('protocols', 'MCP enterprise',  'MCP (enterprise)',      45, 20, 'Open spec + OAuth/RBAC adds control'),
  ('protocols', 'A2A',             'A2A Agent Cards',       82, 82, 'Self-hosted at well-known URLs'),
  ('protocols', 'Copilot Studio',  'Copilot Studio',        10, 10, 'Microsoft platform, M365 lock-in'),
  ('protocols', 'Agentforce',      'Salesforce Agentforce', 10, 10, 'CRM-bound, vendor-specific'),
  -- Discovery
  ('discovery', 'GPT Store',       'GPT Store',                       8,  8, '3M+ GPTs, OpenAI curates + revenue share'),
  ('discovery', 'Enterprise mkts', 'Oracle / Salesforce Marketplaces', 10, 10, 'Enterprise-gatekept'),
  ('discovery', 'MCP Registry',    'MCP Registry',                    75, 28, 'Open governance, federated, central infra'),
  ('discovery', 'Smithery',        'Smithery / PulseMCP',             55, 22, 'Community-run, open listing, central hosting'),
  ('discovery', 'Agent Cards',     'A2A Agent Cards',                 88, 88, 'Self-describing, self-hosted'),
  ('discovery', 'AGNTCY',          'AGNTCY DHT',                      90, 92, 'Kademlia P2P, IETF draft submitted'),
  ('discovery', 'NANDA',           'NANDA Index (MIT)',                90, 88, 'ZK proofs, cryptographic verification'),
  -- Identity
  ('identity', 'Entra',      'Microsoft Entra Agent ID',  8,  8, 'Most comprehensive enterprise, M365-bound'),
  ('identity', 'OAuth 2.1',  'OAuth 2.1 (enterprise)',   45, 20, 'Open spec, centralized deployment'),
  ('identity', 'Descope',    'Descope / WorkOS',         48, 22, 'Vendor-neutral but hosted IdPs'),
  ('identity', 'IETF draft', 'IETF delegation draft',    82, 50, 'Extends OAuth for delegation chains'),
  ('identity', 'DIDs',       'W3C DIDs',                 88, 82, 'Standard since 2022, low enterprise adoption'),
  ('identity', 'UCAN',       'UCAN',                     92, 90, 'Self-certifying, delegable, no central auth'),
  ('identity', 'Nostr npub',  'Keypair identity (Nostr)', 96, 96, 'No authority, cryptographic only'),
  -- Payments
  ('payments', 'Visa/MC',      'Visa / Mastercard',    5,  5, 'Traditional rails, KYC, legal entity required'),
  ('payments', 'Stripe SPTs',  'Stripe SPTs',         15, 10, 'Programmable but platform-mediated'),
  ('payments', 'Google AP2',   'Google AP2',           18, 12, '60+ partners, Google-governed'),
  ('payments', 'USDC',         'USDC / stablecoins',  50, 50, 'Open rails + controlled issuance'),
  ('payments', 'x402',         'Coinbase x402',       65, 72, 'Coinbase-originated, open HTTP protocol'),
  ('payments', 'Lightning',    'Lightning',            90, 88, 'Permissionless, 400ms, $14B network'),
  ('payments', 'Cashu',        'Cashu',                92, 90, 'Ecash, mint-based, strongest privacy'),
  ('payments', 'Zaps',         'Nostr zaps',           92, 88, 'Social + payment combined');

-- ============================================================
-- SEED: INSIGHTS
-- ============================================================

insert into insights (title, body, color, sort_order) values
  ('The diagonal is crowded',    'Most entities cluster along Gatekept to Permissionless. The interesting plays break the pattern.', '#EEEBE4', 0),
  ('Identity has no middle',     'Every other layer has entities near the center. Identity is bifurcated—Entra in one corner, keypairs in the other. That gap is the opportunity.', '#C9A050', 1),
  ('Payments bridge both worlds','Stablecoins sit dead center—regulated money on permissionless rails. The most active middle ground on the entire map.', '#A97C40', 2),
  ('Protocols settled first',    'MCP and A2A under Linux Foundation governance in ~18 months. Historically consistent—HTTP settled before search, payments, or identity.', '#38BDF8', 3);
