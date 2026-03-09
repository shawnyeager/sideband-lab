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
  .site-header__mark { display: block; border-radius: 4px; }
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
  }
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
    .site-header__nav { gap: 12px; }
    .site-header__github svg { width: 16px; height: 16px; }
  }
`;

const githubLink = `<a href="https://github.com/shawnyeager/sideband-lab" class="site-header__github plausible-event-name=Outbound+GitHub" aria-label="View source on GitHub">
      <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/></svg>
    </a>`;

const brandLink = `<a href="/" class="site-header__brand">
    <img src="/img/sideband-icon.png" alt="Sideband Lab" width="28" height="28" loading="eager" class="site-header__mark" />
    <span class="site-header__title">Sideband Lab</span>
  </a>`;

const headerMarkup = `
<header class="site-header">
  ${brandLink}
  <nav class="site-header__nav">
    <a href="https://www.sideband.pub" class="site-header__back plausible-event-name=Outbound+Sideband">&larr; sideband.pub</a>
    ${githubLink}
  </nav>
</header>
`;

const projectHeaderMarkup = `
<header class="site-header">
  ${brandLink}
  <nav class="site-header__nav">
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

  @media (max-width: 640px) {
    .project-prose, .hr-subtle, .disclosure, .project-credit { max-width: 100%; }
  }
</style>
<div class="site-header-fixed">${projectHeaderMarkup}</div>
`;

/** Generate meta + og tags for a project page */
export function projectMeta(project: {
  slug: string;
  title: string;
  description: string;
  ogImage?: string;
  favicon?: string;
}) {
  const siteUrl = 'https://lab.sideband.pub';
  const pageTitle = `${project.title} | Sideband Lab`;
  const ogImage = `${siteUrl}${project.ogImage || '/img/og-default.png'}`;
  const canonical = `${siteUrl}/${project.slug}/`;
  const faviconTag = project.favicon
    ? `<link rel="icon" href="${project.favicon}" />`
    : '<link rel="icon" type="image/png" href="/img/sideband-icon.png" />';
  return `
<title>${pageTitle}</title>
<meta name="description" content="${project.description}" />
<link rel="canonical" href="${canonical}" />
${faviconTag}
<meta property="og:type" content="website" />
<meta property="og:title" content="${pageTitle}" />
<meta property="og:description" content="${project.description}" />
<meta property="og:image" content="${ogImage}" />
<meta property="og:site_name" content="Sideband Lab" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${pageTitle}" />
<meta name="twitter:description" content="${project.description}" />
<meta name="twitter:image" content="${ogImage}" />
<script async src="https://plausible.io/js/pa-FEW5RDsDRliedckfbUUV2.js"></script>
<script>window.plausible=window.plausible||function(){(plausible.q=plausible.q||[]).push(arguments)},plausible.init=plausible.init||function(i){plausible.o=i||{}};plausible.init()</script>
`;
}
