import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import FeaturesSection from "@/components/FeaturesSection";
import LunchMenuSection from "@/components/LunchMenuSection";
import MenuPreviewSection from "@/components/MenuPreviewSection";
import AboutSection from "@/components/AboutSection";
import Footer from "@/components/Footer";
export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        <HeroSection />
        <FeaturesSection />
        <LunchMenuSection />
        <MenuPreviewSection />
        <AboutSection />
      </main>
      <Footer />
    </div>
  );
}
