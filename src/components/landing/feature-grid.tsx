import {
  AirplaneTilt,
  GitBranch,
  CheckSquare,
  Broadcast,
  Cube,
  ListChecks,
} from "@phosphor-icons/react/dist/ssr";

const features = [
  {
    icon: AirplaneTilt,
    title: "Fleet registry",
    body: "Vehicles, ground stations, types — tracked in one place.",
  },
  {
    icon: GitBranch,
    title: "Parameter version control",
    body: "Every flight pinned to a known-good config. No surprise changes.",
  },
  {
    icon: CheckSquare,
    title: "Pre-flight test suites",
    body: "Block takeoff until every check passes. All scriptable.",
  },
  {
    icon: Broadcast,
    title: "In-flight assertions",
    body: "Telemetry checks that fire mid-mission and abort on anomaly.",
  },
  {
    icon: Cube,
    title: "Sim + hardware",
    body: "Same test definitions run in your simulator and on real fleets.",
  },
  {
    icon: ListChecks,
    title: "Mission workflows",
    body: "Sequence steps and tests. The base layer for AI-driven missions.",
  },
];

export function FeatureGrid() {
  return (
    <section className="border-b border-white/10">
      <div className="mx-auto max-w-[1680px] px-12 py-20">
        <p className="mb-4 font-mono text-[11px] tracking-[0.3em] text-white/40 uppercase">
          02 &nbsp;/&nbsp; The Platform
        </p>
        <h2 className="max-w-3xl font-display text-[44px] leading-[0.95] font-bold tracking-[-0.02em] uppercase">
          Fleet, parameters, tests, missions — one system.
        </h2>
        <div className="mt-12 grid grid-cols-3 gap-x-12 gap-y-10 border-t border-white/10 pt-10">
          {features.map((feat) => {
            const Icon = feat.icon;
            return (
              <div key={feat.title}>
                <Icon className="h-5 w-5 text-white/85" weight="regular" />
                <h3 className="mt-4 font-display text-lg font-bold tracking-tight uppercase">
                  {feat.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-white/55">
                  {feat.body}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
