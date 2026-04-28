import Image from "next/image";

export function SiteFooter() {
  return (
    <footer className="bg-black">
      <div className="mx-auto flex max-w-[1680px] flex-col gap-6 px-12 py-12 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2.5">
          <Image
            src="/airogistic-mark.png"
            alt=""
            width={28}
            height={28}
            className="h-7 w-7"
          />
          <span className="font-display text-xl font-bold tracking-tight">
            Airogistic
          </span>
        </div>
        <div className="flex items-center gap-6 font-mono text-[10px] tracking-[0.25em] text-white/45 uppercase">
          <a href="#contact" className="transition-colors hover:text-white">
            Contact
          </a>
          <span>&copy; {new Date().getFullYear()} Airogistic, Inc.</span>
        </div>
      </div>
    </footer>
  );
}
