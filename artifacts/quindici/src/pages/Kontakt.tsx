import { motion } from "framer-motion";
import { MapPin, Phone, Clock, Car, Train, Bus, Mail } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useReservationModal } from "@/components/ReservationModal";

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

const hours = [
  { day: "Montag", time: "12:00 – 23:00" },
  { day: "Dienstag", time: "12:00 – 23:00" },
  { day: "Mittwoch", time: "12:00 – 23:00" },
  { day: "Donnerstag", time: "12:00 – 23:00" },
  { day: "Freitag", time: "12:00 – 23:00" },
  { day: "Samstag", time: "17:00 – 23:00" },
  { day: "Sonntag", time: "Ruhetag", closed: true },
];

export default function Kontakt() {
  const { open: openReservation } = useReservationModal();
  return (
    <div className="min-h-screen" style={{ backgroundColor: "#fdf8f2" }}>
      <Navbar />

      {/* Hero */}
      <section className="relative min-h-[52vh] flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url(/speisekarte-bg.jpg)", opacity: 0.55 }}
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
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-6xl md:text-8xl font-bold text-stone-800 mb-6"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Kontakt & Anfahrt
          </motion.h1>
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="mx-auto h-px w-24 bg-amber-600 origin-center"
          />
        </div>
      </section>

      {/* Info Cards */}
      <section className="py-20 md:py-28">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Address */}
            <motion.div
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-60px" }}
              className="bg-white/70 border border-stone-200/60 p-8 flex flex-col gap-4"
            >
              <div className="w-10 h-10 flex items-center justify-center bg-amber-700/10">
                <MapPin className="w-5 h-5 text-amber-700" />
              </div>
              <div>
                <p className="text-amber-700 uppercase tracking-[0.2em] text-[10px] font-semibold mb-1">
                  Adresse
                </p>
                <h3
                  className="text-xl font-bold text-stone-800 mb-3"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  So findest Du uns
                </h3>
                <p className="text-stone-600 text-sm leading-relaxed">
                  Quindici Trattoria Pizzeria<br />
                  Bahnhofstraße 17<br />
                  71638 Ludwigsburg
                </p>
              </div>
              <a
                href="https://maps.google.com/?q=Bahnhofstraße+17,+71638+Ludwigsburg"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-auto inline-block text-xs font-semibold uppercase tracking-[0.18em] text-amber-700 border-b border-amber-700/40 pb-0.5 hover:border-amber-700 transition-colors w-fit"
              >
                In Google Maps öffnen →
              </a>
            </motion.div>

            {/* Phone & Contact */}
            <motion.div
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-60px" }}
              transition={{ delay: 0.08 }}
              className="bg-white/70 border border-stone-200/60 p-8 flex flex-col gap-4"
            >
              <div className="w-10 h-10 flex items-center justify-center bg-amber-700/10">
                <Phone className="w-5 h-5 text-amber-700" />
              </div>
              <div>
                <p className="text-amber-700 uppercase tracking-[0.2em] text-[10px] font-semibold mb-1">
                  Kontakt
                </p>
                <h3
                  className="text-xl font-bold text-stone-800 mb-3"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  Ruf uns an
                </h3>
                <div className="space-y-2 text-sm text-stone-600">
                  <p>
                    <span className="font-medium text-stone-700">Telefon:</span>{" "}
                    <a href="tel:+4971414732887" className="hover:text-amber-700 transition-colors">
                      07141 4732887
                    </a>
                  </p>
                  <p>
                    <span className="font-medium text-stone-700">E-Mail:</span>{" "}
                    <a
                      href="mailto:info@trattoria-quindici.de"
                      className="hover:text-amber-700 transition-colors"
                    >
                      info@trattoria-quindici.de
                    </a>
                  </p>
                </div>
              </div>
              <a
                href="tel:+4971414732887"
                className="mt-auto inline-block text-xs font-semibold uppercase tracking-[0.18em] text-amber-700 border-b border-amber-700/40 pb-0.5 hover:border-amber-700 transition-colors w-fit"
              >
                Jetzt anrufen →
              </a>
            </motion.div>

            {/* Reservation */}
            <motion.div
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-60px" }}
              transition={{ delay: 0.16 }}
              className="bg-amber-700 p-8 flex flex-col gap-4"
            >
              <div className="w-10 h-10 flex items-center justify-center bg-white/20">
                <Mail className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="uppercase tracking-[0.2em] text-[10px] font-semibold mb-1 text-amber-200">
                  Tischreservierung
                </p>
                <h3
                  className="text-xl font-bold text-white mb-3"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  Tisch reservieren
                </h3>
                <p className="text-amber-100 text-sm leading-relaxed">
                  Wir freuen uns auf Deinen Besuch. Reservierungen nehmen wir auch telefonisch oder per E-Mail entgegen.
                </p>
              </div>
              <button
                onClick={openReservation}
                className="mt-auto inline-block bg-white text-amber-700 text-xs font-bold uppercase tracking-[0.18em] px-5 py-3 text-center hover:bg-amber-50 transition-colors"
              >
                Jetzt reservieren
              </button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Opening Hours + Directions */}
      <section className="py-20 md:py-28 bg-stone-50/60">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-start">

            {/* Öffnungszeiten */}
            <motion.div
              variants={headingContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-60px" }}
            >
              <div style={{ overflow: "hidden" }}>
                <motion.h2
                  variants={titleReveal}
                  className="text-4xl md:text-5xl font-bold text-stone-800 mb-3"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  Öffnungszeiten
                </motion.h2>
              </div>
              <motion.div
                variants={rulerExpand}
                className="h-px w-16 bg-amber-600 mb-10"
                style={{ transformOrigin: "left" }}
              />

              <div className="divide-y divide-stone-200/80">
                {hours.map((row) => (
                  <div
                    key={row.day}
                    className="flex justify-between items-center py-4"
                  >
                    <span
                      className={`text-[15px] font-semibold ${row.closed ? "text-stone-400" : "text-stone-800"}`}
                      style={{ fontFamily: "'Playfair Display', serif" }}
                    >
                      {row.day}
                    </span>
                    <span
                      className={`text-[14px] font-medium ${row.closed ? "text-stone-400 italic" : "text-amber-700"}`}
                    >
                      {row.time}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-8 bg-amber-700/8 border border-amber-700/20 px-5 py-4">
                <div className="flex items-start gap-3">
                  <Clock className="w-4 h-4 text-amber-700 mt-0.5 shrink-0" />
                  <p className="text-stone-600 text-sm leading-relaxed">
                    Küchenschluss ist jeweils 30 Minuten vor Schließung. Für Gruppen ab 8 Personen bitten wir um Reservierung.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Anfahrt */}
            <motion.div
              variants={headingContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-60px" }}
            >
              <div style={{ overflow: "hidden" }}>
                <motion.h2
                  variants={titleReveal}
                  className="text-4xl md:text-5xl font-bold text-stone-800 mb-3"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  Anfahrt
                </motion.h2>
              </div>
              <motion.div
                variants={rulerExpand}
                className="h-px w-16 bg-amber-600 mb-10"
                style={{ transformOrigin: "left" }}
              />

              <div className="space-y-8">
                {/* Mit dem Auto */}
                <div className="flex gap-4">
                  <div className="w-10 h-10 flex items-center justify-center bg-amber-700/10 shrink-0 mt-0.5">
                    <Car className="w-5 h-5 text-amber-700" />
                  </div>
                  <div>
                    <h4
                      className="text-stone-800 font-bold text-[16px] mb-2"
                      style={{ fontFamily: "'Playfair Display', serif" }}
                    >
                      Mit dem Auto
                    </h4>
                    <p className="text-stone-500 text-sm leading-relaxed">
                      Über die A81 Ausfahrt Ludwigsburg-Mitte oder Ludwigsburg-Süd, dann Richtung Stadtmitte. Die Bahnhofstraße liegt zentrumsnah in direkter Nähe zum Hauptbahnhof.
                    </p>
                  </div>
                </div>

                {/* Parken */}
                <div className="flex gap-4">
                  <div className="w-10 h-10 flex items-center justify-center bg-amber-700/10 shrink-0 mt-0.5">
                    <MapPin className="w-5 h-5 text-amber-700" />
                  </div>
                  <div>
                    <h4
                      className="text-stone-800 font-bold text-[16px] mb-2"
                      style={{ fontFamily: "'Playfair Display', serif" }}
                    >
                      Parken
                    </h4>
                    <p className="text-stone-500 text-sm leading-relaxed">
                      <strong className="text-stone-700">Parkhaus Solitude</strong> – bequem und nah am Restaurant.<br />
                      Alternativ: Der <strong className="text-stone-700">Ludwigsburg Hauptbahnhof</strong> verfügt ebenfalls über Parkmöglichkeiten in unmittelbarer Nähe.
                    </p>
                  </div>
                </div>

                {/* Öffentliche Verkehrsmittel */}
                <div className="flex gap-4">
                  <div className="w-10 h-10 flex items-center justify-center bg-amber-700/10 shrink-0 mt-0.5">
                    <Train className="w-5 h-5 text-amber-700" />
                  </div>
                  <div>
                    <h4
                      className="text-stone-800 font-bold text-[16px] mb-2"
                      style={{ fontFamily: "'Playfair Display', serif" }}
                    >
                      Mit Bahn & Bus
                    </h4>
                    <p className="text-stone-500 text-sm leading-relaxed">
                      S-Bahn Linie S4 oder S5 bis Ludwigsburg Hauptbahnhof – die Bahnhofstraße 17 liegt direkt vor dem Bahnhof. Der Busbahnhof (ZOB) befindet sich ebenfalls in unmittelbarer Nähe und ist fußläufig in wenigen Minuten erreichbar.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Google Maps */}
      <section className="h-[480px] relative">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="h-full"
        >
          <iframe
            title="Quindici Trattoria Pizzeria – Karte"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2623.4129857490116!2d9.21233317630754!3d48.88846607133622!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x4799d1d90fc038f7%3A0x3a7178f9c5ebd87d!2sQUINDICI%20PIZZA!5e0!3m2!1sde!2sde!4v1781282359970!5m2!1sde!2sde"
            width="100%"
            height="100%"
            style={{ border: 0, filter: "sepia(20%) saturate(80%)" }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </motion.div>

        {/* Overlay card on map */}
        <div className="absolute top-8 left-1/2 -translate-x-1/2 z-10 bg-white/95 shadow-xl border border-stone-200/60 px-8 py-5 flex items-center gap-4 min-w-[280px]">
          <div className="w-10 h-10 flex items-center justify-center bg-amber-700/10 shrink-0">
            <MapPin className="w-5 h-5 text-amber-700" />
          </div>
          <div>
            <p className="text-stone-800 font-bold text-sm" style={{ fontFamily: "'Playfair Display', serif" }}>
              Quindici Trattoria Pizzeria
            </p>
            <p className="text-stone-500 text-xs mt-0.5">Bahnhofstraße 17, 71638 Ludwigsburg</p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
