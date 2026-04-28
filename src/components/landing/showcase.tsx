import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";

const tiles = [
  {
    name: "Sentinel",
    tag: "Autonomous Inspection",
    image:
      "https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=1600&q=80",
    span: "col-span-4 row-span-2 aspect-square",
  },
  {
    name: "Fury",
    tag: "Aerial Operations",
    image:
      "https://images.unsplash.com/photo-1517976487492-5750f3195933?w=1600&q=80",
    span: "col-span-4 aspect-[4/3]",
  },
  {
    name: "Lattice",
    tag: "Mission Software",
    image:
      "https://images.unsplash.com/photo-1454789548928-9efd52dc4031?w=1600&q=80",
    span: "col-span-4 aspect-[4/3]",
  },
  {
    name: "Roadrunner",
    tag: "Ground Vehicles",
    image:
      "https://images.unsplash.com/photo-1519074069444-1ba4fff66d16?w=1600&q=80",
    span: "col-span-4 aspect-[4/3]",
  },
  {
    name: "Monaco",
    tag: "Field Operations",
    image:
      "https://images.unsplash.com/photo-1457364887197-9150188c107b?w=1600&q=80",
    span: "col-span-4 aspect-[4/3]",
  },
];

export function Showcase() {
  return (
    <section className="border-b border-white/10 bg-black">
      <div className="mx-auto max-w-[1680px] px-12 py-20">
        <div className="mb-10 flex items-end justify-between">
          <div>
            <p className="font-mono text-[11px] tracking-[0.3em] text-white/40 uppercase">
              03 &nbsp;/&nbsp; The Arsenal
            </p>
            <h2 className="mt-4 font-display text-[64px] leading-[0.95] font-bold tracking-[-0.02em] uppercase">
              All the ways
              <br />
              you build.
            </h2>
          </div>
          <a
            href="#"
            className="font-mono text-[11px] tracking-[0.25em] text-white/60 uppercase transition-colors hover:text-white"
          >
            Explore Products &nbsp;&rarr;
          </a>
        </div>

        <div className="grid grid-cols-12 gap-3">
          {tiles.map((tile) => (
            <a
              key={tile.name}
              href="#"
              className={`group relative overflow-hidden ${tile.span}`}
            >
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-[1.03]"
                style={{ backgroundImage: `url(${tile.image})` }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-black/30" />
              <div className="absolute inset-0 flex items-end justify-between p-6">
                <div>
                  <p className="font-mono text-[10px] tracking-[0.25em] text-white/70 uppercase">
                    {tile.tag}
                  </p>
                  <h3 className="mt-1 font-display text-3xl font-bold tracking-tight uppercase">
                    {tile.name}
                  </h3>
                </div>
              </div>
              <ArrowUpRight
                className="absolute top-5 right-5 h-5 w-5 text-white/80 transition-colors group-hover:text-white"
                weight="bold"
              />
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
