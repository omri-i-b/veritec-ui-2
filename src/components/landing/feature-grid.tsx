import {
  Code,
  Database,
  GitBranch,
  Lock,
  Plugs,
  Stack,
  UsersThree,
  Wrench,
  ChartLine,
} from "@phosphor-icons/react/dist/ssr";

const features = [
  {
    icon: Code,
    title: "Code when you need it",
    body: "JavaScript, Python, and SQL anywhere — no proprietary languages to learn.",
  },
  {
    icon: Plugs,
    title: "Connect to anything",
    body: "100+ native integrations and a generic REST/GraphQL block for the rest.",
  },
  {
    icon: Database,
    title: "Bring your own data",
    body: "Postgres, Snowflake, MongoDB, S3 — query in place, no copying required.",
  },
  {
    icon: GitBranch,
    title: "Source control built in",
    body: "Branch, review, and roll back changes the way your engineers already work.",
  },
  {
    icon: UsersThree,
    title: "Roles & permissions",
    body: "Per-app, per-resource, per-row. The defaults work; the overrides are easy.",
  },
  {
    icon: Lock,
    title: "Self-hosted option",
    body: "Run on your VPC. Your data, your network, your compliance posture.",
  },
  {
    icon: Stack,
    title: "Composable blocks",
    body: "Tables, forms, charts, and an embedded code editor — all in one canvas.",
  },
  {
    icon: Wrench,
    title: "Built for operators",
    body: "Ops, support, and finance ship their own tools without filing tickets.",
  },
  {
    icon: ChartLine,
    title: "Observability included",
    body: "Logs, traces, and usage analytics on every app you ship.",
  },
];

export function FeatureGrid() {
  return (
    <section className="border-b border-white/10">
      <div className="mx-auto max-w-[1360px] border-x border-white/10 px-10 py-24">
        <p className="mb-5 font-mono text-[11px] tracking-[0.3em] text-white/40 uppercase">
          02 &nbsp;/&nbsp; The Toolbox
        </p>
        <h2 className="max-w-2xl font-display text-[52px] leading-[1.05] tracking-[-0.02em]">
          Build and run{" "}
          <span className="italic text-white/75">modern</span> internal
          software.
        </h2>
        <div className="mt-14 grid grid-cols-3 gap-x-12 gap-y-10">
          {features.map((feat) => {
            const Icon = feat.icon;
            return (
              <div key={feat.title}>
                <Icon className="h-5 w-5 text-white/80" weight="regular" />
                <h3 className="mt-4 text-sm font-semibold">{feat.title}</h3>
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
