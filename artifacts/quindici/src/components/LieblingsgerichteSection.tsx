import { useRef, useEffect, useState } from "react";
import { motion, useInView } from "framer-motion";

interface Dish {
  id: string;
  name: string;
  desc: string;
  imageUrl: string;
}

export default function LieblingsgerichteSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const [dishes, setDishes] = useState<Dish[]>([]);

  useEffect(() => {
    fetch("/api/dishes")
      .then(r => r.json())
      .then(data => setDishes(data))
      .catch(() => {});
  }, []);

  const track = [...dishes, ...dishes];

  return (
    <section ref={ref} className="bg-[#fdf8f2] py-20 overflow-hidden">
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
          Entdecke eine Auswahl unserer beliebtesten Gerichte – frisch zubereitet, voller Geschmack und mit dem besonderen Quindici-Gefühl.
        </motion.p>
      </div>

      {dishes.length > 0 && (
        <div className="relative">
          <div className="absolute left-0 top-0 bottom-0 w-20 z-10 pointer-events-none bg-gradient-to-r from-[#fdf8f2] to-transparent" />
          <div className="absolute right-0 top-0 bottom-0 w-20 z-10 pointer-events-none bg-gradient-to-l from-[#fdf8f2] to-transparent" />
          <div className="flex gap-5 w-max animate-marquee hover:[animation-play-state:paused]">
            {track.map((dish, i) => (
              <div
                key={`${dish.id}-${i}`}
                className="shrink-0 w-56 overflow-hidden shadow-md border border-amber-100/60 bg-white group"
              >
                <div className="relative w-full overflow-hidden" style={{ height: 240 }}>
                  <img
                    src={dish.imageUrl}
                    alt={dish.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
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
      )}
    </section>
  );
}
