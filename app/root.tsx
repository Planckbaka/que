// app/root.tsx - thin entry shim: the RRv7 plugin resolves the root route strictly under app/.
// Implementation lives in src/root.tsx and stays the single source of truth.
export { default, Layout } from "../src/root";
