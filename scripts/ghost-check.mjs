// Lossless mid-scroll screenshots (video encoders ghost; PNGs don't lie).
import { chromium } from "playwright";

const BASE = "http://localhost:4175";
const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
await page.goto(BASE + "/", { waitUntil: "networkidle" });
await page.waitForTimeout(800);
for (const [i, frac] of [0.2, 0.35, 0.5, 0.65].entries()) {
  await page.evaluate((f) => window.scrollTo(0, document.body.scrollHeight * f), frac);
  await page.waitForTimeout(650);
  await page.screenshot({ path: `/tmp/ghost-${i}.png` });
}
// world toggle: capture overlay mid-wipe
await page.evaluate(() => window.scrollTo(0, 0));
await page.waitForTimeout(500);
await page.evaluate(() => {
  const sw = document.querySelector('[role="switch"]');
  sw?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
});
await page.waitForTimeout(250);
await page.screenshot({ path: "/tmp/wipe-mid.png" });
await page.waitForTimeout(1200);
await page.screenshot({ path: "/tmp/wipe-end.png" });
await browser.close();
console.log("captured");
