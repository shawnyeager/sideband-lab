// @ts-check
import { readFileSync } from 'node:fs';
import { defineConfig } from 'astro/config';
import { loadEnv } from 'vite';
import sitemap from '@astrojs/sitemap';
import react from '@astrojs/react';

const env = loadEnv('development', process.cwd(), '');

// Keep draft project pages out of the sitemap. They still build (for preview)
// and carry robots=noindex, but an unlinked draft doesn't belong in the index.
const SITE = 'https://lab.sideband.pub';
const projects = JSON.parse(
  readFileSync(new URL('./src/content/projects.json', import.meta.url), 'utf-8'),
);
const draftUrls = new Set(
  projects.filter((p) => p.status !== 'live').map((p) => `${SITE}/${p.slug}/`),
);

// https://astro.build/config
export default defineConfig({
  site: SITE,
  integrations: [sitemap({ filter: (page) => !draftUrls.has(page) }), react()],
  vite: {
    server: env.DEV_ALLOWED_HOSTS ? {
      allowedHosts: env.DEV_ALLOWED_HOSTS.split(','),
    } : {},
  },
});