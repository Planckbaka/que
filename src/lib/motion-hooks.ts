import { useEffect, useState } from "react";

/**
 * 实时订阅 prefers-reduced-motion：初值恒 false（与预渲染 HTML 同构——结构级
 * 分支若按探测值初渲染，reduced 客户端首帧会与 prerender 结果不一致，React
 * #418）；挂载后立即采样，偏好中途切换即时生效。Motion 的 transform 值本就
 * 不进 SSR HTML，所以晚一帧冻结没有可见代价。ChapterNumeral / HorizontalRail
 * 共用；SmoothScroll 保留自己的监听——它还要管理 Lenis 实例的创建与销毁。
 */
export function useLivePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);
  return reduced;
}
