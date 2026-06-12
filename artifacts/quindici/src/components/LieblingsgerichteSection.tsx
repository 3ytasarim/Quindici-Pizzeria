import { useRef } from "react";
import { motion, useInView } from "framer-motion";

const dishes = [
  {
    src: "/dish-pizza-margherita.png",
    name: "Margherita",
    desc: "Tomatensauce, Mozzarella, frisches Basilikum",
  },
  {
    src: "/dish-pasta-carbonara.png",
    name: "Spaghetti alla Carbonara",
    desc: "Guanciale, Ei, Pecorino Romano – klassisch ohne Sahne",
  },
  {
    src: "/dish-polpo.png",
    name: "Polpo alla Griglia",
    desc: "Zart gegrillter Oktopus auf cremigem Kartoffelpüree",
  },
  {
    src: "/dish-carpaccio.png",
    name: "Carpaccio di Manzo",
    desc: "Rohes Rindfleisch, Parmesan, Rucola, Zitronenöl",
  },
  {
    src: "/dish-pizza-diavola.png",
    name: "Diavola",
    desc: "Tomatensauce, Mozzarella, scharfe Salami",
  },
  {
    src: "/dish-tiramisu.png",
    name: "Tiramisù Classico",
    desc: "Mascarpone, Espresso, Löffelbiskuit – hausgemacht",
  },
  // duplicate set for seamless infinite loop
  {
    src: "/dish-pizza-margherita.png",
    name: "Margherita",
    desc: "Tomatensauce, Mozzarella, frisches Basilikum",
  },
  {
    src: "/dish-pasta-carbonara.png",
    name: "Spaghetti alla Carbonara",
    desc: "Guanciale, Ei, Pecorino Romano – klassisch ohne Sahne",
  },
  {
    src: "/dish-polpo.png",
    name: "Polpo alla Griglia",
    desc: "Zart gegrillter Oktopus auf cremigem Kartoffelpüree",
  },
  {
    src: "/dish-carpaccio.png",
    name: "Carpaccio di Manzo",
    desc: "Rohes Rindfleisch, Parmesan, Rucola, Zitronenöl",
  },
  {
    src: "/dish-pizza-diavola.png",
    name: "Diavola",
    desc: "Tomatensauce, Mozzarella, scharfe Salami",
  },
  {
    src: "/dish-tiramisu.png",
    name: "Tiramisù Classico",
    desc: "Mascarpone, Espresso, Löffelbiskuit – hausgemacht",
  },
];

export default function LieblingsgerichteSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <section ref={ref} className="bg-[#fdf8f2] py-20 overflow-hidden">
      {/* Header */}
      <div className="max-w-6xl mx-auto px-6 mb-12">
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-sm font-semibold tracking-[0.25em] uppercase text-amber-700 mb-3"
        >
          Unsere Empfehlungen
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 18 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="font-serif text-3xl md:text-4xl text-stone-800 mb-4 leading-snug"
        >
          Unsere italienischen Lieblingsgerichte
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="text-stone-500 text-base leading-relaxed max-w-2xl"
        >
          Entdecken Sie eine Auswahl unserer beliebtesten Gerichte – frisch
          zubereitet, voller Geschmack und mit dem besonderen Quindici-Gefühl.
        </motion.p>
      </div>

      {/* Infinite scroll track */}
      <div className="relative">
        {/* Left fade */}
        <div className="absolute left-0 top-0 bottom-0 w-20 z-10 pointer-events-none bg-gradient-to-r from-[#fdf8f2] to-transparent" />
        {/* Right fade */}
        <div className="absolute right-0 top-0 bottom-0 w-20 z-10 pointer-events-none bg-gradient-to-l from-[#fdf8f2] to-transparent" />

        <div className="flex gap-5 w-max animate-marquee hover:[animation-play-state:paused]">
          {dishes.map((dish, i) => (
            <div
              key={i}
              className="shrink-0 w-56 overflow-hidden shadow-md border border-amber-100/60 bg-white group"
            >
              {/* Image */}
              <div className="relative w-full overflow-hidden" style={{ height: 240 }}>
                <img
                  src={dish.src}
                  alt={dish.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
              {/* Label */}
              <div className="px-4 py-4 bg-[#fdf8f2]">
                <p className="font-serif text-stone-800 text-sm font-semibold leading-tight mb-1">
                  {dish.name}
                </p>
                <p className="text-stone-400 text-xs leading-snug line-clamp-2">
                  {dish.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
