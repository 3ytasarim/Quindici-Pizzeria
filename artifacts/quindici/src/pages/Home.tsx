import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import BenvenutilSection from "@/components/BenvenutilSection";
import InfoSection from "@/components/InfoSection";
import MittagstischBanner from "@/components/MittagstischBanner";
import LieblingsgerichteSection from "@/components/LieblingsgerichteSection";
import LunchMenuSection from "@/components/LunchMenuSection";
import Footer from "@/components/Footer";
import StickyActions from "@/components/StickyActions";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        <HeroSection />
        <BenvenutilSection />
        <InfoSection />
        <MittagstischBanner />
        <LieblingsgerichteSection />
        <LunchMenuSection />
      </main>
      <Footer />
      <StickyActions />
    </div>
  );
}
