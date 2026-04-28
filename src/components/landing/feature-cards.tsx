import {
  Lightning,
  ShieldCheck,
  Sparkle,
} from "@phosphor-icons/react/dist/ssr";

const cards = [
  {
    icon: Lightning,
    title: "Ship in days",
    body: "Pre-built blocks, hosted infra, and a visual editor mean your first internal app is live the same week you start.",
  },
  {
    icon: ShieldCheck,
    title: "Secure by default",
    body: "Granular access controls, audit logs, and SSO out of the box. Your data never leaves your perimeter unless you say so.",
  },
  {
    icon: Sparkle,
    title: "AI that fits in",
    body: "Drop agents into existing workflows. They read the same data, follow the same rules, and answer to the same humans.",
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
              <Icon className="h-7 w-7 text-white" weight="regular" />
              <h3 className="mt-8 font-display text-2xl font-bold tracking-tight uppercase">
                {card.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-white/60">
                {card.body}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
