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
      <section className="relative min-h-[72vh] flex items-center justify-center overflow-hidden" style={{ backgroundColor: "#fdf8f2" }}>

        {/* Floating pizza icons — rise from bottom, fade out at top */}
        {[
          { src: "/icon-pizza-1.png",     left: "5%",  size: 36, duration: 10, delay: 0    },
          { src: "/icon-pizza-slice.png", left: "12%", size: 28, duration: 13, delay: 1.5  },
          { src: "/icon-pizza-2.png",     left: "22%", size: 44, duration: 9,  delay: 3    },
          { src: "/icon-pizza-cutter.png",left: "32%", size: 32, duration: 14, delay: 0.8  },
          { src: "/icon-pizza-3.png",     left: "43%", size: 40, duration: 11, delay: 5    },
          { src: "/icon-pizza-4.png",     left: "55%", size: 30, duration: 12, delay: 2    },
          { src: "/icon-pizza-5.png",     left: "64%", size: 46, duration: 10, delay: 4    },
          { src: "/icon-pizza-6.png",     left: "74%", size: 28, duration: 13, delay: 1    },
          { src: "/icon-pizza-7.png",     left: "83%", size: 38, duration: 11, delay: 6    },
          { src: "/icon-pizza-8.png",     left: "91%", size: 32, duration: 9,  delay: 2.5  },
          { src: "/icon-pizza-1.png",     left: "18%", size: 24, duration: 15, delay: 7    },
          { src: "/icon-pizza-slice.png", left: "48%", size: 50, duration: 8,  delay: 3.5  },
          { src: "/icon-pizza-2.png",     left: "70%", size: 26, duration: 12, delay: 8    },
          { src: "/icon-pizza-3.png",     left: "38%", size: 34, duration: 14, delay: 9    },
        ].map((p, i) => (
          <motion.img
            key={i}
            src={p.src}
            alt=""
            aria-hidden="true"
            className="absolute pointer-events-none select-none"
            style={{
              left: p.left,
              bottom: 0,
              width: p.size,
              height: p.size,
              objectFit: "contain",
              zIndex: 0,
            }}
            animate={{
              y: [0, -(window.innerHeight * 1.4)],
              opacity: [0, 0.22, 0.22, 0],
              rotate: [0, i % 2 === 0 ? 20 : -20],
            }}
            transition={{
              duration: p.duration,
              delay: p.delay,
              repeat: Infinity,
              ease: "linear",
              times: [0, 0.15, 0.8, 1],
            }}
          />
        ))}
        <div className="relative z-10 text-center px-6 max-w-3xl mx-auto">
          {/* Eyebrow */}
          <motion.p
            initial={{ opacity: 0, letterSpacing: "0.15em" }}
            animate={{ opacity: 1, letterSpacing: "0.3em" }}
            transition={{ duration: 0.8 }}
            className="text-amber-700 uppercase text-xs font-semibold mb-6"
            style={{ letterSpacing: "0.3em" }}
          >
            Trattoria Pizzeria · Ludwigsburg
          </motion.p>

          {/* Main title */}
          <div style={{ overflow: "hidden" }}>
            <motion.h1
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
              className="text-6xl md:text-8xl font-bold text-stone-800 mb-6"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Über Quindici
            </motion.h1>
          </div>

          {/* Divider */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.6, delay: 0.45, ease: "easeOut" }}
            className="mx-auto h-px w-20 bg-amber-600 mb-8"
            style={{ transformOrigin: "center" }}
          />

          {/* Subtext */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.6, ease: "easeOut" }}
            className="text-stone-600 text-lg md:text-xl leading-relaxed"
            style={{ fontFamily: "'Quicksand', sans-serif" }}
          >
            Quindici Trattoria Pizzeria steht für italienische Küche, familiäre Atmosphäre und
            ehrliche Gastfreundschaft. Hier geht es nicht nur darum, gut zu essen – sondern darum,
            sich wohlzufühlen, gemeinsam Zeit zu verbringen und ein Stück Italien in Ludwigsburg
            zu erleben.
          </motion.p>
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

      {/* Team — Teil der Familie */}
      <section className="py-20 md:py-28">
        <div className="container mx-auto px-6">
          {/* Heading */}
          <motion.div
            variants={headingContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            className="text-center mb-16"
          >
            <motion.p variants={tagLine} className="text-amber-700 uppercase tracking-[0.3em] text-xs font-semibold mb-3">
              Unser Team
            </motion.p>
            <div style={{ overflow: "hidden" }}>
              <motion.h2
                variants={titleReveal}
                className="text-4xl md:text-5xl font-bold text-stone-800 mb-4"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                Teil der Familie
              </motion.h2>
            </div>
            <motion.div
              variants={rulerExpand}
              className="mx-auto h-px w-16 bg-amber-600"
              style={{ transformOrigin: "center" }}
            />
          </motion.div>

          {/* Cards grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {[
              { name: "Carlo", role: "Küchenchef" },
              { name: "Luca", role: "Pizzaiolo" },
              { name: "Sofia", role: "Service" },
              { name: "Marco", role: "Sous Chef" },
              { name: "Elena", role: "Service" },
              { name: "Nico", role: "Bar" },
            ].map((member, i) => (
              <motion.div
                key={member.name}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-40px" }}
                transition={{ delay: i * 0.08 }}
                className="flex flex-col items-center text-center group"
              >
                {/* Photo placeholder */}
                <div className="w-full aspect-[3/4] mb-4 overflow-hidden relative bg-stone-100">
                  <div
                    className="absolute inset-0 flex items-end justify-center pb-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{ background: "linear-gradient(to top, rgba(180,120,40,0.35) 0%, transparent 60%)" }}
                  />
                  {/* Placeholder silhouette */}
                  <div className="w-full h-full flex items-center justify-center">
                    <svg viewBox="0 0 100 130" className="w-2/3 h-2/3 text-stone-300" fill="currentColor">
                      <circle cx="50" cy="38" r="22" />
                      <path d="M10 130 C10 90 90 90 90 130Z" />
                    </svg>
                  </div>
                  {/* Subtle amber tint overlay */}
                  <div className="absolute inset-0 bg-amber-700/5 group-hover:bg-amber-700/10 transition-colors duration-300" />
                </div>

                {/* Name */}
                <p
                  className="text-stone-800 font-bold text-[15px] mb-1"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  {member.name}
                </p>
                {/* Role */}
                <p className="text-amber-700 text-[11px] uppercase tracking-[0.18em] font-semibold mb-2">
                  {member.role}
                </p>
                {/* Lorem lines */}
                <div className="space-y-1.5 w-full">
                  <div className="h-px bg-stone-200 w-4/5 mx-auto" />
                  <div className="h-px bg-stone-200 w-3/5 mx-auto" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
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
