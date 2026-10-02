import { createContext, useContext, useState, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Phone, Mail, CalendarCheck, X } from "lucide-react";

// Primäre Reservierung läuft über Resmio (verlinkt via Google-Maps-Reservierung).
const GOOGLE_MAPS_RESERVATION_URL =
  "https://www.google.com/maps/reserve/v/dine/c/MvG_OybRE0Y?source=pa&opi=89978449&hl=de";

interface ReservationModalContextType {
  open: () => void;
}

const ReservationModalContext = createContext<ReservationModalContextType>({ open: () => {} });

export function useReservationModal() {
  return useContext(ReservationModalContext);
}

export function ReservationModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <ReservationModalContext.Provider value={{ open: () => setIsOpen(true) }}>
      {children}

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-[200] bg-black/50 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
            />

            <motion.div
              className="fixed inset-0 z-[201] flex items-center justify-center px-4"
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 20 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
            >
              <div className="relative bg-[#fdf8f2] max-w-sm w-full shadow-2xl">
                <button
                  onClick={() => setIsOpen(false)}
                  className="absolute top-4 right-4 text-stone-400 hover:text-stone-700 transition-colors"
                  aria-label="Schließen"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="p-8 sm:p-10 text-center">
                  <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#c5a485] mb-3">
                    Reservierung
                  </p>
                  <h2
                    className="text-2xl sm:text-3xl font-bold text-stone-800 mb-6"
                    style={{ fontFamily: "'Playfair Display', serif" }}
                  >
                    Jetzt Tisch reservieren
                  </h2>

                  <div className="w-10 h-px bg-[#c5a485] mx-auto mb-6" />

                  <a
                    href={GOOGLE_MAPS_RESERVATION_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-3 w-full py-4 px-6 bg-[#c5a485] hover:bg-[#b8956f] text-white font-semibold text-lg transition-colors"
                  >
                    <CalendarCheck className="w-5 h-5" />
                    Jetzt reservieren
                  </a>

                  <p className="mt-3 text-xs text-stone-400">
                    Oder rufen Sie uns direkt an bzw. schreiben Sie uns eine E-Mail.
                  </p>

                  <a
                    href="tel:071414732887"
                    className="mt-4 inline-flex items-center justify-center gap-3 w-full py-4 px-6 border border-[#c5a485] hover:bg-[#c5a48510] text-[#c5a485] font-semibold text-base transition-colors"
                  >
                    <Phone className="w-5 h-5" />
                    07141 473 2887
                  </a>

                  <a
                    href="mailto:info@trattoria-quindici.de"
                    className="mt-3 inline-flex items-center justify-center gap-3 w-full py-4 px-6 border border-[#c5a485] hover:bg-[#c5a48510] text-[#c5a485] font-semibold text-base transition-colors"
                  >
                    <Mail className="w-5 h-5" />
                    info@trattoria-quindici.de
                  </a>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </ReservationModalContext.Provider>
  );
}
