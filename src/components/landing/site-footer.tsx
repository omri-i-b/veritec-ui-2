import Image from "next/image";

const columns = [
  {
    heading: "Company",
    links: ["Mission", "Newsroom", "Leadership", "Careers"],
  },
  {
    heading: "Work With Us",
    links: ["Careers", "Early Career", "SkillBridge", "Open Roles"],
  },
  {
    heading: "Social",
    links: ["X", "YouTube", "Instagram", "Facebook", "LinkedIn"],
  },
];

export function SiteFooter() {
  return (
    <footer className="bg-black">
      <div className="mx-auto max-w-[1680px] px-6 py-16">
        <div className="grid grid-cols-12 gap-8 border-b border-white/10 pb-12">
          <div className="col-span-3 flex items-start gap-2">
            <Image
              src="/airogistic-mark.png"
              alt="Airogistic"
              width={28}
              height={28}
              className="h-6 w-6"
            />
            <span className="font-display text-lg font-bold tracking-tight uppercase">
              Airogistic
            </span>
          </div>
          {columns.map((col) => (
            <div key={col.heading} className="col-span-3">
              <h4 className="font-mono text-[10px] tracking-[0.3em] text-white/45 uppercase">
                {col.heading}
              </h4>
              <ul className="mt-5 space-y-2">
                {col.links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-sm text-white/75 transition-colors hover:text-white"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-8 flex items-center justify-between font-mono text-[10px] tracking-[0.25em] text-white/40 uppercase">
          <div className="flex flex-col gap-1">
            <span>&copy; {new Date().getFullYear()} Airogistic, Inc.</span>
            <span>Privacy &nbsp;·&nbsp; Terms &nbsp;·&nbsp; Cookies</span>
          </div>
          <span>Contact &nbsp;·&nbsp; hello@airogistic.com</span>
        </div>
      </div>
    </footer>
  );
}
