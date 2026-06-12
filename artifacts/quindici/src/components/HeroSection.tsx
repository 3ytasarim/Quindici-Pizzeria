import { motion } from "framer-motion";
import { UtensilsCrossed } from "lucide-react";

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
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.45, ease: "easeOut" }}
        >
          <motion.button
            whileHover={{ scale: 1.04, boxShadow: "0 0 24px rgba(180,130,50,0.25)" }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="inline-flex items-center gap-2.5 px-7 py-3 rounded-full border border-amber-600/50 bg-white/70 backdrop-blur-sm text-sm font-semibold text-amber-800 shadow-sm hover:bg-amber-50/80 transition-colors"
            data-testid="button-mittagstisch-der-woche"
          >
            {/* Pulsing dot */}
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-500 opacity-60" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-600" />
            </span>
            <UtensilsCrossed className="w-3.5 h-3.5 text-amber-600" />
            Mittagstisch der Woche
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
}
