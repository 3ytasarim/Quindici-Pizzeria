import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";

type MenuItem = { name: string; desc?: string; price: string };
type Category = { label: string; items: MenuItem[] };

const categories: Category[] = [
  {
    label: "Antipasti",
    items: [
      { name: "Parmigiana di Melanzane", desc: "Überbackene Auberginen mit Tomatensauce und Mozzarella", price: "14,50 €" },
      { name: "Polpo alla Griglia", desc: "Zart gegrillter Oktopus auf cremigem Kartoffelpüree", price: "21,50 €" },
      { name: "Insalata di Mare", desc: "Frischer Meeresfrüchtesalat mit Zitronen-Olivenöl-Vinaigrette", price: "20,90 €" },
      { name: "Carpaccio di Manzo", desc: "Hauchdünn geschnittenes Rindfleisch mit Parmesan und Rucola", price: "17,90 €" },
      { name: "Vitello Tonnato", desc: "Kalbfleisch mit Thunfischsauce, Kapern und Sardellen", price: "15,90 €" },
      { name: "Polpette della Casa", desc: "Hausgemachte Fleischbällchen in Tomatensauce mit Parmesan", price: "13,90 €" },
      { name: "Antipasto Quindici", desc: "Vorspeisenteller nach Art des Hauses", price: "24,90 €" },
      { name: "Frittatine Napoletane", desc: "Zwei frittierte Pasta-Häppchen (Cacio e pepe und Carbonara)", price: "13,50 €" },
    ],
  },
  {
    label: "Insalate",
    items: [
      { name: "Insalata Mista", desc: "Gemischter Salat mit italienischem Dressing", price: "10,50 €" },
      { name: "Insalata di Pomodori", desc: "Frischer Tomatensalat mit Zwiebeln und Basilikum", price: "10,90 €" },
      { name: "Insalata Caprese", desc: "Büffelmozzarella mit Tomaten, Basilikum und Olivenöl", price: "15,90 €" },
      { name: "Insalata Mediterranea", desc: "Mediterraner Salat mit Gemüse, Oliven, Artischocken und Feta", price: "15,90 €" },
      { name: "Insalata Tonno", desc: "Gemischter Salat mit Thunfisch, Tomaten und Zwiebeln", price: "14,90 €" },
      { name: "Insalata con Pollo", desc: "Gemischter Salat mit Hähnchenbruststreifen", price: "16,90 €" },
    ],
  },
  {
    label: "Pasta",
    items: [
      { name: "Strozzapreti al Ragù di Salsiccia", desc: "Mit Salsiccia-Ragout, Weißwein und Rosmarin", price: "18,90 €" },
      { name: "Pappardelle al Salmone", desc: "Mit frischem Lachs in cremiger Tomaten-Sahne-Sauce", price: "19,90 €" },
      { name: "Spaghetti alla Carbonara", desc: "Klassisch mit Guanciale, Ei und Pecorino Romano", price: "16,90 €" },
      { name: "Pasta Patate e Provola", desc: "Neapolitanisch: Pasta mit Kartoffeln, Provola und Rosmarin", price: "16,90 €" },
      { name: "Paccheri ai Frutti di Mare", desc: "Mit Garnelen, Miesmuscheln, Venusmuscheln und Calamari", price: "21,90 €" },
      { name: "Ravioli al Tartufo", desc: "Ricotta-Spinat-Ravioli in Trüffel-Parmesan-Buttersoße", price: "21,90 €" },
    ],
  },
  {
    label: "Carne",
    items: [
      { name: "Saltimbocca alla Romana", desc: "Kalbsschnitzel mit Parmaschinken und Salbei, dazu Nudeln", price: "29,90 €" },
      { name: "Piccata alla Milanese", desc: "Parmesan-Kalbsschnitzel nach Mailänder Art, dazu Nudeln", price: "29,90 €" },
      { name: "Tagliata di Manzo", desc: "Gegrilltes Rindersteak mit Rucola, Parmesan und Balsamico", price: "33,90 €" },
    ],
  },
  {
    label: "Pesce",
    items: [
      { name: "Filetti di Orata alla Griglia", desc: "Gegrilltes Doradenfilet mit Tagesgemüse", price: "27,90 €" },
      { name: "Calamaretti Fritti con Insalatina", desc: "Frittierte Baby-Calamari mit buntem Salat", price: "26,90 €" },
    ],
  },
  {
    label: "Pizza",
    items: [
      { name: "Margherita", desc: "Tomatensauce und Mozzarella", price: "12,50 €" },
      { name: "Bufalina", desc: "Tomatensauce und Büffelmozzarella", price: "16,00 €" },
      { name: "Capodimonte", desc: "Tomatensauce, Mozzarella, Parmaschinken, Rucola und Parmesan", price: "18,50 €" },
      { name: "Quindici", desc: "Tomatensauce, Mozzarella und Hackfleischbällchen", price: "16,00 €" },
      { name: "Pendino", desc: "Tomatensauce, Sardellen, Oliven, Knoblauch und Oregano", price: "12,50 €" },
      { name: "Prosciutto e Funghi", desc: "Tomatensauce, Mozzarella, Kochschinken und Champignons", price: "16,50 €" },
      { name: "Diavola", desc: "Tomatensauce, Mozzarella und scharfe Salami", price: "15,50 €" },
      { name: "Gustosa", desc: "Tomatensauce, Mozzarella, Gorgonzola und scharfe Salami", price: "16,50 €" },
      { name: "Tonno e Cipolle", desc: "Tomatensauce, Mozzarella, Thunfisch und rote Zwiebeln", price: "16,50 €" },
      { name: "Calzone", desc: "Gefüllt mit Tomatensauce, Mozzarella, Schinken und Salami", price: "16,50 €" },
    ],
  },
  {
    label: "Pizza Bianca",
    items: [
      { name: "Poggioreale", desc: "Mozzarella, Salsiccia und neapolitanischer Brokkoli", price: "17,00 €" },
      { name: "Secondigliano", desc: "Mozzarella, Mortadella, Pistaziencreme und Burrata (125 g)", price: "21,50 €" },
      { name: "Materdei", desc: "Mozzarella, Parmesan, Gorgonzola und Pecorino", price: "16,00 €" },
      { name: "Posillipo", desc: "Mozzarella, Kirschtomaten, Parmesan und Rucola", price: "16,50 €" },
    ],
  },
  {
    label: "Dolci",
    items: [
      { name: "Tiramisù Classico", desc: "Cremig, mit Mascarpone und in Espresso getränkt", price: "9,50 €" },
      { name: "Panna Cotta", desc: "Mit feiner Mango-Waldfrüchte-Sauce", price: "8,90 €" },
      { name: "Bomboloni Pistacchio e Nutella", desc: "Zwei italienische Krapfen gefüllt", price: "8,90 €" },
      { name: "Pizza Nutella", desc: "Hausgemachte Dessertpizza mit Nutella-Creme", price: "11,50 €" },
      { name: "Illy Crema Caffè (groß)", desc: "Cremiger Eiskaffee von illy", price: "4,90 €" },
      { name: "Illy Crema Caffè (klein)", desc: "Cremiger Eiskaffee von illy", price: "2,50 €" },
    ],
  },
  {
    label: "Getränke",
    items: [
      { name: "Aperol Spritz", price: "7,50 €" },
      { name: "Hugo", price: "7,50 €" },
      { name: "Quindici Spritz", desc: "Bitter Lemon, Limoncello und Zitronenscheibe", price: "7,50 €" },
      { name: "Quindici Bier vom Fass 0,4 l", price: "5,20 €" },
      { name: "Moretti (Flasche) 0,33 l", price: "3,90 €" },
      { name: "Weizenbier hell vom Fass 0,5 l", price: "5,70 €" },
      { name: "Espresso illy", price: "2,50 €" },
      { name: "Cappuccino", price: "3,50 €" },
      { name: "Latte macchiato", price: "3,90 €" },
      { name: "Caffè Quindici", desc: "Doppelter illy Espresso, Milch und Kakaostaub", price: "4,80 €" },
    ],
  },
];

