import { Magpie } from "@/components/magpie/silhouettes";
import { LinkUnderVeil } from "@/components/motion/Veil";
import { site } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer data-world="black" className="border-t-2 border-paper/30 bg-ink text-paper">
      <div className="mx-auto grid max-w-[76rem] gap-8 px-6 py-12 md:grid-cols-[1fr_auto] md:px-10">
        <div>
          <div className="flex items-center gap-3">
            <img
              src="/orion-mark.svg"
              alt=""
              width={40}
              height={40}
              className="shrink-0 border border-paper/30"
            />
            <p className="font-display text-3xl uppercase">{site.title}</p>
          </div>
          <p className="mt-3 max-w-sm font-body text-lg">
            A Python and Go backend engineer’s notebook on services, concurrency, and AI
            infrastructure.
          </p>
          {/* suppressHydrationWarning: the prerendered year and a client
              midnight-at-New-Year render can disagree by one year. */}
          <p
            suppressHydrationWarning
            className="mt-5 font-machine text-[10px] uppercase tracking-[0.12em]"
          >
            © {new Date().getFullYear()} {site.author}
          </p>
        </div>
        <nav
          aria-label="Footer"
          className="flex flex-wrap items-start gap-6 font-machine text-xs font-bold uppercase tracking-[0.12em]"
        >
          <LinkUnderVeil to="/files" className="py-2">
            Articles
          </LinkUnderVeil>
          <LinkUnderVeil to="/about" className="py-2">
            About
          </LinkUnderVeil>
          <a href={site.github} className="py-2">
            GitHub <span aria-hidden="true">↗</span>
          </a>
          <a href="/rss.xml" className="border-b border-paper py-2">
            RSS Feed <span aria-hidden="true">↗</span>
          </a>
        </nav>
      </div>
      <div className="mx-auto flex max-w-[71rem] items-center justify-between gap-4 border-t border-paper/30 px-6 py-5 font-machine text-[10px] uppercase tracking-[0.1em]">
        <span>Written with curiosity. Read at your own pace.</span>
        <Magpie aria-hidden="true" className="size-6 shrink-0" />
      </div>
    </footer>
  );
}
