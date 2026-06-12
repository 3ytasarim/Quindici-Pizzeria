import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MittagstischBanner from "@/components/MittagstischBanner";

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
            className="mx-auto h-px w-20 bg-amber-600"
            style={{ transformOrigin: "center" }}
          />
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
      <section className="relative overflow-hidden bg-stone-900 py-24 md:py-32">
        {/* Background watermark */}
        <div
          className="absolute inset-0 pointer-events-none select-none flex items-center justify-center"
          aria-hidden="true"
        >
          <span
            className="text-white/[0.03] font-bold leading-none"
            style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(120px, 20vw, 280px)" }}
          >
            Famiglia
          </span>
        </div>

        <div className="container mx-auto px-6 relative z-10">
          {/* Heading */}
          <motion.div
            variants={headingContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            className="mb-16 md:mb-20"
          >
            <motion.p
              variants={tagLine}
              className="text-amber-500 uppercase tracking-[0.35em] text-xs font-semibold mb-4"
            >
              Unser Team
            </motion.p>
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
              <div style={{ overflow: "hidden" }}>
                <motion.h2
                  variants={titleReveal}
                  className="text-5xl md:text-6xl font-bold text-white"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  Teil der Familie
                </motion.h2>
              </div>
              <motion.p
                variants={fadeUp}
                className="text-stone-400 text-sm leading-relaxed max-w-xs md:text-right"
              >
                Jeder Teller, jedes Lächeln — das Ergebnis eines Teams, das mit Herz dabei ist.
              </motion.p>
            </div>
            <motion.div
              variants={rulerExpand}
              className="mt-6 h-px bg-stone-700"
              style={{ transformOrigin: "left" }}
            />
          </motion.div>

          {/* Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6">
            {[
              { name: "Carlo Russo",  role: "Küchenchef",   initials: "CR", hue: "from-amber-900/60" },
              { name: "Luca Ferrari", role: "Pizzaiolo",     initials: "LF", hue: "from-stone-700/60" },
              { name: "Sofia Bianchi",role: "Service",       initials: "SB", hue: "from-amber-900/60" },
              { name: "Marco Esposito",role:"Sous Chef",     initials: "ME", hue: "from-stone-700/60" },
              { name: "Elena Ricci",  role: "Service",       initials: "ER", hue: "from-amber-900/60" },
              { name: "Nico Marino",  role: "Bar",           initials: "NM", hue: "from-stone-700/60" },
            ].map((member, i) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-30px" }}
                transition={{ duration: 0.55, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                className="group cursor-default"
              >
                {/* Photo card */}
                <div className="relative w-full aspect-[3/4] overflow-hidden bg-stone-800 mb-4">
                  {/* Gradient bg */}
                  <div className={`absolute inset-0 bg-gradient-to-t ${member.hue} to-transparent opacity-60`} />

                  {/* Silhouette */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                    <div
                      className="w-16 h-16 rounded-full bg-stone-600/60 flex items-center justify-center transition-transform duration-500 group-hover:scale-110"
                    >
                      <span
                        className="text-stone-300 font-bold text-lg"
                        style={{ fontFamily: "'Playfair Display', serif" }}
                      >
                        {member.initials}
                      </span>
                    </div>
                  </div>

                  {/* Hover overlay */}
                  <motion.div
                    className="absolute inset-0 bg-amber-700/20"
                    initial={{ opacity: 0 }}
                    whileHover={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  />

                  {/* Bottom info slide-up on hover */}
                  <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-400 bg-gradient-to-t from-black/70 to-transparent">
                    <p className="text-amber-400 text-[10px] uppercase tracking-[0.2em] font-semibold">
                      {member.role}
                    </p>
                  </div>

                  {/* Amber border on hover */}
                  <div className="absolute inset-0 border border-amber-600/0 group-hover:border-amber-600/50 transition-colors duration-300" />
                </div>

                {/* Name below card */}
                <div>
                  <p
                    className="text-white font-semibold text-[14px] leading-tight mb-1 group-hover:text-amber-400 transition-colors duration-300"
                    style={{ fontFamily: "'Playfair Display', serif" }}
                  >
                    {member.name}
                  </p>
                  <p className="text-stone-500 text-[11px] uppercase tracking-[0.18em]">
                    {member.role}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Text + Two Photos Section */}
      <section className="py-20 md:py-28 overflow-hidden" style={{ backgroundColor: "#fdf8f2" }}>
        <div className="container mx-auto px-6">
          <div className="flex flex-col lg:flex-row gap-16 lg:gap-24 items-center">

            {/* Left: Text */}
            <motion.div
              className="flex-1 min-w-0"
              variants={headingContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
            >
              <motion.h2
                variants={{ hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } } }}
                className="text-4xl md:text-5xl font-bold text-stone-800 mb-1 leading-tight"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                Die Geschichte
              </motion.h2>
              <motion.h2
                variants={{ hidden: { opacity: 0, y: 28 }, visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1], delay: 0.1 } } }}
                className="text-4xl md:text-5xl font-bold text-amber-700 mb-5 leading-tight"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                von Quindici
              </motion.h2>
              <motion.div variants={rulerExpand} className="h-px w-16 bg-amber-600 mb-8" style={{ transformOrigin: "left" }} />

              <motion.p
                variants={fadeUp}
                className="text-stone-600 text-[16px] leading-[1.85] mb-6"
                style={{ fontFamily: "'Quicksand', sans-serif" }}
              >
                Quindici Trattoria Pizzeria steht für italienische Küche, familiäre Atmosphäre und
                ehrliche Gastfreundschaft. Hier geht es nicht nur darum, gut zu essen – sondern
                darum, sich wohlzufühlen, gemeinsam Zeit zu verbringen und ein Stück Italien in
                Ludwigsburg zu erleben.
              </motion.p>

              <motion.p
                variants={fadeUp}
                className="text-stone-500 text-[15px] leading-[1.85]"
                style={{ fontFamily: "'Quicksand', sans-serif" }}
              >
                Unsere Küche verbindet frische Zutaten, traditionelle Rezepte und sorgfältige
                Zubereitung. Ob Pizza, Pasta, Salate, Antipasti oder italienische Klassiker –
                jedes Gericht wird mit Liebe zum Detail vorbereitet und soll unseren Gästen ein
                besonderes Geschmackserlebnis bieten.
              </motion.p>
            </motion.div>

            {/* Right: Collage — big photo right, small photo left overlapping */}
            <div className="w-full lg:w-[48%] shrink-0 relative" style={{ height: "520px" }}>

              {/* Large photo — right side, full height */}
              <motion.div
                className="absolute right-0 top-0 overflow-hidden"
                style={{ width: "68%", height: "100%" }}
                initial={{ opacity: 0, y: 70 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1], delay: 0.05 }}
              >
                <motion.img
                  src="/about-photo-2.png"
                  alt="Quindici Restaurant"
                  className="w-full h-full object-cover"
                  whileHover={{ scale: 1.04 }}
                  transition={{ duration: 0.6 }}
                />
              </motion.div>

              {/* Small photo — centered vertically, overlaps big photo */}
              <div className="absolute left-0" style={{ width: "52%", height: "62%", top: "50%", transform: "translateY(-50%)", zIndex: 10 }}>
              <motion.div
                className="overflow-hidden shadow-2xl w-full h-full"
                initial={{ opacity: 0, y: 70 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1], delay: 0.18 }}
              >
                <motion.img
                  src="/about-photo-1.png"
                  alt="Quindici Tisch"
                  className="w-full h-full object-cover"
                  whileHover={{ scale: 1.04 }}
                  transition={{ duration: 0.6 }}
                />
                {/* Thin amber border accent */}
                <div className="absolute inset-0 border-4 border-white/30 pointer-events-none" />
              </motion.div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* Mittagstisch Banner */}
      <MittagstischBanner />

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
