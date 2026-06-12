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
            className="absolute -top-6 left-0 select-none pointer-events-none leading-none"
            style={{
              fontFamily: "'Dancing Script', cursive",
              fontSize: "clamp(60px, 10vw, 110px)",
              fontWeight: 400,
              color: "#C5A485",
              opacity: 0.22,
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
            <p className="text-sm font-semibold tracking-[0.25em] uppercase text-amber-700 mb-2">
              Willkommen
            </p>
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
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque
              vehicula libero vel felis convallis, at tincidunt eros tincidunt.
              Vivamus euismod erat nec felis volutpat, vel auctor nunc efficitur.
            </p>
            <p>
              Pellentesque habitant morbi tristique senectus et netus et malesuada
              fames ac turpis egestas. Sed dignissim, libero ut fermentum
              malesuada, sapien erat volutpat felis, sit amet ultricies nunc velit
              vel quam.
            </p>
            <p>
              Donec euismod orci at nisl facilisis, eget bibendum risus tempus.
              Cras vehicula metus in dui malesuada, vitae porttitor metus gravida.
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

        {/* Pizza circular slider */}
        <div className="relative flex items-center justify-center gap-0">
          {/* Prev arrow */}
          <button
            onClick={() => go(-1)}
            className="shrink-0 w-10 h-10 flex items-center justify-center text-stone-400 hover:text-amber-700 transition-colors"
            data-testid="slider-prev"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          {/* Slides */}
          <div className="flex-1 overflow-hidden">
            <div className="flex items-center justify-center gap-6 md:gap-10">
              {pizzas.map((pizza, i) => {
                const offset = (i - active + pizzas.length) % pizzas.length;
                const isActive = offset === 0;
                const isNext = offset === 1;
                const isPrev = offset === pizzas.length - 1;
                const isVisible = isActive || isNext || isPrev;

                return (
                  <motion.button
                    key={pizza.src}
                    onClick={() => { setDir(i > active ? 1 : -1); setActive(i); }}
                    animate={{
                      scale: isActive ? 1 : 0.78,
                      opacity: isActive ? 1 : isVisible ? 0.55 : 0,
                      filter: isActive ? "grayscale(0%)" : "grayscale(30%)",
                    }}
                    transition={{ duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
                    className="shrink-0 rounded-full overflow-hidden border-2 border-amber-200 shadow-md focus:outline-none"
                    style={{ width: isActive ? 180 : 140, height: isActive ? 180 : 140 }}
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
          </div>

          {/* Next arrow */}
          <button
            onClick={() => go(1)}
            className="shrink-0 w-10 h-10 flex items-center justify-center text-stone-400 hover:text-amber-700 transition-colors"
            data-testid="slider-next"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>

        {/* Dots */}
        <div className="flex justify-center gap-2 mt-6">
          {pizzas.map((_, i) => (
            <button
              key={i}
              onClick={() => { setDir(i > active ? 1 : -1); setActive(i); }}
              className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                i === active ? "bg-amber-700 w-4" : "bg-stone-300"
              }`}
              data-testid={`slider-dot-${i}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
