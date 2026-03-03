// @ts-check
import { defineConfig } from 'astro/config';
import { loadEnv } from 'vite';
import sitemap from '@astrojs/sitemap';
import react from '@astrojs/react';

const env = loadEnv('development', process.cwd(), '');

// https://astro.build/config
export default defineConfig({
  site: 'https://lab.sideband.pub',
  integrations: [sitemap(), react()],
  vite: {
    server: env.DEV_ALLOWED_HOSTS ? {
      allowedHosts: env.DEV_ALLOWED_HOSTS.split(','),
    } : {},
  },
});