import { useRef } from "react";
import { motion, useInView } from "framer-motion";

const pizzas = [
  { src: "/pizza-1.png", label: "Margherita" },
  { src: "/pizza-2.png", label: "Diavola" },
  { src: "/pizza-3.png", label: "Quattro Formaggi" },
  { src: "/pizza-4.png", label: "Prosciutto e Rucola" },
];

export default function BenvenutilSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section ref={ref} className="relative overflow-hidden bg-[#fdf8f2] py-24 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Heading */}
        <div className="relative mb-10">
          <motion.span
            initial={{ opacity: 0, y: -10 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 1, ease: "easeOut" }}
            className="absolute top-[-28px] left-0 select-none pointer-events-none leading-none"
            style={{
              fontFamily: "'Dancing Script', cursive",
              fontSize: "clamp(60px, 10vw, 110px)",
              fontWeight: 400,
              color: "#C5A485",
              opacity: 0.18,
              letterSpacing: "0.02em",
            }}
          >
            Benvenuti
          </motion.span>

          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.25, ease: "easeOut" }}
            className="relative z-10 pt-16"
          >
            <h2 className="font-serif text-3xl md:text-4xl text-stone-800 leading-snug">
              In der Trattoria Pizzeria in Ludwigsburg
            </h2>
          </motion.div>
        </div>

        {/* Two-column: text left, image right */}
        <div className="grid md:grid-cols-2 gap-10 items-stretch mb-20">
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
            className="space-y-5 text-stone-600 text-base leading-relaxed"
          >
            <p>
              Bei Quindici Trattoria Pizzeria erwartet Sie italienische Küche mit Herz. Von
              knuspriger Pizza über hausgemachte Pasta, frische Salate, Antipasti,
              Fleischgerichte und Fischspezialitäten bis hin zu ausgewählten saisonalen
              Empfehlungen bereiten wir unsere Speisen mit viel Leidenschaft, frischen
              Zutaten und Liebe zum Detail zu.
            </p>
            <p>
              Ob gemütliches Abendessen, entspannte Mittagspause, Familienessen, Treffen mit
              Freunden oder ein besonderer Anlass – bei Quindici sollen Sie sich vom ersten
              Moment an willkommen fühlen.
            </p>
            <p>
              Unser Ziel ist es, die traditionelle italienische Gastfreundschaft mit
              hochwertigen Zutaten und authentischen Rezepten zu verbinden.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.9, delay: 0.5, ease: "easeOut" }}
            className="relative overflow-hidden shadow-xl min-h-[260px]"
          >
            <img
              src="/restaurant-exterior.jpg"
              alt="Quindici Trattoria Pizzeria Ludwigsburg"
              className="absolute inset-0 w-full h-full object-cover object-bottom"
            />
            <div className="absolute inset-0 ring-1 ring-inset ring-amber-200/40 pointer-events-none" />
          </motion.div>
        </div>

        {/* Pizza row — static, all visible */}
        <div className="flex items-center justify-center gap-4 md:gap-8">
          {pizzas.map((pizza, i) => (
            <div
              key={pizza.src}
              className="shrink-0 rounded-full overflow-hidden border-2 border-amber-200 shadow-md"
              style={{
                width: "clamp(80px, 18vw, 190px)",
                height: "clamp(80px, 18vw, 190px)",
                filter: i < pizzas.length - 1 ? "grayscale(100%) brightness(0.75)" : "none",
                opacity: i < pizzas.length - 1 ? 0.65 : 1,
              }}
            >
              <img
                src={pizza.src}
                alt={pizza.label}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
