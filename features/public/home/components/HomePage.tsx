"use client";

import { useAuth } from "@/features/user/auth/hooks/useAuth";
import { useSiteSettings } from "@/features/admin/settings/lib/use-site-settings";
import { CtaSection } from "@/features/public/home/components/CtaSection";
import { DisclaimerSection } from "@/features/public/home/components/DisclaimerSection";
import { FaqSection } from "@/features/public/home/components/FaqSection";
import { FeaturesSection } from "@/features/public/home/components/FeaturesSection";
import { FloatingUploadButton } from "@/features/public/home/components/FloatingUploadButton";
import { HeroSection } from "@/features/public/home/components/HeroSection";
import { HowItWorksSection } from "@/features/public/home/components/HowItWorksSection";
import { ProofOfAuthorshipSection } from "@/features/public/home/components/ProofOfAuthorshipSection";
import { TeamSection } from "@/features/public/home/components/TeamSection";
import { WhyChooseSection } from "@/features/public/home/components/WhyChooseSection";

export function HomePage() {
  const { isAuthenticated } = useAuth();
  const { settings } = useSiteSettings();

  return (
    <main className="bg-background-light dark:bg-background-dark font-display min-h-screen overflow-x-hidden text-slate-900 dark:text-slate-100">
      <HeroSection isAuthenticated={isAuthenticated} />
      <HowItWorksSection />
      <FeaturesSection />
      <ProofOfAuthorshipSection platformName={settings.platform_name} />
      <WhyChooseSection platformName={settings.platform_name} />
      <TeamSection />
      <FaqSection platformName={settings.platform_name} />
      <DisclaimerSection />
      <CtaSection isAuthenticated={isAuthenticated} />
      <FloatingUploadButton />
    </main>
  );
}
