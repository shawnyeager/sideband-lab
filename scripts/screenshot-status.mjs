import puppeteer from 'puppeteer';

const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
const page = await browser.newPage();
await page.setViewport({ width: 740, height: 1200, deviceScaleFactor: 2 });
await page.goto('http://localhost:4321/status/', { waitUntil: 'networkidle0' });

// Capture top of page through status banner + a few component bars
const clip = await page.evaluate(() => {
  const pg = document.querySelector('.page');
  const banner = document.querySelector('.status-banner');
  const pgRect = pg.getBoundingClientRect();
  const bannerRect = banner.getBoundingClientRect();
  return {
    x: pgRect.x,
    y: pgRect.y,
    width: pgRect.width,
    height: bannerRect.bottom - pgRect.top + 300
  };
});

await page.screenshot({
  path: 'public/img/projects/status.png',
  clip,
  type: 'png'
});

console.log(`Screenshot saved: ${clip.width * 2}x${clip.height * 2} (${clip.width}x${clip.height} @ 2x)`);
await browser.close();
