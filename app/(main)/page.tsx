import { CtaSection } from "@/features/public/home/components/CtaSection";
import { ProductStackSection } from "@/features/public/home/components/ProductStackSection";
import { LandingIntro } from "@/features/public/home/components/LandingIntro";
import { PerceptualHashingSection } from "@/features/public/home/components/PerceptualHashingSection";
import { TeamSection } from "@/features/public/home/components/TeamSection";
import { FaqSection } from "@/features/public/home/components/FaqSection";
import { isAuthenticated } from "@/lib/server-utils";

export default async function Home() {
  const signedIn = await isAuthenticated();

  return (
    <main className="h-full w-full">
      <LandingIntro />

      <PerceptualHashingSection />

      <ProductStackSection />

      <TeamSection />

      <FaqSection />

      <CtaSection signedIn={signedIn} />
    </main>
  );
}
