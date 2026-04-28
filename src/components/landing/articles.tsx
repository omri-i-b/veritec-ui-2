const articles = [
  {
    tag: "Engineering",
    title: "How we cut build times in half with incremental compilation",
    excerpt: "A look inside the rewrite that took our editor from 12 to 5 seconds.",
  },
  {
    tag: "Customer Story",
    title: "Globex shipped 47 internal apps in their first quarter on Acme",
    excerpt: "How a 200-person ops team replaced spreadsheets and ticketing one workflow at a time.",
  },
  {
    tag: "Product",
    title: "Introducing AI agents you can actually deploy",
    excerpt: "Long-running agents with tool access, audit trails, and human-in-the-loop checkpoints.",
  },
];

export function Articles() {
  return (
    <section className="border-b border-white/10">
      <div className="mx-auto max-w-[1360px] border-x border-white/10 px-10 py-24">
        <p className="mb-5 font-mono text-[11px] tracking-[0.3em] text-white/40 uppercase">
          05 &nbsp;/&nbsp; Dispatches
        </p>
        <div className="flex items-end justify-between">
          <h2 className="font-display text-[52px] leading-[1.05] tracking-[-0.02em]">
            Get the latest from{" "}
            <span className="italic text-white/75">Acme</span>.
          </h2>
          <a
            href="#"
            className="text-sm text-white/60 transition-colors hover:text-white"
          >
            See all posts &rarr;
          </a>
        </div>
        <div className="mt-12 grid grid-cols-3 gap-6">
          {articles.map((article) => (
            <article
              key={article.title}
              className="overflow-hidden rounded-xl border border-white/10 bg-white/[0.03] transition-colors hover:bg-white/[0.06]"
            >
              <div className="aspect-[16/9] bg-gradient-to-br from-white/10 via-white/[0.02] to-white/10" />
              <div className="p-6">
                <span className="font-mono text-[11px] tracking-[0.2em] text-white/55 uppercase">
                  {article.tag}
                </span>
                <h3 className="mt-3 text-base leading-snug font-semibold">
                  {article.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-white/55">
                  {article.excerpt}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
