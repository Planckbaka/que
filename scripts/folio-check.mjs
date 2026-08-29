// Compare ReadingFolio behavior: direct load vs veil navigation.
import { chromium } from "playwright";

const BASE = "http://localhost:4175";
const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });

async function sampleFolio() {
  return page.evaluate(() => ({
    folio: document.querySelector('[role="progressbar"]')?.textContent ?? "none",
    scrollY: Math.round(window.scrollY),
  }));
}

// A. direct load
await page.goto(BASE + "/files/the-case-of-the-vanishing-gradient", { waitUntil: "networkidle" });
await page.waitForTimeout(600);
const direct = [];
for (let i = 1; i <= 4; i++) {
  await page.evaluate((frac) => window.scrollTo(0, document.body.scrollHeight * frac), i * 0.25);
  await page.waitForTimeout(400);
  direct.push(await sampleFolio());
}
console.log("DIRECT :", JSON.stringify(direct));

// B. veil navigation from /files
await page.goto(BASE + "/files", { waitUntil: "networkidle" });
await page.waitForTimeout(500);
await page.evaluate(() => {
  const link = [...document.querySelectorAll("a")].find(
    (a) => a.getAttribute("href") === "/files/the-case-of-the-vanishing-gradient",
  );
  link?.click();
});
await page.waitForTimeout(1600);
console.log("VEIL landed:", JSON.stringify(await sampleFolio()));
const veil = [];
for (let i = 1; i <= 4; i++) {
  await page.evaluate((frac) => window.scrollTo(0, document.body.scrollHeight * frac), i * 0.25);
  await page.waitForTimeout(400);
  veil.push(await sampleFolio());
}
console.log("VEIL   :", JSON.stringify(veil));

await browser.close();
