import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, UtensilsCrossed } from "lucide-react";

export default function HeroSection() {
  const [hovered, setHovered] = useState(false);

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

        <motion.div
          initial={{ opacity: 0, scaleX: 0.6, y: 8 }}
          animate={{ opacity: 1, scaleX: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.18, ease: [0.4, 0, 0.2, 1] }}
          className="flex items-center gap-4 mt-4 mb-8"
        >
          <motion.span
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.7, delay: 0.55, ease: "easeOut" }}
            className="block h-px w-16 bg-primary/60 origin-left"
          />
          <h2 className="font-serif italic text-3xl md:text-4xl text-primary drop-shadow-sm tracking-wide">
            Trattoria Pizzeria
          </h2>
          <motion.span
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.7, delay: 0.55, ease: "easeOut" }}
            className="block h-px w-16 bg-primary/60 origin-right"
          />
        </motion.div>

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
          {/* Primary button — unchanged */}
          <Button
            size="lg"
            className="w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90 text-sm tracking-widest uppercase font-semibold h-14 px-8 rounded-none"
            data-testid="button-hero-tisch-reservieren"
          >
            Tisch reservieren
          </Button>

          {/* Secondary button — animated */}
          <motion.button
            data-testid="button-hero-mittagstisch-ansehen"
            onHoverStart={() => setHovered(true)}
            onHoverEnd={() => setHovered(false)}
            whileTap={{ scale: 0.97 }}
            className="relative w-full sm:w-auto h-14 px-8 overflow-hidden border border-foreground/30 text-foreground text-sm tracking-widest uppercase font-semibold rounded-none flex items-center justify-center gap-3 group"
          >
            {/* sliding fill background */}
            <motion.span
              className="absolute inset-0 bg-foreground origin-left"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: hovered ? 1 : 0 }}
              transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
            />

            {/* icon */}
            <motion.span
              className="relative z-10"
              animate={{ color: hovered ? "hsl(var(--background))" : "currentColor" }}
              transition={{ duration: 0.2 }}
            >
              <UtensilsCrossed className="w-4 h-4" />
            </motion.span>

            {/* text */}
            <motion.span
              className="relative z-10"
              animate={{ color: hovered ? "hsl(var(--background))" : "currentColor" }}
              transition={{ duration: 0.2 }}
            >
              Mittagstisch ansehen
            </motion.span>

            {/* arrow that slides in */}
            <AnimatePresence>
              {hovered && (
                <motion.span
                  className="relative z-10"
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -8 }}
                  transition={{ duration: 0.2 }}
                  style={{ color: "hsl(var(--background))" }}
                >
                  <ArrowRight className="w-4 h-4" />
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
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
