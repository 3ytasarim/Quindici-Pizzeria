import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

interface MenuItem {
  name: string;
  description?: string;
  price: string;
}

interface MenuCategory {
  id: string;
  title: string;
  subtitle?: string;
  image: string;
  items: MenuItem[];
}

const categories: MenuCategory[] = [
  {
    id: "antipasti",
    title: "Antipasti",
    subtitle: "Vorspeisen",
    image: "/dish-carpaccio-nobg.png",
    items: [
      { name: "Parmigiana di Melanzane", description: "Überbackene Auberginen mit Tomatensauce und Mozzarella", price: "14,50 €" },
      { name: "Polpo alla Griglia", description: "Zart gegrillter Oktopus auf cremigem Kartoffelpüree, verfeinert mit Olivenöl und Kräutern", price: "21,50 €" },
      { name: "Insalata di Mare", description: "Frischer Meeresfrüchtesalat mit Zitronen-Olivenöl-Vinaigrette", price: "20,90 €" },
      { name: "Carpaccio di Manzo", description: "Hauchdünn geschnittenes, rohes Fleisch (Rind) mariniert mit Olivenöl und Zitronensaft, dazu gehobelter Parmesan und Rucola", price: "17,90 €" },
      { name: "Vitello Tonnato", description: "Feine Scheiben Kalbfleisch mit cremiger Thunfischsauce, Kapern und Sardellen", price: "15,90 €" },
      { name: "Polpette della Casa", description: "Hausgemachte italienische Fleischbällchen (Rind) in fruchtiger Tomatensauce, serviert mit Parmesan", price: "13,90 €" },
      { name: "Antipasto Quindici", description: "Vorspeisenteller nach Art des Hauses", price: "24,90 €" },
      { name: "Frittatine Napoletane", description: "Zwei knusprig frittierte Pasta-Häppchen nach neapolitanischem Rezept (Cacio e pepe und Carbonara)", price: "13,50 €" },
    ],
  },
  {
    id: "insalate",
    title: "Insalate",
    subtitle: "Salate",
    image: "/dish-polpo-nobg.png",
    items: [
      { name: "Insalata Mista", description: "Gemischter Salat mit italienischem Dressing", price: "10,50 €" },
      { name: "Insalata di Pomodori", description: "Frischer Tomatensalat mit Zwiebeln und Basilikum", price: "10,90 €" },
      { name: "Insalata Caprese", description: "Büffelmozzarella mit Tomaten, Basilikum und Olivenöl", price: "15,90 €" },
      { name: "Insalata Mediterranea", description: "Bunter mediterraner Salat mit Gemüse, Oliven, Artischocken und Feta-Käse", price: "15,90 €" },
      { name: "Insalata Tonno", description: "Gemischter Salat mit Thunfisch, Tomaten und Zwiebeln", price: "14,90 €" },
      { name: "Insalata con Pollo", description: "Gemischter Salat mit Hähnchenbruststreifen", price: "16,90 €" },
    ],
  },
  {
    id: "pasta",
    title: "Pasta",
    subtitle: "Nudelgerichte",
    image: "/dish-pasta-carbonara-nobg.png",
    items: [
      { name: "Strozzapreti al Ragù di Salsiccia e Vino Bianco", description: "Strozzapreti mit Salsiccia-Ragout, Weißwein und Rosmarin", price: "18,90 €" },
      { name: "Pappardelle al Salmone", description: "Pappardelle mit frischem Lachs in cremiger Tomaten-Sahne-Sauce", price: "19,90 €" },
      { name: "Spaghetti alla Carbonara", description: "Klassische Carbonara mit Guanciale, Ei und Pecorino Romano (ohne Sahne)", price: "16,90 €" },
      { name: "Pasta Patate e Provola", description: "Neapolitanische Spezialität: Pasta mit Kartoffeln, Provola-Käse und Rosmarin", price: "16,90 €" },
      { name: "Paccheri ai Frutti di Mare", description: "Paccheri mit Garnelen, Miesmuscheln, Venusmuscheln und Calamari in Tomaten-Weißwein-Sauce", price: "21,90 €" },
      { name: "Ravioli al Tartufo in Crema di Parmigiano", description: "Frisch gefüllte Ravioli mit Ricotta und Spinat, serviert in einer cremigen Trüffel-Parmesan-Buttersoße", price: "21,90 €" },
    ],
  },
  {
    id: "carne",
    title: "Carne",
    subtitle: "Fleischgerichte",
    image: "/about-restaurant-nobg.png",
    items: [
      { name: "Saltimbocca alla Romana", description: "Zartes Kalbsschnitzel in Weißwein mit Parmaschinken und Salbei serviert, dazu Nudeln", price: "29,90 €" },
      { name: "Piccata alla Milanese", description: "Parmesan-Kalbsschnitzel nach Mailänder Art serviert, dazu Nudeln", price: "29,90 €" },
      { name: "Tagliata di Manzo", description: "Gegrilltes Steak vom Rind, in Scheiben geschnitten, serviert mit Rucola, Parmesan und Balsamico-Reduktion, dazu Rosmarinkartoffeln", price: "33,90 €" },
    ],
  },
  {
    id: "pesce",
    title: "Pesce",
    subtitle: "Fischgerichte",
    image: "/dish-polpo-nobg.png",
    items: [
      { name: "Filetti di Orata alla Griglia", description: "Gegrilltes Doradenfilets, serviert mit Tagesgemüse", price: "27,90 €" },
      { name: "Calamaretti Fritti con Insalatina", description: "Frittierte Baby-Calamari, serviert mit buntem Salat", price: "26,90 €" },
    ],
  },
  {
    id: "pizza",
    title: "Pizza",
    subtitle: "Con Pomodori San Marzano",
    image: "/dish-pizza-margherita-nobg.png",
    items: [
      { name: "Margherita", description: "Tomatensauce und Mozzarella", price: "12,50 €" },
      { name: "Bufalina", description: "Tomatensauce und Büffelmozzarella", price: "16,00 €" },
      { name: "Capodimonte", description: "Tomatensauce, Mozzarella, Parmaschinken, Rucola und Parmesan", price: "18,50 €" },
      { name: "Quindici", description: "Tomatensauce, Mozzarella und Hackfleischbällchen", price: "16,00 €" },
      { name: "Pendino", description: "Tomatensauce, Sardellen, Oliven, Knoblauch und Oregano", price: "12,50 €" },
      { name: "Prosciutto e Funghi", description: "Tomatensauce, Mozzarella, Kochschinken und Champignons", price: "16,50 €" },
      { name: "Prosciutto", description: "Tomatensauce, Mozzarella und Kochschinken", price: "15,50 €" },
      { name: "Salame", description: "Tomatensauce, Mozzarella und Salami", price: "15,50 €" },
      { name: "Capricciosa", description: "Tomatensauce, Mozzarella, Champignons, Artischocken und Kochschinken", price: "17,50 €" },
      { name: "Ortolana", description: "Tomatensauce, Mozzarella und Tagesgemüse", price: "17,00 €" },
      { name: "Diavola", description: "Tomatensauce, Mozzarella und scharfe Salami", price: "15,50 €" },
      { name: "Gustosa", description: "Tomatensauce, Mozzarella, Gorgonzola und scharfe Salami", price: "16,50 €" },
      { name: "Tonno e Cipolle", description: "Tomatensauce, Mozzarella, Thunfisch und rote Zwiebeln", price: "16,50 €" },
      { name: "Calzone", description: "Gefüllte Pizzatasche, Tomatensauce, Mozzarella, Kochschinken und Salami", price: "16,50 €" },
    ],
  },
  {
    id: "pizza-bianca",
    title: "Pizza Bianca",
    subtitle: "Ohne Tomatensauce",
    image: "/dish-pizza-diavola-nobg.png",
    items: [
      { name: "Poggioreale", description: "Mozzarella, Salsiccia und neapolitanischer Brokkoli", price: "17,00 €" },
      { name: "Secondigliano", description: "Mozzarella, Mortadella, Pistaziencreme und Burrata (125 g)", price: "21,50 €" },
      { name: "Materdei", description: "Mozzarella, Parmesan, Gorgonzola und Pecorino", price: "16,00 €" },
      { name: "Posillipo", description: "Mozzarella, Kirschtomaten, Parmesan und Rucola", price: "16,50 €" },
    ],
  },
  {
    id: "dolci",
    title: "Dolci",
    subtitle: "Desserts",
    image: "/dish-tiramisu-nobg.png",
    items: [
      { name: "Tiramisù Classico", description: "Das italienische Dessert — cremig, mit Mascarpone und in Espresso getränkt", price: "9,50 €" },
      { name: "Panna Cotta", description: "Zarte Panna Cotta, vollendet mit einer feinen Mango-Waldfrüchte-Sauce", price: "8,90 €" },
      { name: "Bomboloni Pistacchio e Nutella (2 Stück)", description: "Italienische Krapfen, gefüllt mit Pistaziencreme und Nutella", price: "8,90 €" },
      { name: "Illy Crema Caffé (Groß)", description: "Cremiger Eiskaffee von illy", price: "4,90 €" },
      { name: "Illy Crema Caffé (Klein)", description: "Cremiger Eiskaffee von illy", price: "2,50 €" },
      { name: "Pizza Nutella", description: "Hausgemachte Dessertpizza mit feiner Nutella-Creme", price: "11,50 €" },
    ],
  },
];

