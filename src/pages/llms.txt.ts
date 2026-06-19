import type { APIRoute } from 'astro';
import projects from '../content/projects.json';
import { getActiveProjects } from '../lib/utils';

const SITE = 'https://lab.sideband.pub';

/**
 * llms.txt — generated from projects.json so it never drifts from the live
 * project set. Lists only live projects, newest first. See llmstxt.org.
 */
export const GET: APIRoute = () => {
  const projectLines = getActiveProjects(projects)
    .map((p) => `- [${p.title}](${SITE}/${p.slug}/) — ${p.description} (${p.date})`)
    .join('\n');

  const body = `# Sideband Lab

> Interactive visualizations that map the agent-era infrastructure shift. Companion to the Sideband newsletter (https://sideband.pub).

Each project is a small data-driven argument: a chart, a simulation, or an interactive layout, paired with sourced data and the underlying methodology.

## About
- Author: Shawn Yeager (https://shawnyeager.com)
- Newsletter: https://sideband.pub
- Source code: https://github.com/shawnyeager/sideband-lab
- License: CC BY 4.0 unless noted otherwise per project

## Projects
${projectLines}

## Audience
Founders, builders, and investors following AI infrastructure shifts. Assumed familiarity with APIs, payment rails, agent architectures, stablecoins, and Lightning.
`;

  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
