const columns = [
  {
    title: "Bad config kills vehicles",
    body: "Most lost drones aren't bugs — they're a parameter someone tweaked and pushed without review.",
  },
  {
    title: "Tests don't repeat",
    body: "Manual checklists drift. The flight that passed last week fails today and nobody knows what changed.",
  },
  {
    title: "Field and cloud are split",
    body: "Field teams log to spreadsheets. HQ has no view. Nothing lines up when something goes wrong.",
  },
];

export function FeatureIntro() {
  return (
    <section className="border-b border-white/10 bg-black">
      <div className="mx-auto max-w-[1680px] px-12 py-20">
        <p className="font-mono text-[11px] tracking-[0.3em] text-white/40 uppercase">
          01 &nbsp;/&nbsp; The Problem
        </p>
        <h2 className="mt-4 max-w-4xl font-display text-[44px] leading-[0.95] font-bold tracking-[-0.02em] uppercase">
          Drones don&rsquo;t crash from bugs.
          <br />
          <span className="text-white/45">They crash from </span>
          <span className="text-[#A6B0D8]">bad config</span>
          <span className="text-white/45">.</span>
        </h2>
        <div className="mt-12 grid grid-cols-3 gap-10 border-t border-white/10 pt-10">
          {columns.map((col) => (
            <div key={col.title}>
              <h3 className="font-display text-xl font-bold tracking-tight uppercase">
                {col.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-white/60">
                {col.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
