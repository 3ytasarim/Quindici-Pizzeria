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


export default function UeberUns() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: "#fdf8f2" }}>
      <Navbar />

      {/* Hero */}
      <section className="relative min-h-[52vh] flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 z-0 bg-cover bg-no-repeat"
          style={{ backgroundImage: "url(/ueberuns-hero.jpg)", opacity: 0.55, backgroundPosition: "center 70%" }}
        />
        <div
          className="absolute inset-0 z-0 pointer-events-none"
          style={{
            background:
              "linear-gradient(to bottom, rgba(253,248,242,0.78) 0%, rgba(253,248,242,0.52) 50%, rgba(253,248,242,0.78) 100%)",
          }}
        />

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

      {/* Text + Two Photos Section */}
      <section className="pt-2 pb-20 md:pt-4 md:pb-28 overflow-hidden" style={{ backgroundColor: "#fdf8f2" }}>
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
                Ein Stück Italien
              </motion.h2>
              <motion.h2
                variants={{ hidden: { opacity: 0, y: 28 }, visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1], delay: 0.1 } } }}
                className="text-4xl md:text-5xl font-bold mb-5 leading-tight"
                style={{ fontFamily: "'Playfair Display', serif", color: "#b45309" }}
              >
                in Ludwigsburg
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
                  src="/ueberuns-large.jpg"
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
                  src="/restaurant-entrance.jpg"
                  alt="Quindici – Eingang"
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

      {/* Team — Teil der Familie */}
      <section className="relative overflow-hidden py-20 md:py-28" style={{ backgroundColor: "#fdf8f2" }}>
        <div className="container mx-auto px-6 relative z-10">

          <div style={{ overflow: "hidden" }} className="mb-14 md:mb-18">
            <motion.h2
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
              className="text-5xl md:text-6xl lg:text-7xl font-bold"
              style={{ fontFamily: "'Playfair Display', serif", color: "#c5a485" }}
            >
              Teil der Quindici Familie
            </motion.h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-5">
            {[
              { name: "Lorem Ipsum", photo: "/about-photo-1.png" },
              { name: "Lorem Ipsum", photo: "/about-photo-2.png" },
              { name: "Lorem Ipsum", photo: "/about-photo-1.png" },
              { name: "Lorem Ipsum", photo: "/about-photo-2.png" },
              { name: "Lorem Ipsum", photo: "/about-photo-1.png" },
              { name: "Lorem Ipsum", photo: "/about-photo-2.png" },
            ].map((member, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-30px" }}
                transition={{ duration: 0.6, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                className="group cursor-default"
              >
                <div className="relative w-full aspect-[3/4] overflow-hidden mb-3 flex items-end justify-center" style={{ background: "linear-gradient(160deg, #e8e0d5 0%, #d6cbbe 60%, #c9bfb0 100%)" }}>
                  <svg
                    viewBox="0 0 160 213"
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-full h-full transition-transform duration-700 group-hover:scale-105"
                    preserveAspectRatio="xMidYMax meet"
                  >
                    <defs>
                      <radialGradient id={`headGrad${i}`} cx="40%" cy="35%" r="60%">
                        <stop offset="0%" stopColor="#d4b896" />
                        <stop offset="55%" stopColor="#b8956e" />
                        <stop offset="100%" stopColor="#7a5c3e" />
                      </radialGradient>
                      <radialGradient id={`bodyGrad${i}`} cx="35%" cy="30%" r="70%">
                        <stop offset="0%" stopColor="#c9a87c" />
                        <stop offset="50%" stopColor="#a07850" />
                        <stop offset="100%" stopColor="#5e3d22" />
                      </radialGradient>
                      <radialGradient id={`shadowGrad${i}`} cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor="#000" stopOpacity="0.18" />
                        <stop offset="100%" stopColor="#000" stopOpacity="0" />
                      </radialGradient>
                      <filter id={`blur${i}`}>
                        <feGaussianBlur stdDeviation="3" />
                      </filter>
                    </defs>
                    {/* drop shadow */}
                    <ellipse cx="80" cy="208" rx="48" ry="8" fill="#00000030" filter={`url(#blur${i})`} />
                    {/* neck */}
                    <rect x="70" y="90" width="20" height="22" rx="6" fill={`url(#headGrad${i})`} />
                    {/* head */}
                    <ellipse cx="80" cy="70" rx="30" ry="34" fill={`url(#headGrad${i})`} />
                    {/* head highlight */}
                    <ellipse cx="68" cy="56" rx="10" ry="14" fill="#fff" opacity="0.12" />
                    {/* shoulders / torso */}
                    <path d="M18 213 Q18 148 80 138 Q142 148 142 213 Z" fill={`url(#bodyGrad${i})`} />
                    {/* torso highlight */}
                    <path d="M42 155 Q58 145 80 142 Q72 160 55 175 Z" fill="#fff" opacity="0.10" />
                  </svg>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-amber-600 scale-x-0 group-hover:scale-x-100 transition-transform duration-400 origin-left" />
                </div>
                <p
                  className="text-[13px] font-medium transition-colors duration-300"
                  style={{ color: "#c5a485", fontFamily: "'Quicksand', sans-serif" }}
                >
                  {member.name}
                </p>
              </motion.div>
            ))}
          </div>

        </div>
      </section>

      {/* Mittagstisch Banner */}
      <MittagstischBanner />


      <Footer />
    </div>
  );
}
