import { useRef, useEffect, useState } from "react";
import { motion, useInView } from "framer-motion";

const STATIC_PIZZAS = [
  { id: "s1", src: "/pizza-1.png", label: "Margherita" },
  { id: "s2", src: "/pizza-2.png", label: "Diavola" },
  { id: "s3", src: "/pizza-3.png", label: "Quattro Formaggi" },
  { id: "s4", src: "/pizza-4.png", label: "Prosciutto e Rucola" },
];

const CARD_SIZE = 190;
const GAP = 32;
const SPEED = 0.5;

export default function BenvenutilSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const trackRef = useRef<HTMLDivElement>(null);
  const xRef = useRef(0);
  const rafRef = useRef<number>(0);
  const pausedRef = useRef(false);

  const [pizzas, setPizzas] = useState(STATIC_PIZZAS);

  useEffect(() => {
    fetch("/api/pizza")
      .then(r => r.ok ? r.json() : [])
      .then((data: { id: string; imageUrl: string; label: string }[]) => {
        if (data.length > 0) {
          setPizzas(data.map(p => ({ id: p.id, src: p.imageUrl, label: p.label })));
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const track = trackRef.current;
    if (!track || pizzas.length === 0) return;
    const itemW = CARD_SIZE + GAP;
    const totalW = itemW * pizzas.length;
    xRef.current = 0;
    const animate = () => {
      if (!pausedRef.current) {
        xRef.current -= SPEED;
        if (xRef.current <= -totalW) xRef.current += totalW;
        track.style.transform = `translateX(${xRef.current}px)`;
      }
      rafRef.current = requestAnimationFrame(animate);
    };
    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [pizzas]);

  const displayed = [...pizzas, ...pizzas, ...pizzas];

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
              im Quindici in Ludwigsburg
            </h2>
          </motion.div>
        </div>

        {/* Two-column */}
        <div className="grid md:grid-cols-2 gap-10 items-stretch mb-20">
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
            className="space-y-5 text-stone-600 text-base leading-relaxed"
          >
            <p>
              Bei Quindici Trattoria Pizzeria erwartet Dich italienische Küche mit Herz. Von
              knuspriger Pizza über hausgemachte Pasta, frische Salate, Antipasti,
              Fleischgerichte und Fischspezialitäten bis hin zu ausgewählten saisonalen
              Empfehlungen bereiten wir unsere Speisen mit viel Leidenschaft, frischen
              Zutaten und Liebe zum Detail zu.
            </p>
            <p>
              Ob gemütliches Abendessen, entspannte Mittagspause, Familienessen, Treffen mit
              Freunden oder ein besonderer Anlass – bei Quindici sollst Du dich vom ersten
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
      </div>

      {/* Restoran fotoğrafı */}
      <div className="px-4 sm:px-8 pb-0">
        <div className="max-w-6xl mx-auto overflow-hidden rounded-2xl shadow-lg h-56 sm:h-80 md:h-[480px] lg:h-[560px]">
          <img
            src="/mittagstisch-bg.jpg"
            alt="Quindici Trattoria Pizzeria – Restaurantinnenraum"
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Infinite pizza band — gizlendi */}
      {/* <div
        className="w-full overflow-hidden" style={{ marginTop: "170px" }}
        onMouseEnter={() => { pausedRef.current = true; }}
        onMouseLeave={() => { pausedRef.current = false; }}
      >
        <div
          ref={trackRef}
          className="flex items-center"
          style={{ gap: GAP, willChange: "transform" }}
        >
          {displayed.map((pizza, i) => (
            <div
              key={`${pizza.id}-${i}`}
              className="shrink-0 rounded-full overflow-hidden"
              style={{ width: CARD_SIZE, height: CARD_SIZE }}
            >
              <img
                src={pizza.src}
                alt={pizza.label}
                className="w-full h-full object-cover"
                draggable={false}
              />
            </div>
          ))}
        </div>
      </div> */}
    </section>
  );
}
