import { useLocation } from "react-router";
import { LinkUnderVeil } from "@/components/motion/Veil";
import { site } from "@/lib/site";

export function RunningHead() {
  const { pathname } = useLocation();
  return (
    <header className="reading-paper border-b-2 border-ink">
      <div className="mx-auto flex max-w-[76rem] flex-wrap items-center justify-between gap-x-8 gap-y-3 px-6 py-5 md:px-10">
        <LinkUnderVeil
          to="/"
          className="flex items-center gap-3 font-machine text-xs font-bold uppercase tracking-[0.14em]"
        >
          <img src="/orion-mark.svg" alt="" width={40} height={40} className="shrink-0" />
          <span>
            {site.author}
            <span className="mt-1 block text-[10px] tracking-normal">
              个人技术博客 / Python &amp; Go
            </span>
          </span>
        </LinkUnderVeil>
        <nav
          aria-label="Primary"
          className="flex flex-wrap gap-x-6 gap-y-2 font-machine text-[11px] font-bold uppercase tracking-[0.12em]"
        >
          {[
            { to: "/files", label: "Articles" },
            { to: "/lab", label: "Lab" },
            { to: "/about", label: "About" },
          ].map(({ to, label }) => (
            <LinkUnderVeil
              key={to}
              to={to}
              aria-current={pathname === to || pathname.startsWith(`${to}/`) ? "page" : undefined}
              className="border-b-2 border-transparent py-2 hover:border-ink aria-[current=page]:border-blood"
            >
              {label}
            </LinkUnderVeil>
          ))}
        </nav>
      </div>
    </header>
  );
}
