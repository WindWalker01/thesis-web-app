import { ProductStackSection } from "@/features/public/home/components/ProductStackSection";
import { LandingIntro } from "@/features/public/home/components/LandingIntro";
import { PerceptualHashingSection } from "@/features/public/home/components/PerceptualHashingSection";
import { TeamSection } from "@/features/public/home/components/TeamSection";

export default function Home() {
  return (
    <main className="h-full w-full">
      <LandingIntro />

      <PerceptualHashingSection />

      <ProductStackSection />

      <TeamSection />
    </main>
  );
}
