// src/pages/NotFoundRedirect.tsx
import { Navigate } from "react-router";
import { site } from "@/lib/site";

export function meta() {
  return [
    { title: `Sealed File · ${site.title}` },
    { name: "description", content: site.description },
  ];
}

export default function NotFoundRedirect() {
  return <Navigate to="/" replace />;
}
