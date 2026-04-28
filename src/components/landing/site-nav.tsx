import Image from "next/image";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";

export function SiteNav() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-black/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-[1680px] items-center justify-between px-12">
        <div className="flex items-center gap-2.5">
          <Image
            src="/airogistic-mark.png"
            alt=""
            width={28}
            height={28}
            className="h-7 w-7"
            priority
          />
          <span className="font-display text-[22px] leading-none font-bold tracking-tight">
            Airogistic
          </span>
        </div>
        <a
          href="#contact"
          className="inline-flex items-center gap-1.5 bg-white px-4 py-2 font-mono text-[11px] tracking-[0.25em] text-black uppercase transition-colors hover:bg-white/90"
        >
          Book a demo
          <ArrowRight className="h-3 w-3" weight="bold" />
        </a>
      </div>
    </header>
  );
}
