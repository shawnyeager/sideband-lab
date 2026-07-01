/**
 * Single source of truth for the site header.
 *
 * Used by:
 *  - src/components/Header.astro (normal page rendering)
 *  - src/pages/three-body-problem/index.astro (injected into raw HTML)
 *
 * Header is full-width bleed (matching sideband.pub), with 20px side padding.
 * Main content is narrower (1100px centered). Project pages add fixed
 * positioning + font loading.
 */

const headerStyles = `
  .site-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 56px;
    padding: 0 20px;
    border-bottom: 1px solid #D6D4CD;
  }
  .site-header__brand {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: #393a3a;
    text-decoration: none;
  }
  .site-header__mark { display: block; border-radius: 4px; color: transparent; }
  .site-header__title {
    font-family: 'Roboto Slab', Georgia, 'Times New Roman', serif;
    font-weight: 700;
    font-size: 1rem;
    letter-spacing: 0.01em;
  }
  .site-header__back {
    font-family: 'Space Grotesk', system-ui, -apple-system, sans-serif;
    font-size: 0.8rem;
    font-weight: 500;
    letter-spacing: 0.02em;
    color: #6b6966;
    text-decoration: none;
    display: inline-flex;
    align-items: center;
    gap: 5px;
  }
  .site-header__back-icon { width: 13px; height: 13px; flex-shrink: 0; }
  .site-header__nav {
    display: flex;
    align-items: center;
    gap: 16px;
  }
  .site-header__github {
    color: #6b6966;
    text-decoration: none;
    display: flex;
  }
  .site-header__github svg { width: 18px; height: 18px; }
  @media (max-width: 640px) {
    .site-header { height: 44px; padding: 0 12px; }
    .site-header__brand { gap: 0.35rem; }
    .site-header__mark { width: 20px; height: 20px; }
    .site-header__title { font-size: 0.8rem; }
    .site-header__back { font-size: 0.7rem; }
    .site-header__back-icon { width: 12px; height: 12px; }
    .site-header__nav { gap: 12px; }
    .site-header__github svg { width: 16px; height: 16px; }
  }
`;

const githubLink = `<a href="https://github.com/shawnyeager/sideband-lab" class="site-header__github plausible-event-name=Outbound+GitHub" aria-label="View source on GitHub">
      <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/></svg>
    </a>`;

const backArrow = `<svg class="site-header__back-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12.5 8H3.5M7 4 3.5 8 7 12"/></svg>`;

const brandLink = `<a href="/" class="site-header__brand">
    <img src="/img/sideband-icon.png" alt="Sideband Lab" width="28" height="28" loading="eager" class="site-header__mark" />
    <span class="site-header__title">Sideband Lab</span>
  </a>`;

const headerMarkup = `
<header class="site-header">
  ${brandLink}
  <nav class="site-header__nav">
    <a href="https://www.sideband.pub" class="site-header__back plausible-event-name=Outbound+Sideband">${backArrow}sideband.pub</a>
    ${githubLink}
  </nav>
</header>
`;

const projectHeaderMarkup = `
<header class="site-header">
  ${brandLink}
  <nav class="site-header__nav">
    <a href="/" class="site-header__back">${backArrow}All projects</a>
    ${githubLink}
  </nav>
</header>
`;

/** For Astro pages via Header.astro */
export const siteHeader = `<style>${headerStyles}</style>${headerMarkup}`;

/** Font preload tags — injected into <head> by project pages */
export const fontPreload = `
<style>@view-transition{navigation:auto}::view-transition-old(root){animation:vt-fade-out .15s ease}::view-transition-new(root){animation:vt-fade-in .2s ease}@keyframes vt-fade-out{to{opacity:0}}@keyframes vt-fade-in{from{opacity:0}}</style>
<link rel="preload" href="/fonts/RobotoSlab-Bold.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/fonts/Lora-Regular.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/fonts/SpaceGrotesk-Variable.woff2" as="font" type="font/woff2" crossorigin>
`;

