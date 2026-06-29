import { Instagram, Phone, CalendarCheck } from "lucide-react";
import { useReservationModal } from "@/components/ReservationModal";
import { motion, useAnimationControls } from "framer-motion";
import { useEffect, useState } from "react";

const navLinks = [
  { label: "Startseite",    href: "/" },
  { label: "Speisekarte",   href: "/speisekarte" },
  { label: "Mittagstisch",  href: "/speisekarte" },
  { label: "Lieferservice", href: "https://www.lieferando.de/speisekarte/quindici-pizza", external: true },
  { label: "Kontakt",       href: "/kontakt" },
  { label: "Impressum",     href: "/impressum" },
  { label: "Datenschutz",   href: "/datenschutz" },
];

function StarIcon({ trigger }: { trigger: number }) {
  const controls = useAnimationControls();

  useEffect(() => {
    controls.start({
      rotate: [0, 72, 144, 216, 288, 360],
      scale: [1, 1.5, 1.2, 1.5, 1.2, 1],
      transition: { duration: 0.7, ease: "easeInOut" },
    });
  }, [trigger]);

  return (
    <motion.svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="currentColor"
      className="inline-block shrink-0"
      animate={controls}
      style={{ color: "#c5a485" }}
    >
      <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" />
    </motion.svg>
  );
}

function LetterSpan({
  char,
  index,
  tick,
}: {
  char: string;
  index: number;
  tick: number;
}) {
  const controls = useAnimationControls();

  useEffect(() => {
    const t = setTimeout(() => {
      controls.start({
        y: [0, -4, 0],
        color: ["#6b7280", index < 10 ? "#9ca3af" : "#c5a485", "#6b7280"],
        transition: { duration: 0.4, ease: "easeOut" },
      });
    }, index * 30);
    return () => clearTimeout(t);
  }, [tick]);

  return (
    <motion.span
      animate={controls}
      style={{ display: "inline-block", whiteSpace: "pre", color: "#6b7280" }}
    >
      {char}
    </motion.span>
  );
}

function DesignCredit() {
  const [tick, setTick] = useState(0);
  const letters = "Design by bleibsichtbar.com".split("");

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 3000);
    return () => clearInterval(id);
  }, []);

  return (
    <motion.div
      className="flex items-center gap-2"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.4, duration: 0.8 }}
    >
      <motion.div
        className="h-px bg-stone-700 hidden sm:block"
        initial={{ width: 0 }}
        animate={{ width: 32 }}
        transition={{ delay: 0.6, duration: 0.6 }}
      />

      <StarIcon trigger={tick} />

      <a
        href="https://www.bleibsichtbar.com"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-0 text-[10px] tracking-[0.18em] uppercase font-medium"
        style={{ textDecoration: "none" }}
      >
        {letters.map((char, i) => (
          <LetterSpan key={i} char={char} index={i} tick={tick} />
        ))}
      </a>

      <StarIcon trigger={tick} />

      <motion.div
        className="h-px bg-stone-700 hidden sm:block"
        initial={{ width: 0 }}
        animate={{ width: 32 }}
        transition={{ delay: 0.6, duration: 0.6 }}
      />
    </motion.div>
  );
}

export default function Footer() {
  const { open: openReservation } = useReservationModal();

  return (
    <footer className="relative overflow-hidden bg-stone-900 text-white">
      <img
        src="/quindici-script.png"
        alt=""
        aria-hidden="true"
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 select-none pointer-events-none w-[70%] max-w-2xl"
        style={{ opacity: 0.09 }}
      />

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-3 gap-12 items-start">

        {/* LEFT */}
        <div className="text-center md:text-left">
          <p className="text-xs font-semibold tracking-[0.25em] uppercase text-stone-400 mb-5">
            In Verbindung bleiben
          </p>
          <div className="flex gap-4 mb-6 justify-center md:justify-start">
            <a
              href="https://www.instagram.com/quindicipizza/"
              target="_blank"
              rel="noopener noreferrer"
              className="w-9 h-9 flex items-center justify-center border border-stone-600 text-stone-400 hover:text-white hover:border-white transition-colors"
              aria-label="Instagram"
            >
              <Instagram className="w-4 h-4" />
            </a>
          </div>
          <div className="border-t border-stone-700 pt-6 space-y-1">
            <p className="font-semibold text-white text-sm">Quindici Trattoria Pizzeria</p>
            <p className="text-stone-400 text-sm italic">Einfach genießen</p>
            <p className="text-stone-400 text-sm pt-2 leading-relaxed">
              Bahnhofstraße 17<br />71638 Ludwigsburg
            </p>
          </div>
        </div>

        {/* CENTER */}
        <div className="flex flex-col items-center gap-6">
          <img src="/logo-footer.png" alt="Quindici Logo" className="h-32 w-auto" />
          <div className="space-y-3 text-center">
            <a
              href="tel:+4971414732887"
              className="flex items-center justify-center gap-2 text-stone-300 hover:text-white transition-colors text-sm"
            >
              <Phone className="w-4 h-4 text-amber-500 shrink-0" />
              07141 4732887
            </a>
            <button
              onClick={openReservation}
              className="flex items-center justify-center gap-2 text-stone-300 hover:text-white transition-colors text-sm w-full"
            >
              <CalendarCheck className="w-4 h-4 text-amber-500 shrink-0" />
              Tisch reservieren
            </button>
          </div>
        </div>

        {/* RIGHT */}
        <div className="text-center md:text-right">
          <nav className="flex flex-col gap-2.5 items-center md:items-end">
            <button
              onClick={openReservation}
              className="text-xs font-semibold tracking-[0.2em] uppercase text-stone-400 hover:text-white transition-colors"
            >
              Tisch reservieren
            </button>
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                {...(link.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                className="text-xs font-semibold tracking-[0.2em] uppercase text-stone-400 hover:text-white transition-colors"
              >
                {link.label}
              </a>
            ))}
          </nav>
        </div>

      </div>

      {/* Bottom bar */}
      <div className="relative z-10 border-t border-stone-800 py-3 px-6 flex items-center justify-between gap-4">
        <p className="text-xs text-stone-600 shrink-0">
          © {new Date().getFullYear()} Quindici Trattoria Pizzeria · Alle Rechte vorbehalten
        </p>
        <DesignCredit />
      </div>
    </footer>
  );
}
