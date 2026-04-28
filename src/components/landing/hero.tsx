import Image from "next/image";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";

export function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-white/10">
      <div
        className="absolute inset-0 opacity-[0.14]"
        style={{
          backgroundImage:
            "url(https://images.unsplash.com/photo-1454789548928-9efd52dc4031?w=2400&q=80)",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/60 to-black" />
      <div className="relative mx-auto max-w-[1680px] px-12 pt-20 pb-14">
        <div className="mb-8 flex items-center gap-3 font-mono text-[11px] tracking-[0.3em] text-white/55 uppercase">
          <Image
            src="/airogistic-mark.png"
            alt=""
            width={20}
            height={20}
            className="h-5 w-5 opacity-90"
          />
          <span>Fleet</span>
          <span className="text-white/25">·</span>
          <span>Parameters</span>
          <span className="text-white/25">·</span>
          <span>Tests</span>
          <span className="text-white/25">·</span>
          <span>Missions</span>
        </div>

        <h1 className="max-w-4xl font-display text-[72px] leading-[0.95] font-bold tracking-[-0.02em] uppercase">
          Never lose a vehicle to a{" "}
          <span className="text-[#A6B0D8]">bad parameter</span> again.
        </h1>

        <p className="mt-6 max-w-xl text-base text-white/65">
          Fleet, parameter, and test management for teams flying unmanned
          vehicles — in the field or in simulation.
        </p>

        <div className="mt-8 flex items-center gap-3">
          <a
            href="#contact"
            className="inline-flex items-center gap-1.5 bg-white px-4 py-2.5 font-mono text-[11px] tracking-[0.25em] text-black uppercase transition-colors hover:bg-white/90"
          >
            Book a demo
            <ArrowRight className="h-3 w-3" weight="bold" />
          </a>
          <a
            href="#contact"
            className="inline-flex items-center gap-1.5 border border-white/25 px-4 py-2.5 font-mono text-[11px] tracking-[0.25em] text-white uppercase transition-colors hover:bg-white/5"
          >
            Start with parameters
          </a>
        </div>
      </div>
    </section>
  );
}
