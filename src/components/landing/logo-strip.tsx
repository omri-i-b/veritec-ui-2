const logos = ["BOEING", "MERIDIAN", "NORTHWIND", "ORION", "RUTHERFORD", "VANGUARD"];

export function LogoStrip() {
  return (
    <section className="border-b border-white/10 bg-black">
      <div className="mx-auto grid max-w-[1680px] grid-cols-6">
        {logos.map((logo, i) => (
          <div
            key={logo}
            className={`flex h-20 items-center justify-center font-mono text-[11px] tracking-[0.3em] text-white/45 ${
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
