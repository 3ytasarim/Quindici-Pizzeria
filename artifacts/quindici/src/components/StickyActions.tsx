import { motion } from "framer-motion";
import { Link } from "wouter";
import { CalendarCheck, ShoppingBag } from "lucide-react";

export default function StickyActions() {
  return (
    <div className="fixed right-0 top-1/2 -translate-y-1/2 z-40 flex flex-col gap-2">

      {/* Tisch reservieren */}
      <Link href="/tisch-reservieren">
        <motion.div
          initial={{ x: "110%" }}
          animate={{ x: 0 }}
          transition={{ duration: 0.6, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          whileHover={{ x: -8, scale: 1.03 }}
          className="group flex items-center gap-3 pl-4 pr-3 cursor-pointer shadow-xl"
          style={{
            backgroundColor: "#c5a485",
            borderRadius: "10px 0 0 10px",
            paddingTop: "18px",
            paddingBottom: "18px",
            boxShadow: "0 8px 30px rgba(197,164,133,0.45)",
          }}
        >
          <motion.div
            animate={{ scale: [1, 1.15, 1] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            className="shrink-0 text-white"
          >
            <CalendarCheck className="w-5 h-5" />
          </motion.div>
          <span
            className="text-[11px] font-bold tracking-[0.22em] uppercase text-white whitespace-nowrap select-none"
            style={{ writingMode: "vertical-rl", textOrientation: "mixed", transform: "rotate(180deg)" }}
          >
            Tisch reservieren
          </span>
        </motion.div>
      </Link>

      {/* Jetzt bestellen */}
      <a href="https://quindici.lieferservice.3ytasarim.com/" target="_blank" rel="noopener noreferrer">
        <motion.div
          initial={{ x: "110%" }}
          animate={{ x: 0 }}
          transition={{ duration: 0.6, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
          whileHover={{ x: -8, scale: 1.03 }}
          className="group flex items-center gap-3 pl-4 pr-3 cursor-pointer"
          style={{
            backgroundColor: "#1c1c1c",
            borderRadius: "10px 0 0 10px",
            paddingTop: "14px",
            paddingBottom: "14px",
            boxShadow: "0 8px 30px rgba(0,0,0,0.4)",
          }}
        >
          <motion.div
            animate={{ y: [0, -3, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="shrink-0 text-white"
          >
            <ShoppingBag className="w-5 h-5" />
          </motion.div>
          <span
            className="text-[11px] font-bold tracking-[0.22em] uppercase text-white whitespace-nowrap select-none"
            style={{ writingMode: "vertical-rl", textOrientation: "mixed", transform: "rotate(180deg)" }}
          >
            Jetzt bestellen
          </span>
        </motion.div>
      </a>

    </div>
  );
}
