import puppeteer from 'puppeteer';

const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
const page = await browser.newPage();
await page.setViewport({ width: 1050, height: 2000, deviceScaleFactor: 2 });
await page.goto('http://localhost:4321/three-body-problem/', { waitUntil: 'networkidle0' });

// Wait for simulation to finish rendering
await new Promise(r => setTimeout(r, 2000));

// Get the bounding box of the full navy block (chart-container + zone-bar)
const clip = await page.evaluate(() => {
  const chart = document.querySelector('.chart-container');
  const zoneBar = document.querySelector('.zone-bar');
  const chartRect = chart.getBoundingClientRect();
  const zoneRect = zoneBar.getBoundingClientRect();
  return {
    x: chartRect.x,
    y: chartRect.y,
    width: chartRect.width,
    height: zoneRect.bottom - chartRect.top
  };
});

await page.screenshot({
  path: 'public/img/projects/three-body-problem.png',
  clip,
  type: 'png'
});

console.log(`Screenshot saved: ${clip.width}x${clip.height} @ 2x`);
await browser.close();