export const projectHeader = `
<style>
  @font-face {
    font-family: 'Roboto Slab';
    src: url('/fonts/RobotoSlab-Bold.woff2') format('woff2');
    font-weight: 600 700;
    font-style: normal;
    font-display: swap;
  }
  @font-face {
    font-family: 'Lora';
    src: url('/fonts/Lora-Regular.woff2') format('woff2');
    font-weight: 400 700;
    font-style: normal;
    font-display: swap;
  }
  @font-face {
    font-family: 'Space Grotesk';
    src: url('/fonts/SpaceGrotesk-Variable.woff2') format('woff2');
    font-weight: 300 700;
    font-style: normal;
    font-display: swap;
  }
  .site-header-fixed {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 10000;
    background: #eeebe4;
  }
  ${headerStyles}
  body {
    padding-top: 57px !important;
    font-family: 'Lora', Georgia, 'Times New Roman', serif !important;
  }
  @media (max-width: 640px) {
    body { padding-top: 45px !important; }
  }
  h1, h2, h3, h4 {
    font-family: 'Roboto Slab', Georgia, 'Times New Roman', serif !important;
    font-weight: 700 !important;
  }

  /* ── Shared: disclosure/accordion ── */
  .disclosure {
    max-width: 728px;
    margin: 0 auto var(--sp-3, 20px);
  }
  .disclosure summary {
    font-family: 'Space Grotesk', system-ui, sans-serif;
    font-size: var(--fs-detail-sum, 16px);
    color: var(--site-text-muted, #6b6966);
    cursor: pointer;
    list-style: none;
    display: flex;
    align-items: center;
    gap: 6px;
    user-select: none;
  }
  .disclosure summary::-webkit-details-marker { display: none; }
  .disclosure .chev {
    display: inline-block;
    width: 8px;
    height: 8px;
    border-right: 1.5px solid var(--site-text-sub, #9a9793);
    border-bottom: 1.5px solid var(--site-text-sub, #9a9793);
    transform: rotate(-45deg);
    transition: transform 0.2s ease;
    flex-shrink: 0;
  }
  .disclosure[open] .chev { transform: rotate(45deg); }
  .disclosure-body {
    margin-top: var(--sp-1, 6px);
    font-size: var(--fs-detail-body, 15px);
    line-height: var(--lh-body, 1.65);
    color: var(--site-text-muted, #6b6966);
    overflow-wrap: break-word;
  }
  .disclosure-body p + p {
    margin-top: var(--sp-2, 14px);
  }
  .disclosure-body strong {
    color: var(--site-text, #393a3a);
    font-weight: 600;
  }
  .disclosure-body a {
    color: var(--site-text-muted, #6b6966);
    text-decoration: none;
    border-bottom: 1px solid var(--site-hr, #d5d2cb);
  }
  .disclosure-body a:hover { color: var(--site-text, #393a3a); }

  /* ── Shared: reading-column prose ── */
  .project-prose {
    font-size: var(--fs-body, 20px);
    line-height: var(--lh-body, 1.65);
    color: var(--site-text, #393a3a);
    max-width: 728px;
    margin: 0 auto var(--sp-3, 20px);
  }
  .project-prose strong {
    color: var(--site-text, #393a3a);
    font-weight: 700;
  }
  .project-prose p + p {
    margin-top: var(--sp-2, 14px);
  }

  /* ── Shared: subtle divider ── */
  .hr-subtle {
    max-width: 728px;
    margin: var(--sp-4, 28px) auto;
    border: none;
    border-top: 1px solid var(--site-hr, #d5d2cb);
  }

  /* ── Shared: footer credit ── */
  .project-credit {
    font-family: 'Space Grotesk', system-ui, sans-serif;
    font-size: var(--fs-foot, 14px);
    color: var(--site-text-sub, #9a9793);
    max-width: 728px;
    margin: var(--sp-5, 40px) auto 0;
  }
  .project-credit a {
    color: var(--site-text-sub, #9a9793);
    text-decoration: none;
    border-bottom: 1px solid var(--site-hr, #d5d2cb);
  }
  .project-credit a:hover { color: var(--site-text-muted, #6b6966); }

  /* ── Shared: primary cyan CTA (used on project pages) ──
     Color values mirror the --cta-* tokens in src/styles/global.css.
     Fallbacks apply on raw HTML pages where global.css is not loaded;
     tokens win on Astro-rendered pages. Update both in lockstep. */
  .project-cta {
    display: inline-flex;
    align-items: center;
    min-height: 44px;
    padding: 0 22px;
    background: var(--cta-bg, rgba(14, 165, 201, 0.18));
    color: var(--cta-fg, #075570);
    font-family: 'Space Grotesk', system-ui, sans-serif;
    font-weight: 600;
    font-size: 16px;
    letter-spacing: 0.01em;
    text-decoration: none;
    border-radius: 8px;
    transition: background 0.2s ease, color 0.2s ease;
  }
  .project-cta:hover {
    background: var(--cta-bg-hover, rgba(14, 165, 201, 0.30));
    color: var(--cta-fg-hover, #054458);
  }
  .project-cta:active {
    background: var(--cta-bg-active, rgba(14, 165, 201, 0.36));
    transform: translateY(1px);
  }
  .project-cta:focus-visible {
    outline: 2px solid #0EA5C9;
    outline-offset: 3px;
  }

  /* ── Companion-essay CTA block ── */
  .project-essay-cta {
    max-width: 728px;
    margin: var(--sp-5, 40px) auto;
    text-align: center;
  }

  @media (prefers-reduced-motion: reduce) {
    .project-cta {
      transition: none;
    }
    .project-cta:active {
      transform: none;
    }
    .project-related__title { transition: none; }
  }

  /* ── Shared: byline ──
     Editorial byline: substantial enough to read at a glance, not an
     afterthought. Matches the rhythm of the title-block above (sp-2 gap
     between subtitle and byline) and uses sp-5 bottom margin for a clean
     break before the chart-island. See docs/new-project-checklist.md for
     the .title-block standard. */
  .project-byline {
    max-width: 728px;
    margin: 0 auto var(--sp-5, 40px);
    font-family: 'Space Grotesk', system-ui, sans-serif;
    font-size: 14px;
    font-weight: 500;
    color: var(--site-text-muted, #6b6966);
    display: flex;
    align-items: baseline;
    gap: 12px;
    letter-spacing: 0.01em;
  }
  .project-byline__sep {
    color: var(--site-text-sub, #9a9793);
    font-size: 10px;
    transform: translateY(-1px);
  }
  .project-byline time {
    font-variant-numeric: tabular-nums;
  }

  /* ── Shared: project footer (related links + subscribe) ──
     Injected before .project-credit, so it's a normal in-page block on the
     728px reading column, like .project-prose. The credit stays the colophon. */
  .project-footer {
    max-width: 728px;
    margin: var(--sp-5, 40px) auto 0;
    font-family: 'Space Grotesk', system-ui, sans-serif;
  }
  .project-related {
    /* No top rule — the hr-subtle above the methodology disclosure already
       divides the appendix; a second rule here just stacks. Separation here
       comes from .project-footer's top margin and the kicker label. */
  }
  .project-related__kicker {
    margin: 0 0 var(--sp-2, 12px);
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--site-text-sub, #9a9793);
  }
  .project-related__list {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: var(--sp-3, 20px);
  }
  .project-related__list a {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 16px;
    text-decoration: none;
    color: var(--site-text, #393a3a);
  }
  .project-related__list a:hover .project-related__title { color: var(--cta-fg, #075570); }
  .project-related__list a:focus-visible {
    outline: 2px solid var(--cta-fg, #075570);
    outline-offset: 4px;
    border-radius: 2px;
  }
  .project-related__title {
    font-family: 'Roboto Slab', Georgia, 'Times New Roman', serif;
    font-weight: 600;
    font-size: 16px;
    line-height: 1.3;
    color: var(--site-text-muted, #6b6966);
    text-wrap: pretty;
    transition: color 0.15s var(--ease-out-quart, ease);
  }
  .project-related__date {
    flex-shrink: 0;
    font-size: 12px;
    color: var(--site-text-sub, #9a9793);
    white-space: nowrap;
    font-variant-numeric: tabular-nums;
  }
  /* Subscribe: a composed left-aligned block — quiet prompt over the button,
     not a marketing banner. Sideband states the offer, it doesn't beg the click. */
  .project-subscribe {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: var(--sp-2, 12px);
    margin-top: var(--sp-5, 40px);
  }
  .project-subscribe__prompt {
    margin: 0;
    font-size: 15px;
    letter-spacing: 0.01em;
    color: var(--site-text-muted, #6b6966);
  }

  @media (max-width: 640px) {
    .project-prose, .hr-subtle, .disclosure, .project-credit, .project-essay-cta, .project-byline, .project-footer { max-width: 100%; }
  }
</style>
<div class="site-header-fixed">${projectHeaderMarkup}</div>
`;

