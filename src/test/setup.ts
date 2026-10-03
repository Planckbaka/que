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

// Node ≥24 的 undici 对 RequestInit.signal 做品牌检查，而 vitest jsdom 环境
// 把 globalThis.AbortController 换成了 jsdom 版本 —— react-router 的
// createClientSideRequest 拿着 jsdom signal 去 new undici Request，导航在
// 初始化阶段就死掉（loader 错误永远到不了 errorElement）。探测到失配时
// 包装 Request：无 signal 构建（通过检查），再把外部 signal 以实例属性
// 影子挂回。Node 22 / 未来修复版本上探测通过，包装完全惰性。
try {
  new Request("https://magpie.test/probe", {
    signal: new AbortController().signal,
  });
} catch {
  const UndiciRequest = globalThis.Request;
  class SignalSafeRequest extends UndiciRequest {
    constructor(input: RequestInfo | URL, init?: RequestInit) {
      const { signal, ...rest } = init ?? {};
      super(input, rest);
      if (signal) {
        Object.defineProperty(this, "signal", {
          value: signal,
          writable: true,
          configurable: true,
        });
      }
    }
  }
  globalThis.Request = SignalSafeRequest;
}

afterEach(() => {
  cleanup();
});