const variants = {
  enter: (dir: number) => ({ x: dir > 0 ? 60 : -60, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -60 : 60, opacity: 0 }),
};

export default function MenuCard() {
  const [page, setPage] = useState(0);
  const [dir, setDir] = useState(1);
  const tabsRef = useRef<HTMLDivElement>(null);

  const go = (d: number) => {
    setDir(d);
    setPage((p) => (p + categories.length + d) % categories.length);
  };

  const goTo = (i: number) => {
    setDir(i > page ? 1 : -1);
    setPage(i);
    // scroll tab into view
    const el = tabsRef.current?.children[i] as HTMLElement;
    el?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  };

  const cat = categories[page];

  return (
    <div className="flex flex-col h-full border border-amber-100 bg-white/60 backdrop-blur-sm shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-5 pt-5 pb-3 border-b border-amber-100">
        <p className="text-xs font-semibold tracking-[0.2em] uppercase text-amber-700 mb-1">
          Speisekarte
        </p>
        <div className="flex items-center justify-between">
          <h3 className="font-serif text-xl text-stone-800">{cat.label}</h3>
          <div className="flex gap-1">
            <button
              onClick={() => go(-1)}
              className="w-7 h-7 flex items-center justify-center text-stone-400 hover:text-amber-700 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => go(1)}
              className="w-7 h-7 flex items-center justify-center text-stone-400 hover:text-amber-700 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Category tabs */}
        <div
          ref={tabsRef}
          className="flex gap-1.5 mt-3 overflow-x-auto scrollbar-none pb-0.5"
          style={{ scrollbarWidth: "none" }}
        >
          {categories.map((c, i) => (
            <button
              key={c.label}
              onClick={() => goTo(i)}
              className={`shrink-0 text-xs px-2.5 py-1 transition-all duration-200 ${
                i === page
                  ? "bg-amber-700 text-white"
                  : "bg-amber-50 text-stone-500 hover:bg-amber-100"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Items list — animated */}
      <div className="relative flex-1 overflow-hidden">
        <AnimatePresence custom={dir} mode="wait">
          <motion.ul
            key={page}
            custom={dir}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.28, ease: "easeInOut" }}
            className="absolute inset-0 overflow-y-auto px-5 py-3 space-y-2.5"
            style={{ scrollbarWidth: "thin" }}
          >
            {cat.items.map((item) => (
              <li
                key={item.name}
                className="flex items-start justify-between gap-3 border-b border-stone-100 pb-2 last:border-0"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-stone-800 leading-tight">{item.name}</p>
                  {item.desc && (
                    <p className="text-xs text-stone-400 mt-0.5 leading-snug line-clamp-2">{item.desc}</p>
                  )}
                </div>
                <span className="shrink-0 text-sm font-semibold text-amber-700 whitespace-nowrap">
                  {item.price}
                </span>
              </li>
            ))}
          </motion.ul>
        </AnimatePresence>
      </div>

      {/* Footer */}
      <div className="px-5 py-3 border-t border-amber-100 flex items-center justify-between">
        <span className="text-xs text-stone-400">
          {page + 1} / {categories.length}
        </span>
        <a
          href="#"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-700 hover:text-amber-800 transition-colors"
        >
          Vollständige Speisekarte
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
}
