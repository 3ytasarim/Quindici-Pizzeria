import { motion } from "framer-motion";
import { Link } from "wouter";
import { CalendarCheck, Utensils } from "lucide-react";

interface StickyTabProps {
  label: string;
  icon: React.ReactNode;
  bgClass: string;
  bgStyle?: React.CSSProperties;
  delay: number;
  paddingY: string;
}

function StickyTab({ label, icon, bgClass, bgStyle, delay, paddingY }: StickyTabProps) {
  return (
    <motion.button
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.4, 0, 0.2, 1] }}
      whileHover={{ x: -6 }}
      className={`flex items-center gap-2.5 ${paddingY} px-3.5 ${bgClass} text-white shadow-lg cursor-pointer`}
      style={{ borderRadius: 0, ...bgStyle }}
    >
      <span className="shrink-0">{icon}</span>
      <span
        className="text-[10px] font-bold tracking-[0.18em] uppercase whitespace-nowrap"
        style={{ writingMode: "vertical-rl", textOrientation: "mixed", transform: "rotate(180deg)" }}
      >
        {label}
      </span>
    </motion.button>
  );
}

export default function StickyActions() {
  return (
    <div className="fixed right-0 top-1/2 -translate-y-1/2 z-40 flex flex-col gap-px">
      <Link href="/tisch-reservieren">
        <StickyTab
          label="Tisch reservieren"
          icon={<CalendarCheck className="w-3.5 h-3.5" />}
          bgClass="hover:brightness-90"
          bgStyle={{ backgroundColor: "#c5a485" }}
          delay={0.3}
          paddingY="py-7"
        />
      </Link>
      <a href="https://quindici.lieferservice.3ytasarim.com/" target="_blank" rel="noopener noreferrer">
        <StickyTab
          label="Jetzt bestellen"
          icon={<Utensils className="w-3.5 h-3.5" />}
          bgClass="bg-stone-800 hover:bg-stone-900"
          delay={0.45}
          paddingY="py-4"
        />
      </a>
    </div>
  );
}
