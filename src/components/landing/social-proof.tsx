const logos = ["ACME CO", "GLOBEX", "INITECH", "SOYLENT", "UMBRELLA", "STARK", "MASSIVE", "PIED PIPER"];

const stats = [
  { value: "50,000+", label: "Apps shipped on Acme this year" },
  { value: "90%", label: "Of Fortune 500s have an Acme deployment" },
  { value: "$1.2B", label: "In annual operations costs saved by customers" },
  { value: "4.9/5", label: "Average G2 rating across 1,200+ reviews" },
];

export function SocialProof() {
  return (
    <section className="border-b border-white/10">
      <div className="mx-auto max-w-[1360px] border-x border-white/10 px-10 py-24">
        <p className="mb-5 font-mono text-[11px] tracking-[0.3em] text-white/40 uppercase">
          04 &nbsp;/&nbsp; The Receipts
        </p>
        <h2 className="max-w-2xl font-display text-[52px] leading-[1.05] tracking-[-0.02em]">
          Built by — and{" "}
          <span className="italic text-white/75">chosen</span> by —
          <br />
          businesses of all sizes.
        </h2>

        <div className="mt-14 grid grid-cols-4 border-t border-l border-white/10">
          {logos.map((logo) => (
            <div
              key={logo}
              className="flex h-24 items-center justify-center border-r border-b border-white/10 font-mono text-[12px] tracking-[0.25em] text-white/45"
            >
              {logo}
            </div>
          ))}
        </div>

        <div className="mt-12 grid grid-cols-4 gap-6">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl border border-white/10 bg-white/[0.03] p-6"
            >
              <div className="font-display text-4xl tracking-tight tabular-nums">{stat.value}</div>
              <p className="mt-2 text-sm leading-relaxed text-white/55">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
