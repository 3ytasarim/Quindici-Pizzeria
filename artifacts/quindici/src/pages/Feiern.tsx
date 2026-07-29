import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { FileText } from "lucide-react";

interface Event {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  pdfUrl: string;
  order: number;
}

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
};

export default function Feiern() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/events")
      .then((r) => r.json())
      .then((data) => setEvents(Array.isArray(data) ? data : []))
      .catch(() => setEvents([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#fdf8f2" }}>
      <Navbar />

      {/* ── Hero ── */}
      <section className="relative min-h-[52vh] flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url(/ueberuns-hero.jpg)", opacity: 0.55, backgroundPosition: "center 70%" }}
        />
        <div
          className="absolute inset-0 z-0 pointer-events-none"
          style={{
            background:
              "linear-gradient(to bottom, rgba(253,248,242,0.82) 0%, rgba(253,248,242,0.48) 50%, rgba(253,248,242,0.82) 100%)",
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
            Feiern im Quindici
          </motion.h1>
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="mx-auto h-px w-24 bg-amber-600 origin-center"
          />
        </div>
      </section>

      {/* ── Events Grid ── */}
      <section className="py-20 md:py-28">
        <div className="container mx-auto px-6">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-white animate-pulse rounded-sm overflow-hidden shadow-sm">
                  <div className="h-56 bg-stone-200" />
                  <div className="p-6 space-y-3">
                    <div className="h-5 bg-stone-200 rounded w-2/3" />
                    <div className="h-4 bg-stone-100 rounded w-full" />
                    <div className="h-4 bg-stone-100 rounded w-4/5" />
                  </div>
                </div>
              ))}
            </div>
          ) : events.length === 0 ? (
            <div className="text-center py-20 text-stone-400">
              <p className="text-lg">Demnächst verfügbar.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {events.map((event, i) => (
                <motion.div
                  key={event.id}
                  variants={fadeUp}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ delay: i * 0.08 }}
                  className="bg-white shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col"
                >
                  {/* Image */}
                  <div className="overflow-hidden h-56 bg-stone-100">
                    {event.imageUrl ? (
                      <img
                        src={event.imageUrl}
                        alt={event.title}
                        className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-stone-100">
                        <span className="text-stone-300 text-4xl">✦</span>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-6 flex flex-col flex-1">
                    <h3
                      className="text-xl font-bold text-stone-800 mb-3"
                      style={{ fontFamily: "'Playfair Display', serif" }}
                    >
                      {event.title}
                    </h3>
                    <p className="text-stone-500 text-sm leading-relaxed flex-1">
                      {event.description}
                    </p>

                    {event.pdfUrl && (
                      <a
                        href={event.pdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-5 inline-flex items-center gap-2 self-start px-5 py-2.5 text-xs font-semibold uppercase tracking-widest transition-colors border"
                        style={{ borderColor: "#c5a485", color: "#c5a485" }}
                        onMouseEnter={(e) => {
                          (e.currentTarget as HTMLElement).style.backgroundColor = "#c5a485";
                          (e.currentTarget as HTMLElement).style.color = "#fff";
                        }}
                        onMouseLeave={(e) => {
                          (e.currentTarget as HTMLElement).style.backgroundColor = "transparent";
                          (e.currentTarget as HTMLElement).style.color = "#c5a485";
                        }}
                      >
                        <FileText className="w-3.5 h-3.5" />
                        Mehr erfahren
                      </a>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
