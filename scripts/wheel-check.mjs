// Real-user path: Lenis wheel scrolling + hover animations + counter spring.
import { chromium } from "playwright";

const BASE = "http://localhost:4175";
const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
const errors = [];
page.on("pageerror", (e) => errors.push(String(e).slice(0, 120)));
await page.goto(BASE + "/", { waitUntil: "networkidle" });
await page.waitForTimeout(800);

// A. Wheel scroll: sample scrollY over time — Lenis should lerp smoothly (no jumps back)
const samples = [];
for (let i = 0; i < 10; i++) {
  await page.mouse.wheel(0, 400);
  await page.waitForTimeout(120);
  samples.push(await page.evaluate(() => Math.round(window.scrollY)));
}
const monotonic = samples.every((v, i) => i === 0 || v >= samples[i - 1]);
console.log("wheel scrollY samples:", samples.join(", "), "| monotonic:", monotonic);

// B. After wheel scrolling, does rail scrub still track? Scroll to rail and wheel more.
await page.evaluate(() => {
  document
    .querySelector('[data-testid="rail-track"]')
    ?.closest("[data-variant]")
    ?.scrollIntoView({ block: "start" });
});
await page.waitForTimeout(400);
const railBefore = await page.evaluate(
  () => getComputedStyle(document.querySelector('[data-testid="rail-track"]')).transform,
);
await page.mouse.wheel(0, 500);
await page.waitForTimeout(800);
const railAfter = await page.evaluate(
  () => getComputedStyle(document.querySelector('[data-testid="rail-track"]')).transform,
);
console.log(
  "rail wheel scrub:",
  railBefore.slice(0, 30),
  "->",
  railAfter.slice(0, 30),
  "| moved:",
  railBefore !== railAfter,
);

// C. MagpieCounter spring pop
await page.evaluate(() => document.querySelector("button")?.scrollIntoView({ block: "center" }));
const counterBtn = page.getByRole("button", { name: /magpie more/i });
await counterBtn.scrollIntoViewIfNeeded();
await page.waitForTimeout(300);
const before = await page.evaluate(
  () => document.querySelector('[aria-live="polite"]')?.textContent,
);
await counterBtn.click();
await page.waitForTimeout(700);
const after = await page.evaluate(
  () => document.querySelector('[aria-live="polite"]')?.textContent,
);
console.log("counter spring:", before, "->", after);

// D. Redacted hover reveal (black world case notes)
const redacted = page.locator("span[title]").first();
if (await redacted.count()) {
  const beforeColor = await redacted.evaluate((el) => getComputedStyle(el).backgroundColor);
  await redacted.hover();
  await page.waitForTimeout(300);
  const afterColor = await redacted.evaluate((el) => getComputedStyle(el).backgroundColor);
  console.log(
    "redacted hover bg:",
    beforeColor,
    "->",
    afterColor,
    "| changed:",
    beforeColor !== afterColor,
  );
}

// E. HalftoneReveal hover (lab) — background-size 7px -> 3px
await page.goto(BASE + "/lab", { waitUntil: "networkidle" });
await page.waitForTimeout(600);
// Lab uses HalftoneImage (static) — HalftoneReveal lives on... check if present anywhere
const revealCount = await page.evaluate(() => document.querySelectorAll(".halftone").length);
console.log("halftone layers on lab:", revealCount);

console.log("pageerrors:", errors.length ? errors.join(" | ") : "none");
await browser.close();
