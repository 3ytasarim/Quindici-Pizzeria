import { motion } from "framer-motion";
import { UtensilsCrossed, Tag } from "lucide-react";

export default function HeroSection() {

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-stone-900">

      {/* Background video */}
      <video
        className="absolute inset-0 w-full h-full object-cover"
        style={{ zIndex: 0 }}
        autoPlay
        loop
        muted
        playsInline
      >
        <source src="/hero-video.mov" type="video/mp4" />
        <source src="/hero-video.mov" type="video/quicktime" />
      </video>

      {/* Dark shadow overlay — so text stays readable */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          zIndex: 1,
          background: "linear-gradient(to bottom, rgba(0,0,0,0.62) 0%, rgba(0,0,0,0.52) 50%, rgba(0,0,0,0.72) 100%)",
        }}
      />

      <div className="container relative px-4 py-20 mx-auto text-center flex flex-col items-center" style={{ zIndex: 2 }}>

        {/* Logo above heading */}
        <motion.img
          src="/logo.png"
          alt="Quindici Logo"
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, ease: "easeOut" }}
          className="w-36 md:w-44 h-auto mb-6 drop-shadow-lg"
        />

        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.85, ease: "easeOut" }}
          className="text-5xl md:text-7xl lg:text-8xl font-serif text-white leading-tight drop-shadow-lg"
        >
          Willkommen im Quindici
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, scaleX: 0.6, y: 8 }}
          animate={{ opacity: 1, scaleX: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.18, ease: [0.4, 0, 0.2, 1] }}
          className="flex items-center gap-4 mt-4 mb-8"
        >
          <motion.span
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.7, delay: 0.55, ease: "easeOut" }}
            className="block h-px w-16 origin-left"
            style={{ backgroundColor: "#c5a485" }}
          />
          <h2 className="font-serif italic text-3xl md:text-4xl tracking-wide drop-shadow-md" style={{ color: "#c5a485" }}>
            Trattoria Pizzeria
          </h2>
          <motion.span
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.7, delay: 0.55, ease: "easeOut" }}
            className="block h-px w-16 origin-right"
            style={{ backgroundColor: "#c5a485" }}
          />
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.85, delay: 0.28, ease: "easeOut" }}
          className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto mb-10 drop-shadow"
        >
          Italienische Auszeit mit frischen, regionalen Zutaten mitten in Ludwigsburg
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.45, ease: "easeOut" }}
          className="flex flex-wrap items-center justify-center gap-3"
        >
          <motion.a
            href="/api/mittagstisch/pdf"
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.04, boxShadow: "0 0 24px rgba(212,175,55,0.35)" }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="inline-flex items-center gap-2.5 px-7 py-3 border border-[#c5a485]/70 bg-black/30 backdrop-blur-sm text-sm font-semibold shadow-sm hover:bg-[#c5a485]/10 transition-colors"
            style={{ color: "#c5a485" }}
            data-testid="button-mittagstisch-der-woche"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-60" style={{ backgroundColor: "#c5a485" }} />
              <span className="relative inline-flex rounded-full h-2 w-2" style={{ backgroundColor: "#c5a485" }} />
            </span>
            <UtensilsCrossed className="w-3.5 h-3.5" style={{ color: "#c5a485" }} />
            Mittagstisch
          </motion.a>

          <motion.a
            href="https://www.lieferando.de/speisekarte/quindici-pizza"
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.04, boxShadow: "0 0 24px rgba(197,164,133,0.4)" }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="inline-flex items-center gap-2.5 px-7 py-3 text-sm font-semibold shadow-sm transition-colors"
            style={{ backgroundColor: "#c5a485", color: "#1c1917" }}
          >
            <Tag className="w-3.5 h-3.5" />
            10 % Abholrabatt
          </motion.a>
        </motion.div>
      </div>
    </section>
  );
}
