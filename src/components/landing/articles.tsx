const articles = [
  {
    date: "04.21.2026",
    tag: "Engineering",
    title:
      "Why your parameter file is the highest-risk artifact in your test program",
    image:
      "https://images.unsplash.com/photo-1581090700227-1e37b190418e?w=1200&q=80",
  },
  {
    date: "04.14.2026",
    tag: "Customer Story",
    title:
      "How Meridian moved 200 weekly flights from manual checklists to automated suites",
    image:
      "https://images.unsplash.com/photo-1508614589041-895b88991e3e?w=1200&q=80",
  },
  {
    date: "04.02.2026",
    tag: "Product",
    title:
      "Same tests in sim and on hardware: what we learned shipping a unified runner",
    image:
      "https://images.unsplash.com/photo-1518365050014-70fe7232897f?w=1200&q=80",
  },
];

export function Articles() {
  return (
    <section className="border-b border-white/10 bg-[#0a0a0a]">
      <div className="mx-auto max-w-[1680px] px-12 py-20">
        <p className="font-mono text-[11px] tracking-[0.3em] text-white/40 uppercase">
          05 &nbsp;/&nbsp; Field Notes
        </p>
        <h2 className="mt-4 font-display text-[44px] leading-[0.95] font-bold tracking-[-0.02em] uppercase">
          From the test range.
        </h2>

        <div className="mt-12 grid grid-cols-3 gap-3">
          {articles.map((article) => (
            <article
              key={article.title}
              className="overflow-hidden border border-white/10 bg-black"
            >
              <div className="aspect-[16/10] overflow-hidden">
                <div
                  className="h-full w-full bg-cover bg-center"
                  style={{ backgroundImage: `url(${article.image})` }}
                />
              </div>
              <div className="p-6">
                <div className="flex items-center justify-between font-mono text-[10px] tracking-[0.25em] text-white/50 uppercase">
                  <span>{article.date}</span>
                  <span>{article.tag}</span>
                </div>
                <h3 className="mt-4 font-display text-xl leading-tight font-bold tracking-tight uppercase">
                  {article.title}
                </h3>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
