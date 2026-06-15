import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import MenuCard from "@/components/MenuCard";

const hours = [
  { day: "Mo – Fr",  time: "12:00 – 23:00 Uhr" },
  { day: "Sa",       time: "17:00 – 23:00 Uhr" },
  { day: "So",       time: "Ruhetag" },
];

export default function InfoSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  const fadeUp = (delay = 0) => ({
    initial: { opacity: 0, y: 24 },
    animate: inView ? { opacity: 1, y: 0 } : {},
    transition: { duration: 0.7, delay, ease: "easeOut" },
  });

  return (
    <section ref={ref} className="bg-[#fdf8f2] py-20 px-6">
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8 items-stretch">

        {/* LEFT — Interactive menu card */}
        <motion.div
          {...fadeUp(0.1)}
          className="min-h-[480px] flex flex-col"
        >
          <MenuCard />
        </motion.div>

        {/* RIGHT — two stacked boxes */}
        <div className="flex flex-col gap-6">

          {/* Öffnungszeiten */}
          <motion.div
            {...fadeUp(0.25)}
            className="border border-amber-100 bg-white/60 backdrop-blur-sm p-7 shadow-sm flex-1"
          >
            <div className="flex items-center justify-center gap-2 mb-5">
              <Clock className="w-4 h-4 text-amber-700 shrink-0" />
              <h4 className="font-serif text-xl text-stone-800 tracking-wide">
                Öffnungszeiten
              </h4>
            </div>
            <ul className="space-y-2.5">
              {hours.map(({ day, time }) => (
                <li key={day} className="flex items-baseline justify-between gap-4 text-sm">
                  <span className="text-stone-700 font-medium w-28 shrink-0">{day}</span>
                  <span className="text-stone-500 text-right">{time}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Hier findet ihr uns */}
          <motion.div
            {...fadeUp(0.4)}
            className="border border-amber-100 bg-white/60 backdrop-blur-sm p-7 shadow-sm"
          >
            <h4 className="font-serif text-xl text-stone-800 tracking-wide mb-5 text-center">
              Hier findet ihr uns
            </h4>
            <ul className="space-y-3.5 text-sm text-stone-600 flex flex-col items-center">
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-amber-700 mt-0.5 shrink-0" />
                <span className="text-center">
                  Bahnhofstraße 17<br />
                  71638 Ludwigsburg
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-amber-700 shrink-0" />
                <a href="tel:+4971414732887" className="hover:text-amber-700 transition-colors">
                  07141 4732887
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-amber-700 shrink-0" />
                <a href="mailto:info@trattoria-pizzeria.de" className="hover:text-amber-700 transition-colors">
                  info@trattoria-pizzeria.de
                </a>
              </li>
            </ul>
            <div className="flex justify-center mt-6">
              <a
                href="#"
                className="inline-flex items-center gap-2 bg-amber-700 text-white text-sm font-medium px-5 py-2.5 hover:bg-amber-800 transition-colors duration-200"
              >
                Tisch reservieren
              </a>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
