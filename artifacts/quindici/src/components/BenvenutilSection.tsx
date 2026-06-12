import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

const pizzas = [
  { src: "/pizza-1.png", label: "Margherita" },
  { src: "/pizza-2.png", label: "Diavola" },
  { src: "/pizza-3.png", label: "Quattro Formaggi" },
  { src: "/pizza-4.png", label: "Prosciutto e Rucola" },
];

export default function BenvenutilSection() {
  const [active, setActive] = useState(0);
  const [dir, setDir] = useState(1);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  useEffect(() => {
    const t = setInterval(() => {
      setDir(1);
      setActive((p) => (p + 1) % pizzas.length);
    }, 3200);
    return () => clearInterval(t);
  }, []);

  const go = (d: number) => {
    setDir(d);
    setActive((p) => (p + pizzas.length + d) % pizzas.length);
  };

  return (
    <section ref={ref} className="relative overflow-hidden bg-[#fdf8f2] py-24 px-6">
      {/* Top block: heading + two-col layout */}
      <div className="max-w-6xl mx-auto">
        {/* Heading */}
        <div className="relative mb-12">
          {/* Watermark "Benvenuti" */}
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 1, ease: "easeOut" }}
            className="absolute bottom-0 left-0 select-none pointer-events-none leading-none"
            style={{
              fontFamily: "'Dancing Script', cursive",
              fontSize: "clamp(60px, 10vw, 110px)",
              fontWeight: 400,
              color: "#C5A485",
              opacity: 0.14,
              letterSpacing: "0.02em",
            }}
          >
            Benvenuti
          </motion.span>

          {/* Subtitle */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.25, ease: "easeOut" }}
            className="relative z-10 pt-10"
          >
            <h2 className="font-serif text-3xl md:text-4xl text-stone-800 leading-snug">
              In der Trattoria Pizzeria in Ludwigsburg
            </h2>
          </motion.div>
        </div>

        {/* Two-column: text left, image right */}
        <div className="grid md:grid-cols-2 gap-10 items-start mb-20">
          {/* Left — text */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
            className="space-y-4 text-stone-600 text-base leading-relaxed"
          >
            <p>
              Bei Quindici Trattoria Pizzeria erwartet Sie italienische Küche mit Herz. Von
              knuspriger Pizza über hausgemachte Pasta, frische Salate, Antipasti,
              Fleischgerichte, Fischgerichte bis hin zu ausgewählten Spezialitäten bereiten
              wir unsere Gerichte mit viel Leidenschaft, frischen Zutaten und Liebe zum
              Detail zu.
            </p>
            <p>
              Ob gemütliches Abendessen, Mittagspause, Familienessen, Treffen mit Freunden
              oder ein besonderer Anlass – bei Quindici sollen Sie sich vom ersten Moment
              an willkommen fühlen.
            </p>
          </motion.div>

          {/* Right — image */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.9, delay: 0.5, ease: "easeOut" }}
            className="relative aspect-[4/3] overflow-hidden shadow-xl"
          >
            <img
              src="/about-restaurant.png"
              alt="Quindici Trattoria Innenraum"
              className="w-full h-full object-cover"
            />
            {/* subtle gold overlay corner */}
            <div className="absolute inset-0 ring-1 ring-inset ring-amber-200/40 pointer-events-none" />
          </motion.div>
        </div>

        {/* Pizza carousel */}
        <div className="relative">
          {/* Arrows row */}
          <div className="flex items-center justify-between mb-6 px-2">
            <button
              onClick={() => go(-1)}
              className="w-10 h-10 flex items-center justify-center text-stone-400 hover:text-amber-700 transition-colors"
              data-testid="slider-prev"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={() => go(1)}
              className="w-10 h-10 flex items-center justify-center text-stone-400 hover:text-amber-700 transition-colors"
              data-testid="slider-next"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>

          {/* Fixed-position pizza circles — all visible, active grows + colorizes */}
          <div className="flex items-end justify-center gap-6 md:gap-10">
            {pizzas.map((pizza, i) => {
              const isActive = i === active;
              return (
                <motion.button
                  key={pizza.src}
                  onClick={() => { setDir(i > active ? 1 : -1); setActive(i); }}
                  animate={{
                    width: isActive ? 200 : 130,
                    height: isActive ? 200 : 130,
                    filter: isActive ? "grayscale(0%) brightness(1)" : "grayscale(100%) brightness(0.75)",
                    opacity: isActive ? 1 : 0.6,
                  }}
                  transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
                  className="shrink-0 rounded-full overflow-hidden border-2 border-amber-200 shadow-md focus:outline-none"
                  data-testid={`slider-pizza-${i}`}
                >
                  <img
                    src={pizza.src}
                    alt={pizza.label}
                    className="w-full h-full object-cover"
                  />
                </motion.button>
              );
            })}
          </div>

          {/* Dots */}
          <div className="flex justify-center gap-2 mt-6">
            {pizzas.map((_, i) => (
              <button
                key={i}
                onClick={() => { setDir(i > active ? 1 : -1); setActive(i); }}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === active ? "bg-amber-700 w-6" : "bg-stone-300 w-1.5"
                }`}
                data-testid={`slider-dot-${i}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
