import { useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";

const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ&#%?";

/** FNV-1a：把任意字符串折叠为 32 位确定性种子 */
function fnv1a(text: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

/** mulberry32：由 32 位种子生成确定性的 [0, 1) 随机流 */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** 确定性乱序：同 text 同输出序列，预渲染 HTML 与客户端一致 */
function seededScramble(text: string): string {
  const random = mulberry32(fnv1a(text));
  let out = "";
  for (const ch of text) {
    out += ch === " " ? " " : GLYPHS[Math.floor(random() * GLYPHS.length)];
  }
  return out;
}

type AnagramTextProps = {
  text: string;
  className?: string;
  delay?: number;
  beat?: number;
};

export function AnagramText({ text, className, delay = 350, beat = 110 }: AnagramTextProps) {
  const reduced = useReducedMotion();
  // 水合契约：首帧恒为确定性乱序（与预渲染 HTML 一致）；reduced 用户由挂载 effect 置为明文。
  // 切勿在初始化器里按 reduced 分叉——服务端 reduced 恒为 falsy，会固化出与客户端不同的首帧。
  const [display, setDisplay] = useState(() => seededScramble(text));

  useEffect(() => {
    if (reduced) {
      setDisplay(text);
      return;
    }
    setDisplay(seededScramble(text));
    const start = Date.now() + delay;
    const id = window.setInterval(() => {
      // Math.max 防负切片：延迟期内 tick 落在 start 之前，floor 为负会把 slice 变成"去尾"，
      // 造成「半解→回乱」的视觉怪象；钳制到 0 = 延迟期内保持完整乱序。
      const resolved = Math.max(0, Math.floor((Date.now() - start) / beat));
      if (resolved >= text.length) {
        setDisplay(text);
        window.clearInterval(id);
        return;
      }
      setDisplay(text.slice(0, resolved) + seededScramble(text.slice(resolved)));
    }, 55);
    return () => window.clearInterval(id);
  }, [text, reduced, delay, beat]);

  return (
    <span className={className}>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">{display}</span>
    </span>
  );
}