/** Generate the companion-essay CTA for a project page. Returns '' when no essay is linked. */
export function projectEssayCTA(project: { substackUrl?: string }) {
  if (!project.substackUrl) return '';
  return `
<div class="project-essay-cta">
  <a href="${project.substackUrl}" class="project-cta plausible-event-name=Read+Analysis">Read the full analysis</a>
</div>
`;
}

/**
 * Project-page footer: lateral links to related projects (internal-linking +
 * topical clustering) plus the newsletter subscribe CTA. Injected BEFORE the
 * in-page `.project-credit` so the credit/license stays the page's colophon.
 * `related` holds 2-3 OTHER live projects only — never a draft (it's noindex).
 * Styles live in the projectHeader <style> block. Returns '' when no related.
 */
export function projectFooter(related: { slug: string; title: string; date: string }[] = []) {
  const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const fmt = (iso: string) =>
    new Date(iso + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

  const relatedBlock = related.length
    ? `
  <nav class="project-related" aria-label="More projects from Sideband Lab">
    <p class="project-related__kicker">More from the lab</p>
    <ul class="project-related__list">
      ${related
        .map(
          (r) =>
            `<li><a href="/${r.slug}/"><span class="project-related__title">${esc(r.title)}</span><span class="project-related__date">${fmt(r.date)}</span></a></li>`
        )
        .join('\n      ')}
    </ul>
  </nav>`
    : '';

  return `
<div class="project-footer">${relatedBlock}
  <div class="project-subscribe">
    <p class="project-subscribe__prompt">Get the next one in your inbox</p>
    <a href="https://www.sideband.pub/subscribe" class="project-cta plausible-event-name=Subscribe+Click">Subscribe</a>
  </div>
</div>`;
}

// ── Canonical entity records — single source of truth, referenced from all schema ──

const SITE_URL = 'https://lab.sideband.pub';
const TWITTER_HANDLE = '@shawnyeager';

/** Person record for the author. Used in Article.author and as a standalone Person node. */
export const AUTHOR_PERSON = {
  '@type': 'Person',
  '@id': 'https://shawnyeager.com/#person',
  name: 'Shawn Yeager',
  url: 'https://shawnyeager.com',
  sameAs: [
    'https://shawnyeager.com',
    'https://www.sideband.pub',
    'https://github.com/shawnyeager',
    'https://x.com/shawnyeager',
    'https://www.linkedin.com/in/shawnyeager/',
  ],
} as const;

/** Organization record for the publisher. */
export const PUBLISHER_ORG = {
  '@type': 'Organization',
  '@id': `${SITE_URL}/#organization`,
  name: 'Sideband Lab',
  url: SITE_URL,
  logo: {
    '@type': 'ImageObject',
    url: `${SITE_URL}/img/sideband-icon.png`,
    width: 512,
    height: 512,
  },
  sameAs: ['https://www.sideband.pub'],
  founder: { '@id': 'https://shawnyeager.com/#person' },
} as const;

/** Inline a JSON object as a JSON-LD <script>, with the </ escape that defends against script-tag injection. */
function jsonLd(obj: unknown): string {
  return `<script type="application/ld+json">${JSON.stringify(obj).replace(/</g, '\\u003c')}</script>`;
}

/** Generate meta + og tags for a project page */
export function projectMeta(project: {
  slug: string;
  title: string;
  description: string;
  date?: string;
  dateModified?: string;
  author?: string;
  ogImage?: string;
  favicon?: string;
  status?: string;
}) {
  const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const pageTitle = esc(`${project.title} | Sideband Lab`);
  const ogImage = `${SITE_URL}${project.ogImage || '/img/og-default.png'}`;
  const canonical = `${SITE_URL}/${project.slug}/`;
  // Draft pages still build (so they're previewable) but must not be indexed —
  // they're unlinked from the homepage and would otherwise be orphan thin pages.
  const robots = project.status === 'live' ? 'index, follow' : 'noindex, follow';
  const faviconTag = project.favicon
    ? `<link rel="icon" href="${project.favicon}" />`
    : '<link rel="icon" type="image/png" href="/img/sideband-icon.png" />';

  const datePublished = project.date || '2026-01-01';
  const dateModified = project.dateModified || project.date || datePublished;

  const breadcrumbSchema = jsonLd({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Sideband Lab', item: `${SITE_URL}/` },
      { '@type': 'ListItem', position: 2, name: project.title, item: canonical },
    ],
  });

  const articleSchema = jsonLd({
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: project.title,
    description: project.description,
    image: ogImage,
    datePublished,
    dateModified,
    author: AUTHOR_PERSON,
    publisher: PUBLISHER_ORG,
    mainEntityOfPage: { '@type': 'WebPage', '@id': canonical },
    url: canonical,
    inLanguage: 'en',
  });

  return `
<title>${pageTitle}</title>
<meta name="description" content="${esc(project.description)}" />
<meta name="robots" content="${robots}" />
<link rel="canonical" href="${canonical}" />
${faviconTag}
<meta property="og:type" content="article" />
<meta property="og:url" content="${canonical}" />
<meta property="og:title" content="${pageTitle}" />
<meta property="og:description" content="${esc(project.description)}" />
<meta property="og:image" content="${ogImage}" />
<meta property="og:image:width" content="1880" />
<meta property="og:image:height" content="988" />
<meta property="og:site_name" content="Sideband Lab" />
<meta property="article:published_time" content="${datePublished}" />
<meta property="article:modified_time" content="${dateModified}" />
<meta property="article:author" content="Shawn Yeager" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:site" content="${TWITTER_HANDLE}" />
<meta name="twitter:creator" content="${TWITTER_HANDLE}" />
<meta name="twitter:title" content="${pageTitle}" />
<meta name="twitter:description" content="${esc(project.description)}" />
<meta name="twitter:image" content="${ogImage}" />
${breadcrumbSchema}
${articleSchema}
<script async src="https://plausible.io/js/pa-FEW5RDsDRliedckfbUUV2.js"></script>
<script>window.plausible=window.plausible||function(){(plausible.q=plausible.q||[]).push(arguments)},plausible.init=plausible.init||function(i){plausible.o=i||{}};plausible.init()</script>
`;
}

/** Generate WebSite + Organization JSON-LD for the homepage. */
export function homepageMeta() {
  const websiteSchema = jsonLd({
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE_URL}/#website`,
    name: 'Sideband Lab',
    url: `${SITE_URL}/`,
    description: 'Interactive visualizations that map the agent-era infrastructure shift. Companion to the Sideband newsletter.',
    publisher: PUBLISHER_ORG,
    inLanguage: 'en',
  });
  const orgSchema = jsonLd(PUBLISHER_ORG);
  const personSchema = jsonLd(AUTHOR_PERSON);
  return `${websiteSchema}\n${orgSchema}\n${personSchema}`;
}
