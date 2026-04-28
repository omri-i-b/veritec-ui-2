export function Showcase() {
  return (
    <section className="border-b border-white/10">
      <div className="mx-auto max-w-[1360px] border-x border-white/10 px-10 py-24">
        <p className="mb-5 font-mono text-[11px] tracking-[0.3em] text-white/40 uppercase">
          03 &nbsp;/&nbsp; The Canvas
        </p>
        <h2 className="max-w-2xl font-display text-[52px] leading-[1.05] tracking-[-0.02em]">
          All the ways you{" "}
          <span className="italic text-white/75">work</span>,
          <br />
          in one place.
        </h2>
        <div className="mt-14 grid grid-cols-12 gap-6">
          <div className="col-span-7 aspect-[16/10] rounded-xl border border-white/10 bg-white/[0.04]" />
          <div className="col-span-5 grid grid-rows-2 gap-6">
            <div className="rounded-xl border border-white/10 bg-white/[0.04] p-6">
              <h3 className="text-sm font-semibold">Apps</h3>
              <p className="mt-2 text-sm text-white/55">
                Full-stack internal apps with a visual editor and code escape hatches.
              </p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.04] p-6">
              <h3 className="text-sm font-semibold">Workflows</h3>
              <p className="mt-2 text-sm text-white/55">
                Schedule-, event-, and webhook-driven automations across your stack.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
