import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { ArrowRight, CalendarCheck } from "lucide-react";

export default function MittagstischBanner() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <section
      ref={ref}
      className="relative overflow-hidden"
      style={{ minHeight: 340 }}
    >
      {/* Fixed background image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-fixed"
        style={{ backgroundImage: "url('/mittagstisch-bg.jpg')" }}
      />
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-stone-900/68" />

      {/* Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 py-20 flex flex-col md:flex-row items-center md:items-start gap-10 md:gap-16">

        {/* Left — text */}
        <div className="flex-1">
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-sm font-semibold tracking-[0.25em] uppercase text-amber-400 mb-3"
          >
            Jeden Tag frisch
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="font-serif text-3xl md:text-4xl text-white mb-5 leading-snug"
          >
            Unser Mittagstisch<br />der Woche!
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.35 }}
            className="text-stone-300 text-base leading-relaxed max-w-lg"
          >
            Entdecken Sie unseren aktuellen Mittagstisch – frisch zubereitet,
            abwechslungsreich und ideal für Ihre Mittagspause in Ludwigsburg!
          </motion.p>
        </div>

        {/* Right — buttons */}
        <motion.div
          initial={{ opacity: 0, x: 24 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.45 }}
          className="flex flex-col gap-3 shrink-0 w-full md:w-auto md:self-center"
        >
          <a
            href="#"
            className="inline-flex items-center justify-center gap-2 bg-amber-700 hover:bg-amber-600 text-white text-sm font-semibold px-7 py-3.5 transition-colors duration-200"
          >
            <ArrowRight className="w-4 h-4" />
            Jetzt ansehen
          </a>
          <a
            href="#"
            className="inline-flex items-center justify-center gap-2 border border-white/50 hover:border-white text-white text-sm font-medium px-7 py-3.5 transition-colors duration-200 hover:bg-white/10"
          >
            <CalendarCheck className="w-4 h-4" />
            Jetzt reservieren
          </a>
        </motion.div>

      </div>
    </section>
  );
}