const drinks = [
  {
    title: "Birra",
    subtitle: "Bier",
    items: [
      { name: "Quindici Bier vom Fass 0,4 l", price: "5,20 €" },
      { name: "Moretti (Flasche) 0,33 l", price: "3,90 €" },
      { name: "Weizenbier hell vom Fass 0,5 l", price: "5,70 €" },
      { name: "Brauhaus Radler 0,5 l", price: "5,20 €" },
      { name: "Weizenbier alkoholfrei 0,5 l", price: "5,20 €" },
      { name: "Alkoholfreies Bier (Flasche) 0,33 l", price: "3,90 €" },
    ],
  },
  {
    title: "Aperitivi",
    subtitle: "Aperitifs",
    items: [
      { name: "Aperol Spritz", description: "Aperol, Prosecco, Soda, Orange / 0,2 l", price: "7,50 €" },
      { name: "Hugo", description: "Holunderblütensirup, Prosecco, Minze, Limette, Soda / 0,2 l", price: "7,50 €" },
      { name: "Campari Amalfi", description: "Bitter Lemon, Campari, Soda und Limette / 0,2 l", price: "7,50 €" },
      { name: "Wild Berry Lillet", description: "Wild Berry, Lillet und Beeren / 0,2 l", price: "7,50 €" },
      { name: "Quindici Spritz", description: "Bitter Lemon, Limoncello und getrocknete Zitronenscheibe / 0,2 l", price: "7,50 €" },
      { name: "Sarti Lemon", description: "Bitter Lemon, Sarti und Limette / 0,2 l", price: "7,50 €" },
      { name: "Offener Prosecco Scavi & Ray D.O.C 0,1 l", price: "4,90 €" },
    ],
  },
  {
    title: "Acqua & Analcolici",
    subtitle: "Wasser & Alkoholfrei",
    items: [
      { name: "Acqua minerale naturale (still) 0,25 l / 0,75 l", price: "2,90 € / 5,90 €" },
      { name: "Acqua minerale frizzante (mit Kohlensäure) 0,25 l / 0,75 l", price: "2,90 € / 5,90 €" },
      { name: "Coca-Cola / Coca-Cola Zero 0,33 l", price: "3,90 €" },
      { name: "Kirschschorle / Maracujaschorle / Apfelschorle 0,33 l", price: "3,90 €" },
      { name: "Spezi / Spezi Zero 0,33 l", price: "3,90 €" },
      { name: "Limette-Zitrone / Granini 0,33 l", price: "4,20 €" },
      { name: "Pink Grapefruit-Cranberry / Granini 0,33 l", price: "4,20 €" },
      { name: "B. Lemon / Wild Berry / Tonic Water / Goldberg 0,2 l", price: "3,70 €" },
      { name: "Mineralwasser mit Kohlensäure 0,4 l", price: "3,50 €" },
    ],
  },
  {
    title: "Warme Getränke",
    subtitle: "Heiße Getränke",
    items: [
      { name: "Espresso illy", description: "Klassischer Espresso aus illy Bohnen", price: "2,50 €" },
      { name: "Doppelter Espresso illy", description: "Zwei Shots illy Espresso für extra Intensität", price: "4,20 €" },
      { name: "Espresso macchiato", description: "Illy Espresso mit einem kleinen Klecks Milchschaum", price: "2,80 €" },
      { name: "Caffè crema", description: "Schwarz gebrühter illy Kaffee in der großen Tasse", price: "3,20 €" },
      { name: "Cappuccino", description: "illy Espresso mit cremig aufgeschäumter Milch und feinem Milchschaum", price: "3,50 €" },
      { name: "Latte macchiato", description: "Heißer Milchschaum im Glas, gefleckt mit einem Shot illy Espresso", price: "3,90 €" },
      { name: "Heiße Schokolade", description: "Cremige Trinkschokolade, auf Wunsch mit Milchschaumhaube", price: "3,80 €" },
      { name: "Tee-Auswahl", description: "Verschiedene hochwertige Schwarz-, Grün- und Früchtetees", price: "3,80 €" },
    ],
  },
  {
    title: "Specials Quindici & illy",
    subtitle: "Hauskreationen",
    items: [
      { name: "Cappuccino cannella", description: "illy Cappuccino mit Zimtsirup und einer Prise Zimt auf dem Milchschaum", price: "4,20 €" },
      { name: "Latte macchiato caramello", description: "Latte macchiato mit feinem Karamellsirup leicht gesüßt", price: "4,20 €" },
      { name: "Caffè Quindici", description: "Doppelter illy Espresso mit einem Hauch braunem Zucker, wenig heißer Milch und Kakaostaub – kräftig, leicht süß, typisch italienisch", price: "4,80 €" },
    ],
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

export default function Speisekarte() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: "#fdf8f2" }}>
      <Navbar />

      {/* Page Hero */}
      <section className="relative min-h-[52vh] flex items-center justify-center overflow-hidden">
        {/* Background image — same as homepage */}
        <div
          className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url(/hero-bg.jpg)", opacity: 0.55 }}
        />
        {/* Cream overlay */}
        <div
          className="absolute inset-0 z-0 pointer-events-none"
          style={{
            background: "linear-gradient(to bottom, rgba(253,248,242,0.78) 0%, rgba(253,248,242,0.52) 50%, rgba(253,248,242,0.78) 100%)",
          }}
        />
        <div className="relative z-10 text-center px-6">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-amber-700 uppercase tracking-[0.3em] text-xs font-semibold mb-4"
          >
            Quindici Trattoria Pizzeria
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-6xl md:text-8xl font-bold text-stone-800 mb-6"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Speisekarte
          </motion.h1>
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="mx-auto h-px w-24 bg-amber-600 origin-center"
          />
        </div>
      </section>

      {/* Food Categories — alternating layout */}
      {categories.map((cat, idx) => {
        const isEven = idx % 2 === 0;
        return (
          <section
            key={cat.id}
            id={cat.id}
            className={`py-16 md:py-24 ${isEven ? "" : "bg-stone-50/60"}`}
          >
            <div className="container mx-auto px-6">
              <div className={`flex flex-col ${isEven ? "md:flex-row" : "md:flex-row-reverse"} gap-12 lg:gap-20 items-start`}>

                {/* Image side */}
                <motion.div
                  variants={fadeUp}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: "-80px" }}
                  className="w-full md:w-2/5 shrink-0 flex items-center justify-center"
                >
                  <div style={{ width: "100%", maxWidth: "400px", aspectRatio: "1 / 1" }}>
                    <img
                      src={cat.image}
                      alt={cat.title}
                      className="drop-shadow-2xl"
                      style={{ width: "100%", height: "100%", objectFit: "contain" }}
                    />
                  </div>
                </motion.div>

                {/* Content side */}
                <motion.div
                  variants={fadeUp}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: "-80px" }}
                  className="flex-1 min-w-0"
                >
                  {/* Category header */}
                  <div className="mb-8">
                    <p className="text-amber-700 uppercase tracking-[0.25em] text-xs font-semibold mb-2">
                      {cat.subtitle}
                    </p>
                    <h2
                      className="text-4xl md:text-5xl font-bold text-stone-800 mb-3"
                      style={{ fontFamily: "'Playfair Display', serif" }}
                    >
                      {cat.title}
                    </h2>
                    <div className="h-px w-16 bg-amber-600" />
                  </div>

                  {/* Items */}
                  <div className="space-y-0 divide-y divide-stone-200/70">
                    {cat.items.map((item) => (
                      <div key={item.name} className="py-4 flex justify-between items-start gap-4">
                        <div className="flex-1 min-w-0">
                          <p
                            className="text-stone-800 font-semibold text-[15px] leading-snug mb-0.5"
                            style={{ fontFamily: "'Playfair Display', serif" }}
                          >
                            {item.name}
                          </p>
                          {item.description && (
                            <p className="text-stone-500 text-[13px] leading-relaxed">
                              {item.description}
                            </p>
                          )}
                        </div>
                        <span className="shrink-0 text-amber-700 font-semibold text-[15px] whitespace-nowrap">
                          {item.price}
                        </span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </div>
            </div>
          </section>
        );
      })}

      {/* Getränke — full-width grid section */}
      <section id="getraenke" className="py-20 md:py-28">
        <div className="container mx-auto px-6">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <p className="text-amber-700 uppercase tracking-[0.3em] text-xs font-semibold mb-3">
              Getränke
            </p>
            <h2
              className="text-4xl md:text-5xl font-bold text-stone-800 mb-4"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Getränke
            </h2>
            <div className="mx-auto h-px w-16 bg-amber-600" />
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {drinks.map((group, gi) => (
              <motion.div
                key={group.title}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-60px" }}
                transition={{ delay: gi * 0.07 }}
                className="bg-white/70 border border-stone-200/60 p-6"
              >
                <p className="text-amber-700 uppercase tracking-[0.2em] text-[10px] font-semibold mb-1">
                  {group.subtitle}
                </p>
                <h3
                  className="text-xl font-bold text-stone-800 mb-4"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  {group.title}
                </h3>
                <div className="space-y-0 divide-y divide-stone-100">
                  {group.items.map((item) => (
                    <div key={item.name} className="py-2.5 flex justify-between items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-stone-700 text-[13px] font-medium leading-snug">
                          {item.name}
                        </p>
                        {item.description && (
                          <p className="text-stone-400 text-[11px] leading-relaxed mt-0.5">
                            {item.description}
                          </p>
                        )}
                      </div>
                      <span className="shrink-0 text-amber-700 font-semibold text-[13px] whitespace-nowrap">
                        {item.price}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
