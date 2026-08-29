// Animation smoke probe: drives every motion primitive in a real browser
// and reports PASS/FAIL per check. Usage: node scripts/animation-check.mjs [baseURL]
import { chromium } from "playwright";

const BASE = process.argv[2] ?? "http://localhost:4175";
const results = [];
const check = (name, ok, detail = "") =>
  results.push(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? ` — ${detail}` : ""}`);

const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
const consoleErrors = [];
page.on("console", (msg) => {
  if (msg.type() === "error") consoleErrors.push(msg.text().slice(0, 140));
});
page.on("pageerror", (err) => consoleErrors.push(`pageerror: ${String(err).slice(0, 140)}`));

await page.goto(BASE + "/", { waitUntil: "networkidle" });
await page.waitForTimeout(600);

// 0. Lenis mounted + page scrollable
const lenis = await page.evaluate(() => ({
  hasClass: document.documentElement.className.includes("lenis"),
  scrollable: document.documentElement.scrollHeight > window.innerHeight,
}));
check("lenis mount + page scrollable", lenis.scrollable, `lenis class: ${lenis.hasClass}`);

// 1. AnagramText resolves (scrambled -> PYE HALL on the cover). Anchor on the
// sr-only copy, read the live aria-hidden sibling.
const anagram = await page.evaluate(async () => {
  const anchor = [...document.querySelectorAll("span.sr-only")].find(
    (n) => n.textContent === "PYE HALL",
  );
  if (!anchor) return { found: false };
  const live = anchor.nextElementSibling;
  if (!live) return { found: false };
  const first = live.textContent;
  await new Promise((r) => setTimeout(r, 2600));
  return { found: true, first, settled: live.textContent };
});
check(
  "anagram resolves to stable text",
  anagram.found && anagram.settled === "PYE HALL",
  `first="${anagram.first?.slice(0, 24)}" settled="${anagram.settled?.slice(0, 24)}"`,
);

// 2. PressTape CSS animation actually advances the track transform
const tape = await page.evaluate(async () => {
  const track = document.querySelector(".press-tape-track");
  if (!track) return { found: false };
  const read = () => getComputedStyle(track).transform;
  const a = read();
  await new Promise((r) => setTimeout(r, 700));
  const b = read();
  const anim = track.getAnimations?.()[0];
  return {
    found: true,
    a,
    b,
    moved: a !== b,
    animName: anim?.animationName ?? "none",
    state: anim?.playState ?? "n/a",
  };
});
check(
  "press tape scrolls (transform advances)",
  tape.found && tape.moved,
  `anim=${tape.animName} state=${tape.state}`,
);

// 3. Typewriter types on the lab page (progresses between two samples)
await page.goto(BASE + "/lab", { waitUntil: "networkidle" });
await page.waitForTimeout(1200);
const typewriter = await page.evaluate(async () => {
  const findAnchor = () =>
    [...document.querySelectorAll("span.sr-only")].find((n) =>
      /^every file begins/i.test(n.textContent ?? ""),
    );
  let anchor = findAnchor();
  for (let i = 0; i < 20 && !anchor; i++) {
    await new Promise((r) => setTimeout(r, 200));
    anchor = findAnchor();
  }
  if (!anchor) return { found: false };
  const live = anchor.nextElementSibling;
  if (!live) return { found: false };
  const first = live.textContent;
  await new Promise((r) => setTimeout(r, 1500));
  return { found: true, first, after: live.textContent };
});
check(
  "typewriter types forward",
  typewriter.found && (typewriter.after?.length ?? 0) > (typewriter.first?.length ?? 0),
  `"${typewriter.first?.slice(0, 30)}" -> "${typewriter.after?.slice(0, 30)}"`,
);

// 4. HorizontalRail scrubs translateX with vertical scroll
const rail = await page.evaluate(async () => {
  const track = document.querySelector('[data-testid="rail-track"]');
  const outer = track?.closest("[data-variant]");
  if (!track || !outer) return { found: false };
  const readX = () => getComputedStyle(track).transform;
  const before = readX();
  outer.scrollIntoView({ block: "start" });
  await new Promise((r) => setTimeout(r, 300));
  window.scrollBy(0, 600);
  await new Promise((r) => setTimeout(r, 700));
  const after = readX();
  return {
    found: true,
    variant: outer.getAttribute("data-variant"),
    before,
    after,
    moved: before !== after,
  };
});
check(
  "horizontal rail scrubs on scroll",
  rail.found && rail.moved,
  `variant=${rail.variant} before=${rail.before?.slice(0, 32)} after=${rail.after?.slice(0, 32)}`,
);

// 5. CenterSeam keyboard support moves the seam
const seam = await page.evaluate(async () => {
  const handle = document.querySelector('[role="separator"]');
  if (!handle) return { found: false };
  const read = () => handle.getAttribute("aria-valuenow");
  handle.focus();
  const before = read();
  handle.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }));
  await new Promise((r) => setTimeout(r, 150));
  return { found: true, before, after: read() };
});
check(
  "center seam responds to arrow keys",
  seam.found && seam.before !== seam.after,
  `${seam.before}% -> ${seam.after}%`,
);

// 6. World toggle flips html[data-world]
const world = await page.evaluate(async () => {
  const sw = document.querySelector('[role="switch"]');
  if (!sw) return { found: false };
  const before = document.documentElement.dataset.world;
  sw.dispatchEvent(new MouseEvent("click", { bubbles: true }));
  await new Promise((r) => setTimeout(r, 900));
  return { found: true, before, after: document.documentElement.dataset.world };
});
check(
  "world toggle flips data-world",
  world.found && world.before !== world.after,
  `${world.before} -> ${world.after}`,
);

// 7. Reading folio advances on the article page + chapter numeral parallax
await page.goto(BASE + "/files/the-case-of-the-vanishing-gradient", { waitUntil: "networkidle" });
await page.waitForTimeout(600);
const folio = await page.evaluate(async () => {
  const folioEl = document.querySelector('[role="progressbar"]');
  const numeral = document.querySelector("span.text-outline");
  if (!folioEl) return { found: false };
  const readPage = () => folioEl.textContent?.match(/Folio (\d+)/)?.[1];
  const readY = () => numeral?.style.transform ?? "none";
  const before = readPage();
  const numBefore = readY();
  window.scrollTo(0, document.body.scrollHeight * 0.6);
  await new Promise((r) => setTimeout(r, 900));
  return { found: true, before, after: readPage(), numBefore, numAfter: readY() };
});
check(
  "reading folio advances with scroll",
  folio.found && folio.before !== folio.after,
  `${folio.before} -> ${folio.after}`,
);
check(
  "chapter numeral parallax moves",
  folio.found && folio.numBefore !== folio.numAfter,
  `"${folio.numBefore}" -> "${folio.numAfter}"`,
);

// 8. Veil travel navigates and reveals
await page.goto(BASE + "/files", { waitUntil: "networkidle" });
await page.waitForTimeout(500);
const link = [
  ...(await page.evaluate(() =>
    [...document.querySelectorAll("a")].map((a) => a.getAttribute("href")),
  )),
].includes("/files/the-case-of-the-blazing-build");
await page.evaluate(() => {
  const link = [...document.querySelectorAll("a")].find(
    (a) => a.getAttribute("href") === "/files/the-case-of-the-blazing-build",
  );
  link?.click();
});
let veilUrl = "";
try {
  await page.waitForURL("**/files/the-case-of-the-blazing-build", { timeout: 8000 });
  veilUrl = new URL(page.url()).pathname;
  await page.waitForTimeout(800);
} catch {
  veilUrl = page.url();
}
check(
  "veil-covered navigation lands",
  veilUrl === "/files/the-case-of-the-blazing-build",
  veilUrl + ` linkPresent=${link}`,
);

// 9. Search UI present on the archive wall (or politely degraded in dev)
await page.goto(BASE + "/files", { waitUntil: "networkidle" });
await page.waitForTimeout(900);
const search = await page.evaluate(() => {
  const input = document.querySelector('input[aria-label="Search the archive"]');
  const notice = document.body.textContent?.includes("Index unavailable in this printing");
  return { present: Boolean(input) || Boolean(notice) };
});
check("archive search present or degraded", search.present);

check("no console errors", consoleErrors.length === 0, consoleErrors.join(" | ").slice(0, 200));

await browser.close();
console.log(results.join("\n"));
const failed = results.filter((r) => r.startsWith("FAIL"));
process.exit(failed.length ? 1 : 0);
