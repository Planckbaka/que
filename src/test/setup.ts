import "@testing-library/jest-dom/vitest";

import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

class IntersectionObserverMock {
  readonly root = null;
  readonly rootMargin = "";
  readonly thresholds: ReadonlyArray<number> = [];

  observe(): void {}
  unobserve(): void {}
  disconnect(): void {}
  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }
}

globalThis.IntersectionObserver =
  IntersectionObserverMock as unknown as typeof IntersectionObserver;

// jsdom 未实现 matchMedia；a7 之后 SmoothScroll/Veil/WorldWipe 会在调用时读取
// prefers-reduced-motion，这里提供「未降级」默认环境（matches:false）。
// reduced 场景测试用 vi.stubGlobal 覆盖，收尾 unstubAllGlobals 回到此默认值。
globalThis.matchMedia = ((query: string) => ({
  matches: false,
  media: query,
  addEventListener: () => {},
  removeEventListener: () => {},
  addListener: () => {},
  removeListener: () => {},
  dispatchEvent: () => false,
})) as unknown as typeof matchMedia;

afterEach(() => {
  cleanup();
});
