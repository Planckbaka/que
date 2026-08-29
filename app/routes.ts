// app/routes.ts - the RRv7 plugin reads its route config from the app directory.
// Explicit mapping per task brief; module paths reach into ../src (resolved via path.resolve).
import { index, layout, type RouteConfig, route } from "@react-router/dev/routes";

export default [
  layout("../src/pages/SeoLayout.tsx", [
    index("../src/pages/ShowcasePage.tsx"),
    route("files/:slug", "../src/pages/FilePage.tsx"),
  ]),
  route("*", "../src/pages/NotFoundRedirect.tsx"),
] satisfies RouteConfig;
