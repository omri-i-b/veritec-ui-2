const tiles = [
  {
    name: "Fleet",
    tag: "Vehicles, stations, types",
    image:
      "https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=1600&q=80",
    span: "col-span-4 row-span-2 aspect-square",
  },
  {
    name: "Parameters",
    tag: "Version control for configs",
    image:
      "https://images.unsplash.com/photo-1517976487492-5750f3195933?w=1600&q=80",
    span: "col-span-4 aspect-[4/3]",
  },
  {
    name: "Tests",
    tag: "Scriptable, automated",
    image:
      "https://images.unsplash.com/photo-1454789548928-9efd52dc4031?w=1600&q=80",
    span: "col-span-4 aspect-[4/3]",
  },
  {
    name: "Missions",
    tag: "Workflows of steps + tests",
    image:
      "https://images.unsplash.com/photo-1519074069444-1ba4fff66d16?w=1600&q=80",
    span: "col-span-4 aspect-[4/3]",
  },
  {
    name: "Field",
    tag: "Local-first, syncs later",
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
              03 &nbsp;/&nbsp; The Stack
            </p>
            <h2 className="mt-4 font-display text-[44px] leading-[0.95] font-bold tracking-[-0.02em] uppercase">
              Every layer of your operation.
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-3">
          {tiles.map((tile) => (
            <div
              key={tile.name}
              className={`relative overflow-hidden ${tile.span}`}
            >
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${tile.image})` }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-black/30" />
              <div className="absolute inset-0 flex items-end p-6">
                <div>
                  <p className="font-mono text-[10px] tracking-[0.25em] text-white/70 uppercase">
                    {tile.tag}
                  </p>
                  <h3 className="mt-1 font-display text-3xl font-bold tracking-tight uppercase">
                    {tile.name}
                  </h3>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
