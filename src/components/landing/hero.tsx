import { ArrowRight } from "@phosphor-icons/react/dist/ssr";

export function Hero() {
  return (
    <section className="border-b border-white/10">
      <div className="mx-auto max-w-[1360px] border-x border-white/10 px-10 py-28 text-center">
        <p className="mb-8 font-mono text-[11px] tracking-[0.3em] text-white/40 uppercase">
          // The Acme Platform &nbsp;·&nbsp; v4.0
        </p>
        <h1 className="mx-auto max-w-4xl font-display text-[88px] leading-[0.95] tracking-[-0.03em]">
          Build how you{" "}
          <span className="italic text-white/80">want</span>.
          <br />
          Ship on a platform
          <br />
          you can{" "}
          <span className="italic text-white/80">trust</span>.
        </h1>
        <p className="mx-auto mt-8 max-w-xl text-base text-white/60">
          The fastest way to build internal tools, automations, and AI agents
          on top of your data — with the guardrails enterprises require.
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <a
            href="#contact"
            className="inline-flex items-center gap-1.5 rounded-md bg-white px-4 py-2 text-sm font-medium text-black transition-colors hover:bg-white/90"
          >
            Get started
            <ArrowRight className="h-3.5 w-3.5" weight="bold" />
          </a>
          <a
            href="#"
            className="inline-flex items-center gap-1.5 rounded-md border border-white/20 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white/5"
          >
            Watch demo
          </a>
        </div>
      </div>
    </section>
  );
}
