import Image from "next/image";
import { MagnifyingGlass } from "@phosphor-icons/react/dist/ssr";

const navItems = ["Apps", "Workflows", "AI", "Data", "Security"];

export function SiteNav() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-black/85 backdrop-blur">
      <div className="mx-auto flex h-12 max-w-[1680px] items-center justify-between px-6 text-[11px] tracking-[0.2em] uppercase">
        <div className="flex items-center gap-2">
          <Image
            src="/airogistic-mark.png"
            alt="Airogistic"
            width={24}
            height={24}
            className="h-5 w-5"
            priority
          />
          <span className="font-semibold">Airogistic</span>
        </div>
        <nav className="flex items-center gap-8 text-white/70">
          {navItems.map((item) => (
            <a
              key={item}
              href="#"
              className="transition-colors hover:text-white"
            >
              {item}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-6 text-white/70">
          <button
            type="button"
            className="flex items-center gap-1.5 transition-colors hover:text-white"
          >
            <MagnifyingGlass className="h-3 w-3" weight="bold" />
            Search
          </button>
          <a href="#contact" className="transition-colors hover:text-white">
            Company
          </a>
        </div>
      </div>
    </header>
  );
}
