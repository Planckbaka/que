import { describe, expect, it } from "vitest";
import { getViews, like, subscribe } from "@/lib/api";

describe("api seam (D4)", () => {
  it("returns a deterministic mock view count per slug", async () => {
    const first = await getViews("the-case-of-the-blazing-build");
    const second = await getViews("the-case-of-the-blazing-build");
    expect(first).toEqual({ slug: "the-case-of-the-blazing-build", count: first.count });
    expect(second.count).toBe(first.count);
    expect(first.count).toBeGreaterThan(0);
    const other = await getViews("one-for-sorrow-attention-is-a-witness");
    expect(other.count).not.toBe(first.count);
  });

  it("reports likes as out of service, with the future contract shape", async () => {
    const result = await like("the-case-of-the-blazing-build");
    expect(result).toEqual({ ok: false, reason: "api-not-in-service" });
  });

  it("reports subscriptions as out of service", async () => {
    const result = await subscribe("reader@example.com");
    expect(result).toEqual({ ok: false, reason: "api-not-in-service" });
  });
});
