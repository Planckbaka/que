// Record videos of key animation moments for visual inspection.
import { chromium } from "playwright";

const BASE = process.argv[2] ?? "http://localhost:4175";
const browser = await chromium.launch({ channel: "chrome", headless: true });
const ctx = await browser.newContext({
  viewport: { width: 1280, height: 800 },
  recordVideo: { dir: "/tmp/anim-videos", size: { width: 1280, height: 800 } },
});
const page = await ctx.newPage();

// Home load: anagram resolve, typewriter, tape, page flutter
await page.goto(BASE + "/", { waitUntil: "networkidle" });
await page.waitForTimeout(3500);
// scroll through cover slowly (rail scrub, seam, counter)
await page.evaluate(async () => {
  const step = window.innerHeight / 2;
  for (let y = 0; y <= document.body.scrollHeight; y += step) {
    window.scrollTo(0, y);
    await new Promise((r) => setTimeout(r, 350));
  }
});
await page.waitForTimeout(800);

// Lab: typewriter + anagram + veil demo
await page.goto(BASE + "/lab", { waitUntil: "networkidle" });
await page.waitForTimeout(3000);

// Veil navigation from files -> article
await page.goto(BASE + "/files", { waitUntil: "networkidle" });
await page.waitForTimeout(600);
await page.evaluate(() => {
  const link = [...document.querySelectorAll("a")].find(
    (a) => a.getAttribute("href") === "/files/the-case-of-the-blazing-build",
  );
  link?.click();
});
await page.waitForTimeout(1800);
// article scroll: folio + numeral
await page.evaluate(async () => {
  const step = window.innerHeight / 2;
  for (let y = 0; y <= document.body.scrollHeight * 0.8; y += step) {
    window.scrollTo(0, y);
    await new Promise((r) => setTimeout(r, 300));
  }
});
await page.waitForTimeout(600);
await ctx.close();
await browser.close();
console.log("recorded to /tmp/anim-videos");
