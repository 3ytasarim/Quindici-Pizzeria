import { motion } from "framer-motion";
import { CalendarCheck, ShoppingBag } from "lucide-react";
import { useReservationModal } from "@/components/ReservationModal";

export default function StickyActions() {
  const { open: openReservation } = useReservationModal();
  return (
    <div className="flex fixed right-0 top-1/2 -translate-y-1/2 z-40 flex-col gap-2">

      {/* Tisch reservieren */}
      <button onClick={openReservation} className="block bg-transparent border-0 p-0">
        <motion.div
          initial={{ x: 160 }}
          animate={{ x: 0 }}
          transition={{ duration: 0.6, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          whileHover={{ x: -6, scale: 1.03 }}
          className="flex items-center gap-2 cursor-pointer shadow-xl"
          style={{
            backgroundColor: "#c5a485",
            borderRadius: "10px 0 0 10px",
            paddingTop: "12px",
            paddingBottom: "12px",
            paddingLeft: "10px",
            paddingRight: "8px",
            boxShadow: "0 6px 24px rgba(197,164,133,0.45)",
          }}
        >
          <motion.div
            animate={{ scale: [1, 1.15, 1] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            className="shrink-0 text-white"
          >
            <CalendarCheck className="w-4 h-4" />
          </motion.div>
          {/* Text — hidden on very small screens */}
          <span
            className="hidden sm:block text-[10px] font-bold tracking-[0.2em] uppercase text-white whitespace-nowrap select-none"
            style={{ writingMode: "vertical-rl", textOrientation: "mixed", transform: "rotate(180deg)" }}
          >
            Tisch reservieren
          </span>
        </motion.div>
      </button>

      {/* Jetzt bestellen */}
      <a href="https://www.lieferando.de/speisekarte/quindici-pizza#kategorie_b4ba0961-8497-4427-8381-2610b9040620" target="_blank" rel="noopener noreferrer">
        <motion.div
          initial={{ x: 160 }}
          animate={{ x: 0 }}
          transition={{ duration: 0.6, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
          whileHover={{ x: -6, scale: 1.03 }}
          className="flex items-center gap-2 cursor-pointer"
          style={{
            backgroundColor: "#1c1c1c",
            borderRadius: "10px 0 0 10px",
            paddingTop: "12px",
            paddingBottom: "12px",
            paddingLeft: "10px",
            paddingRight: "8px",
            boxShadow: "0 6px 24px rgba(0,0,0,0.4)",
          }}
        >
          <motion.div
            animate={{ y: [0, -3, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="shrink-0 text-white"
          >
            <ShoppingBag className="w-4 h-4" />
          </motion.div>
          <span
            className="hidden sm:block text-[10px] font-bold tracking-[0.2em] uppercase text-white whitespace-nowrap select-none"
            style={{ writingMode: "vertical-rl", textOrientation: "mixed", transform: "rotate(180deg)" }}
          >
            Jetzt bestellen
          </span>
        </motion.div>
      </a>

    </div>
  );
}
