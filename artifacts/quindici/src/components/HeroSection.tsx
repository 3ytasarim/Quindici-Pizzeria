import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Clock } from "lucide-react";

export default function HeroSection() {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-background">
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-30 mix-blend-multiply" 
        style={{ backgroundImage: 'url(/hero-bg.jpg)' }} 
      />
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at center, hsl(var(--primary)) 0%, transparent 70%)', transform: 'translateY(-20%)' }} />
      
      <div className="container relative z-10 px-4 py-20 mx-auto text-center flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-background/50 backdrop-blur-sm text-sm font-medium text-primary mb-8"
        >
          <Clock className="w-4 h-4" />
          <span>Mittagstisch der Woche</span>
        </motion.div>

        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
          className="text-primary font-serif italic text-2xl md:text-3xl mb-4"
        >
          Trattoria Pizzeria
        </motion.h2>

        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className="text-5xl md:text-7xl lg:text-8xl font-serif text-foreground mb-8 max-w-4xl mx-auto leading-tight"
        >
          Willkommen bei Quindici
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
          className="text-lg md:text-xl text-foreground/70 max-w-2xl mx-auto mb-12"
        >
          Italienische Auszeit mit frischen, regionalen Zutaten mitten in Ludwigsburg
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
          className="flex flex-col sm:flex-row items-center gap-6"
        >
          <Button size="lg" className="w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90 text-sm tracking-widest uppercase font-semibold h-14 px-8 rounded-none">
            Tisch reservieren
          </Button>
          <Button size="lg" variant="outline" className="w-full sm:w-auto border-foreground/20 text-foreground hover:bg-foreground hover:text-background text-sm tracking-widest uppercase font-semibold h-14 px-8 rounded-none transition-all">
            Mittagstisch ansehen
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
