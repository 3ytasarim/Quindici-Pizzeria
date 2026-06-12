import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

const headingContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

const tagLine = {
  hidden: { opacity: 0, x: -18 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.45, ease: "easeOut" } },
};

const titleReveal = {
  hidden: { opacity: 0, y: 28, clipPath: "inset(0 0 100% 0)" },
  visible: {
    opacity: 1,
    y: 0,
    clipPath: "inset(0 0 0% 0)",
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
  },
};

const rulerExpand = {
  hidden: { scaleX: 0 },
  visible: { scaleX: 1, transition: { duration: 0.5, ease: "easeOut", delay: 0.1 } },
};

const pillars = [
  {
    label: "Famiglia",
    text: "Familiäres Ambiente, herzliche Gastgeber und ein Team, das mit Leidenschaft kocht.",
  },
  {
    label: "Qualità",
    text: "Frische Zutaten, handgemachter Teig und Rezepte, die aus Neapel direkt zu Ihnen kommen.",
  },
  {
    label: "Passione",
    text: "Jedes Gericht ist ein Ausdruck unserer Liebe zur italienischen Küche – ehrlich und authentisch.",
  },
];

export default function UeberUns() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: "#fdf8f2" }}>
      <Navbar />

      {/* Hero */}
      <section className="relative min-h-[52vh] flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url(/hero-bg.jpg)", opacity: 0.55 }}
        />
        <div
          className="absolute inset-0 z-0 pointer-events-none"
          style={{
            background:
              "linear-gradient(to bottom, rgba(253,248,242,0.78) 0%, rgba(253,248,242,0.52) 50%, rgba(253,248,242,0.78) 100%)",
          }}
        />
        <div className="relative z-10 text-center px-6">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-6xl md:text-8xl font-bold text-stone-800 mb-6"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Über uns
          </motion.h1>
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.7, delay: 0.25 }}
            className="mx-auto h-px w-24 bg-amber-600 origin-center"
          />
        </div>
      </section>

      {/* Intro Text */}
      <section className="py-24 md:py-32">
        <div className="container mx-auto px-6 max-w-3xl text-center">
          <motion.div
            variants={headingContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
          >
            <motion.p
              variants={tagLine}
              className="text-amber-700 uppercase tracking-[0.3em] text-xs font-semibold mb-4"
            >
              Über uns
            </motion.p>
            <div style={{ overflow: "hidden" }}>
              <motion.h2
                variants={titleReveal}
                className="text-5xl md:text-6xl font-bold text-stone-800 mb-6"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                Über Quindici
              </motion.h2>
            </div>
            <motion.div
              variants={rulerExpand}
              className="mx-auto h-px w-16 bg-amber-600 mb-10"
              style={{ transformOrigin: "center" }}
            />
            <motion.p
              variants={fadeUp}
              className="text-stone-600 text-lg md:text-xl leading-relaxed"
              style={{ fontFamily: "'Quicksand', sans-serif" }}
            >
              Quindici Trattoria Pizzeria steht für italienische Küche, familiäre Atmosphäre und
              ehrliche Gastfreundschaft. Hier geht es nicht nur darum, gut zu essen – sondern
              darum, sich wohlzufühlen, gemeinsam Zeit zu verbringen und ein Stück Italien in
              Ludwigsburg zu erleben.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Large Photo */}
      <section className="relative h-[60vh] md:h-[75vh] overflow-hidden">
        <motion.div
          initial={{ scale: 1.06, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1, ease: "easeOut" }}
          viewport={{ once: true }}
          className="absolute inset-0"
        >
          <img
            src="/hero-bg.jpg"
            alt="Quindici Trattoria Pizzeria"
            className="w-full h-full object-cover"
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to bottom, rgba(253,248,242,0.18) 0%, rgba(253,248,242,0.08) 60%, rgba(253,248,242,0.45) 100%)",
            }}
          />
        </motion.div>
      </section>

      {/* Three Pillars */}
      <section className="py-20 md:py-28 bg-stone-50/60">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 lg:gap-16">
            {pillars.map((pillar, i) => (
              <motion.div
                key={pillar.label}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: i * 0.1 }}
                className="flex flex-col items-center text-center"
              >
                <p className="text-amber-700 uppercase tracking-[0.3em] text-xs font-semibold mb-3">
                  {pillar.label}
                </p>
                <div className="h-px w-10 bg-amber-600 mb-5" />
                <p className="text-stone-600 text-[15px] leading-relaxed">{pillar.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
