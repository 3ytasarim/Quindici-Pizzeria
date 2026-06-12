import { motion } from "framer-motion";
import { CalendarCheck, UtensilsCrossed } from "lucide-react";

export default function StickyActions() {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
      className="fixed right-0 top-1/2 -translate-y-1/2 z-40 flex flex-col gap-px"
    >
      <button
        data-testid="sticky-tisch-reservieren"
        className="group flex items-center gap-3 bg-amber-700 hover:bg-amber-800 text-white pl-4 pr-5 py-3.5 transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-x-1"
        style={{ writingMode: "horizontal-tb" }}
      >
        <CalendarCheck className="w-4 h-4 shrink-0 opacity-80 group-hover:opacity-100 transition-opacity" />
        <span className="text-[11px] font-semibold tracking-widest uppercase whitespace-nowrap">
          Tisch reservieren
        </span>
      </button>

      <button
        data-testid="sticky-mittagstisch-ansehen"
        className="group flex items-center gap-3 bg-stone-800 hover:bg-stone-900 text-white pl-4 pr-5 py-3.5 transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-x-1"
        style={{ writingMode: "horizontal-tb" }}
      >
        <UtensilsCrossed className="w-4 h-4 shrink-0 opacity-80 group-hover:opacity-100 transition-opacity" />
        <span className="text-[11px] font-semibold tracking-widest uppercase whitespace-nowrap">
          Mittagstisch ansehen
        </span>
      </button>
    </motion.div>
  );
}
