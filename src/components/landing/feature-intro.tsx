const columns = [
  {
    title: "Built for builders",
    body: "Drag-and-drop UIs, code escape hatches everywhere, and the freedom to ship what your team actually needs — without rewrites.",
  },
  {
    title: "Trusted at scale",
    body: "SOC 2 Type II, ISO 27001, HIPAA, and granular permissions. Bring your own model, your own data, your own auth.",
  },
  {
    title: "AI when you want it",
    body: "Embed agents and automations where they belong — alongside the workflows your team already uses every day.",
  },
];

export function FeatureIntro() {
  return (
    <section className="border-b border-white/10 bg-black">
      <div className="mx-auto max-w-[1680px] px-12 py-24">
        <p className="font-mono text-[11px] tracking-[0.3em] text-white/40 uppercase">
          01 &nbsp;/&nbsp; The Trust Layer
        </p>
        <h2 className="mt-4 max-w-5xl font-display text-[80px] leading-[0.95] font-bold tracking-[-0.02em] uppercase">
          AI made building easy.
          <br />
          <span className="text-white/40">Airogistic makes it </span>
          <span className="text-[#A6B0D8]">safe</span>
          <span className="text-white/40">.</span>
        </h2>
        <div className="mt-16 grid grid-cols-3 gap-10 border-t border-white/10 pt-10">
          {columns.map((col, i) => (
            <div key={col.title}>
              <p className="font-mono text-[10px] tracking-[0.25em] text-white/40 uppercase">
                {String(i + 1).padStart(2, "0")} &nbsp;/&nbsp; Pillar
              </p>
              <h3 className="mt-3 font-display text-2xl font-bold tracking-tight uppercase">
                {col.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-white/60">
                {col.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
