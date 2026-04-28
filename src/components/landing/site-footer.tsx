const columns = [
  {
    heading: "Product",
    links: ["Apps", "Workflows", "Database", "AI", "Mobile", "Pricing"],
  },
  {
    heading: "Solutions",
    links: ["Operations", "Support", "Finance", "Sales", "Engineering"],
  },
  {
    heading: "Resources",
    links: ["Docs", "Templates", "Blog", "Customers", "Community", "Changelog"],
  },
  {
    heading: "Company",
    links: ["About", "Careers", "Press", "Security", "Contact"],
  },
];

export function SiteFooter() {
  return (
    <footer className="bg-black">
      <div className="mx-auto max-w-[1360px] border-x border-white/10 px-10 py-16">
        <div className="grid grid-cols-5 gap-10">
          <div className="col-span-1">
            <span className="font-display text-2xl tracking-tight">
              Acme<span className="italic text-white/60">.</span>
            </span>
            <p className="mt-3 text-sm text-white/50">
              The platform for{" "}
              <span className="italic">internal software</span>.
            </p>
          </div>
          {columns.map((col) => (
            <div key={col.heading}>
              <h4 className="font-mono text-[11px] tracking-[0.25em] text-white/80 uppercase">
                {col.heading}
              </h4>
              <ul className="mt-4 space-y-2">
                {col.links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-sm text-white/55 transition-colors hover:text-white"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-16 flex items-center justify-between border-t border-white/10 pt-6 text-xs text-white/40">
          <span>&copy; {new Date().getFullYear()} Acme, Inc.</span>
          <div className="flex gap-5">
            <a href="#" className="hover:text-white/70">Privacy</a>
            <a href="#" className="hover:text-white/70">Terms</a>
            <a href="#" className="hover:text-white/70">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
