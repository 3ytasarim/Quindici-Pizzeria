import { createContext, useContext, useState, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Pizza } from "lucide-react";

interface SommerpauseModalContextType {
  open: () => void;
}

const SommerpauseModalContext = createContext<SommerpauseModalContextType>({ open: () => {} });

export function useSommerpauseModal() {
  return useContext(SommerpauseModalContext);
}

export function SommerpauseModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <SommerpauseModalContext.Provider value={{ open: () => setIsOpen(true) }}>
      {children}

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm"
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
                  <div className="flex justify-center mb-4">
                    <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ backgroundColor: "#c5a48520" }}>
                      <Pizza className="w-7 h-7" style={{ color: "#c5a485" }} />
                    </div>
                  </div>

                  <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#c5a485] mb-3">
                    Lieferservice
                  </p>

                  <h2
                    className="text-2xl sm:text-3xl font-bold text-stone-800 mb-4"
                    style={{ fontFamily: "'Playfair Display', serif" }}
                  >
                    Unser Lieferservice macht eine Sommerpause
                  </h2>

                  <div className="w-10 h-px bg-[#c5a485] mx-auto mb-5" />

                  <p className="text-stone-600 text-sm leading-relaxed mb-2">
                    Unser Lieferservice befindet sich bis Ende August in den Betriebsferien.
                  </p>
                  <p className="text-stone-600 text-sm leading-relaxed">
                    Vielen Dank für Ihr Verständnis – wir sind ab September wieder für Sie da!
                  </p>

                  <button
                    onClick={() => setIsOpen(false)}
                    className="mt-7 w-full py-3 px-6 text-xs font-bold uppercase tracking-widest transition-colors"
                    style={{ backgroundColor: "#c5a485", color: "#fff" }}
                    onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#b8956f"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#c5a485"; }}
                  >
                    Verstanden
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </SommerpauseModalContext.Provider>
  );
}
