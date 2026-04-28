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
    <section className="border-b border-white/10">
      <div className="mx-auto max-w-[1360px] border-x border-white/10 px-10 py-28">
        <p className="mb-6 font-mono text-[11px] tracking-[0.3em] text-white/40 uppercase">
          01 &nbsp;/&nbsp; The Trust Layer
        </p>
        <h2 className="max-w-3xl font-display text-[64px] leading-[1.05] tracking-[-0.02em]">
          AI made <span className="italic text-white/70">building</span> easy.
          <br />
          <span className="text-white/45">Acme makes it </span>
          <span className="italic">safe</span>
          <span className="text-white/45">.</span>
        </h2>
        <div className="mt-16 grid grid-cols-3 gap-10">
          {columns.map((col) => (
            <div key={col.title}>
              <h3 className="text-base font-semibold">{col.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-white/60">
                {col.body}
              </p>
            </div>
          ))}
        </div>
        <div className="mt-16 aspect-[16/7] rounded-xl border border-white/10 bg-gradient-to-br from-white/5 via-white/[0.02] to-white/5" />
      </div>
    </section>
  );
}
