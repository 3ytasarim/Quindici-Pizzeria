import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

export default function HeroSection() {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-background">
      <div
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-30 mix-blend-multiply"
        style={{ backgroundImage: "url(/hero-bg.jpg)" }}
      />
      <div
        className="absolute inset-0 z-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle at center, hsl(var(--primary)) 0%, transparent 70%)",
          transform: "translateY(-20%)",
        }}
      />

      <div className="container relative z-10 px-4 py-20 mx-auto text-center flex flex-col items-center">
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.85, ease: "easeOut" }}
          className="text-5xl md:text-7xl lg:text-8xl font-serif text-foreground leading-tight"
        >
          Willkommen bei Quindici
        </motion.h1>

        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.85, delay: 0.15, ease: "easeOut" }}
          className="text-primary font-serif italic text-2xl md:text-3xl mt-3 mb-8"
        >
          Trattoria Pizzeria
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.85, delay: 0.28, ease: "easeOut" }}
          className="text-lg md:text-xl text-foreground/70 max-w-2xl mx-auto mb-10"
        >
          Italienische Auszeit mit frischen, regionalen Zutaten mitten in Ludwigsburg
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.85, delay: 0.4, ease: "easeOut" }}
          className="flex flex-col sm:flex-row items-center gap-4 mb-10"
        >
          <Button
            size="lg"
            className="w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90 text-sm tracking-widest uppercase font-semibold h-14 px-8 rounded-none"
            data-testid="button-hero-tisch-reservieren"
          >
            Tisch reservieren
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="w-full sm:w-auto border-foreground/30 text-foreground hover:bg-foreground hover:text-background text-sm tracking-widest uppercase font-semibold h-14 px-8 rounded-none transition-all"
            data-testid="button-hero-mittagstisch-ansehen"
          >
            Mittagstisch ansehen
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.55, ease: "easeOut" }}
        >
          <button
            className="inline-flex items-center gap-2 px-6 py-2 rounded-full border border-primary/40 bg-background/60 backdrop-blur-sm text-sm font-medium text-primary hover:bg-primary/5 transition-colors"
            data-testid="button-mittagstisch-der-woche"
          >
            Mittagstisch der Woche
          </button>
        </motion.div>
      </div>
    </section>
  );
}
