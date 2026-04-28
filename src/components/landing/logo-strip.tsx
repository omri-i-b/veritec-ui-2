const logos = ["ACME CO", "GLOBEX", "INITECH", "SOYLENT", "UMBRELLA", "STARK"];

export function LogoStrip() {
  return (
    <section className="border-b border-white/10">
      <div className="mx-auto grid max-w-[1360px] grid-cols-6 border-x border-white/10">
        {logos.map((logo, i) => (
          <div
            key={logo}
            className={`flex h-24 items-center justify-center font-mono text-[12px] tracking-[0.25em] text-white/45 ${
              i < logos.length - 1 ? "border-r border-white/10" : ""
            }`}
          >
            {logo}
          </div>
        ))}
      </div>
    </section>
  );
}
