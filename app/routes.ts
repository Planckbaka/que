// app/routes.ts - the RRv7 plugin reads its route config from the app directory.
// Explicit mapping per task brief; module paths reach into ../src (resolved via path.resolve).
import { index, type RouteConfig, route } from "@react-router/dev/routes";

export default [
  index("../src/pages/ShowcasePage.tsx"),
  route("*", "../src/pages/NotFoundRedirect.tsx"),
] satisfies RouteConfig;
