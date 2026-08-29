// Frame pacing during real wheel scrolling on the heavy cover page.
import { chromium } from "playwright";

const BASE = "http://localhost:4175";
const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
await page.goto(BASE + "/", { waitUntil: "networkidle" });
await page.waitForTimeout(800);

await page.evaluate(() => {
  window.__frames = [];
  let last = performance.now();
  const loop = (t) => {
    window.__frames.push(t - last);
    last = t;
    if (window.__frames.length < 4000) requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);
});

for (let i = 0; i < 12; i++) {
  await page.mouse.wheel(0, 500);
  await page.waitForTimeout(150);
}
await page.waitForTimeout(400);

const report = await page.evaluate(() => {
  const f = window.__frames.filter((d, i) => i > 2 && d < 1000);
  f.sort((a, b) => a - b);
  const p = (q) => Math.round(f[Math.floor(f.length * q)] ?? 0);
  const long = f.filter((d) => d > 34).length;
  return {
    samples: f.length,
    p50: p(0.5),
    p90: p(0.9),
    p99: p(0.99),
    max: Math.round(f[f.length - 1] ?? 0),
    longFrames: long,
  };
});
console.log("frame pacing (ms):", JSON.stringify(report));
await browser.close();
