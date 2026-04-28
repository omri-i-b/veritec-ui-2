import { SiteNav } from "@/components/landing/site-nav";
import { Hero } from "@/components/landing/hero";
import { LogoStrip } from "@/components/landing/logo-strip";
import { FeatureIntro } from "@/components/landing/feature-intro";
import { FeatureCards } from "@/components/landing/feature-cards";
import { FeatureGrid } from "@/components/landing/feature-grid";
import { Showcase } from "@/components/landing/showcase";
import { SocialProof } from "@/components/landing/social-proof";
import { Articles } from "@/components/landing/articles";
import { ContactForm } from "@/components/landing/contact-form";
import { SiteFooter } from "@/components/landing/site-footer";

export default function LandingPage() {
  return (
    <>
      <SiteNav />
      <Hero />
      <LogoStrip />
      <FeatureIntro />
      <FeatureCards />
      <FeatureGrid />
      <Showcase />
      <SocialProof />
      <Articles />
      <ContactForm />
      <SiteFooter />
    </>
  );
}
