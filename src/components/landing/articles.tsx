import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";

const articles = [
  {
    date: "04.21.2026",
    tag: "Engineering",
    title:
      "How we cut build times in half with incremental compilation",
    image:
      "https://images.unsplash.com/photo-1581090700227-1e37b190418e?w=1200&q=80",
  },
  {
    date: "04.14.2026",
    tag: "Customer Story",
    title:
      "Meridian shipped 47 internal apps in their first quarter on Airogistic",
    image:
      "https://images.unsplash.com/photo-1508614589041-895b88991e3e?w=1200&q=80",
  },
  {
    date: "04.02.2026",
    tag: "Product",
    title: "Introducing AI agents you can actually deploy",
    image:
      "https://images.unsplash.com/photo-1518365050014-70fe7232897f?w=1200&q=80",
  },
];

export function Articles() {
  return (
    <section className="border-b border-white/10 bg-[#0a0a0a]">
      <div className="mx-auto max-w-[1680px] px-12 py-20">
        <div className="flex items-end justify-between">
          <div>
            <p className="font-mono text-[11px] tracking-[0.3em] text-white/40 uppercase">
              05 &nbsp;/&nbsp; News &amp; Insights
            </p>
            <h2 className="mt-4 font-display text-[44px] leading-[0.95] font-bold tracking-[-0.02em] uppercase">
              Dispatches from the field.
            </h2>
          </div>
          <a
            href="#"
            className="font-mono text-[11px] tracking-[0.25em] text-white/60 uppercase transition-colors hover:text-white"
          >
            All Articles &nbsp;&rarr;
          </a>
        </div>
        <div className="mt-12 grid grid-cols-3 gap-3">
          {articles.map((article) => (
            <a
              key={article.title}
              href="#"
              className="group relative overflow-hidden border border-white/10 bg-black"
            >
              <div className="aspect-[16/10] overflow-hidden">
                <div
                  className="h-full w-full bg-cover bg-center transition-transform duration-500 group-hover:scale-[1.03]"
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
                <div className="mt-6 flex items-center gap-1.5 font-mono text-[10px] tracking-[0.25em] text-white/60 uppercase">
                  Read More
                  <ArrowUpRight className="h-3 w-3" weight="bold" />
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
