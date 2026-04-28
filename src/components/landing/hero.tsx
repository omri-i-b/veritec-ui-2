import Image from "next/image";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";

export function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-white/10">
      <div
        className="absolute inset-0 opacity-[0.18]"
        style={{
          backgroundImage:
            "url(https://images.unsplash.com/photo-1454789548928-9efd52dc4031?w=2400&q=80)",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/60 to-black" />
      <div className="relative mx-auto max-w-[1680px] px-12 pt-28 pb-16">
        <h1 className="font-display text-[112px] leading-[0.92] font-bold tracking-[-0.02em] uppercase">
          <span className="mr-3 align-top text-[60px] tracking-normal opacity-80">
            ©
          </span>
          Airogistic Industries
          <br />
          Building the operating
          <br />
          system for{" "}
          <span className="text-[#A6B0D8]">enterprise AI</span>.
        </h1>

        <div className="mt-12 flex items-center gap-6 font-mono text-[12px] tracking-[0.25em] text-white/70 uppercase">
          <span>Autonomy</span>
          <span className="text-white/30">FOR</span>
          <span>Every Operator</span>
          <Image
            src="/airogistic-mark.png"
            alt=""
            width={28}
            height={28}
            className="h-7 w-7 opacity-90"
          />
          <span>Est. 2024</span>
          <ArrowRight className="h-3 w-3" weight="bold" />
          <span>The Future</span>
        </div>
      </div>
    </section>
  );
}
