const logos = [
  "BOEING",
  "MERIDIAN",
  "NORTHWIND",
  "ORION",
  "RUTHERFORD",
  "VANGUARD",
  "HALCYON",
  "ATLAS",
];

const stats = [
  { value: "0", label: "Vehicles lost to a bad parameter on Airogistic" },
  { value: "10×", label: "Faster test cycles vs. manual checklists" },
  { value: "<$2K", label: "Per month — a fraction of legacy fleet tools" },
  { value: "100%", label: "Of flights replayable from logged config + telemetry" },
];

export function SocialProof() {
  return (
    <section className="border-b border-white/10 bg-black">
      <div className="mx-auto max-w-[1680px] px-12 py-24">
        <p className="font-mono text-[11px] tracking-[0.3em] text-white/40 uppercase">
          04 &nbsp;/&nbsp; The Receipts
        </p>
        <h2 className="mt-4 max-w-4xl font-display text-[44px] leading-[0.95] font-bold tracking-[-0.02em] uppercase">
          Trusted by teams flying real fleets.
        </h2>

        <div className="mt-14 grid grid-cols-4 border-t border-l border-white/10">
          {logos.map((logo) => (
            <div
              key={logo}
              className="flex h-24 items-center justify-center border-r border-b border-white/10 font-mono text-[11px] tracking-[0.3em] text-white/45"
            >
              {logo}
            </div>
          ))}
        </div>

        <div className="mt-10 grid grid-cols-4 gap-3">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="border border-white/10 bg-black p-6"
            >
              <div className="font-display text-5xl font-bold tracking-tight tabular-nums">
                {stat.value}
              </div>
              <p className="mt-3 text-sm leading-relaxed text-white/55">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
