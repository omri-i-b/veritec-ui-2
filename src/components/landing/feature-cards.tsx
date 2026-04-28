import {
  GitBranch,
  CheckCircle,
  ArrowsClockwise,
} from "@phosphor-icons/react/dist/ssr";

const cards = [
  {
    icon: GitBranch,
    title: "Version every parameter",
    body: "Diff, review, and roll back configs the way your engineers ship code.",
  },
  {
    icon: CheckCircle,
    title: "Automate every test",
    body: "Pre-flight, in-flight, post-flight. Scriptable, repeatable, history-backed.",
  },
  {
    icon: ArrowsClockwise,
    title: "Field-first, cloud-synced",
    body: "Run locally without internet. Reconcile back to cloud when you're online.",
  },
];

export function FeatureCards() {
  return (
    <section className="border-b border-white/10 bg-black">
      <div className="mx-auto grid max-w-[1680px] grid-cols-3">
        {cards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div
              key={card.title}
              className={`p-10 ${i < cards.length - 1 ? "border-r border-white/10" : ""}`}
            >
              <Icon className="h-6 w-6 text-white" weight="regular" />
              <h3 className="mt-6 font-display text-xl font-bold tracking-tight uppercase">
                {card.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-white/60">
                {card.body}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
