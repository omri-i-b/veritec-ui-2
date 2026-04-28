import { CaretDown } from "@phosphor-icons/react/dist/ssr";

const navItems = ["Product", "Solutions", "Customers", "Pricing", "Docs"];

export function SiteNav() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-black/80 backdrop-blur">
      <div className="mx-auto flex h-10 max-w-[1360px] items-center justify-between px-10 text-[13px]">
        <div className="flex items-center gap-8">
          <span className="font-display text-xl leading-none tracking-tight">
            Acme<span className="italic text-white/60">.</span>
          </span>
          <nav className="flex items-center gap-5 text-white/70">
            {navItems.map((item) => (
              <a
                key={item}
                href="#"
                className="flex items-center gap-1 transition-colors hover:text-white"
              >
                {item}
                <CaretDown className="h-3 w-3 opacity-60" />
              </a>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <a href="#" className="text-white/70 transition-colors hover:text-white">
            Sign in
          </a>
          <a
            href="#contact"
            className="rounded-md bg-white px-3 py-1.5 text-[13px] font-medium text-black transition-colors hover:bg-white/90"
          >
            Get started
          </a>
        </div>
      </div>
    </header>
  );
}
