import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const sections = [
  {
    num: "1",
    title: "Angaben gemäß § 5 DDG",
    content: (
      <address className="not-italic space-y-1">
        <p className="font-semibold text-stone-800">Quindici Gastro GmbH</p>
        <p>Bahnhofstr. 17</p>
        <p>71638 Ludwigsburg</p>
      </address>
    ),
  },
  {
    num: "2",
    title: "Vertreten durch",
    content: (
      <address className="not-italic space-y-1">
        <p>Carlo Caliendo</p>
        <p className="text-stone-500">Geschäftsführer</p>
      </address>
    ),
  },
  {
    num: "3",
    title: "Kontakt",
    content: (
      <address className="not-italic space-y-1">
        <p>Telefon: <a href="tel:071414732887" className="text-amber-700 hover:underline transition-colors">07141 4732887</a></p>
        <p>E-Mail: <a href="mailto:info@trattoria-quindici.de" className="text-amber-700 hover:underline transition-colors">info@trattoria-quindici.de</a></p>
      </address>
    ),
  },
  {
    num: "4",
    title: "Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV",
    content: (
      <address className="not-italic space-y-1">
        <p>Carlo Caliendo</p>
        <p>Quindici Gastro GmbH</p>
        <p>Bahnhofstr. 17, 71638 Ludwigsburg</p>
      </address>
    ),
  },
  {
    num: "5",
    title: "Verbraucherstreitbeilegung",
    content: (
      <p>
        Wir sind nicht verpflichtet und nicht bereit, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.
      </p>
    ),
  },
  {
    num: "6",
    title: "Haftungsausschluss",
    content: (
      <>
        <p>Die Inhalte dieser Webseite werden mit größtmöglicher Sorgfalt erstellt. Für die Richtigkeit, Vollständigkeit und Aktualität der Inhalte können wir jedoch keine Gewähr übernehmen.</p>
        <p className="mt-3">Als Diensteanbieter sind wir gemäß § 7 Abs. 1 TMG für eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 TMG sind wir als Diensteanbieter jedoch nicht verpflichtet, übermittelte oder gespeicherte fremde Informationen zu überwachen oder nach Umständen zu forschen, die auf eine rechtswidrige Tätigkeit hinweisen.</p>
      </>
    ),
  },
  {
    num: "7",
    title: "Urheberrecht",
    content: (
      <p>
        Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen dem deutschen Urheberrecht. Beiträge Dritter sind als solche gekennzeichnet. Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art der Verwertung außerhalb der Grenzen des Urheberrechtes bedürfen der schriftlichen Zustimmung des jeweiligen Autors bzw. Erstellers.
      </p>
    ),
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function Impressum() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: "#fdf8f2" }}>
      <Navbar />

      {/* Hero */}
      <section className="pt-32 pb-16 text-center border-b border-stone-200/60">
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-5xl md:text-6xl font-bold text-stone-800"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          Impressum
        </motion.h1>
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mx-auto mt-5 h-px w-20 bg-amber-600 origin-center"
        />
      </section>

      {/* Content */}
      <section className="max-w-2xl mx-auto px-6 py-16 space-y-12">
        {sections.map((sec) => (
          <motion.div
            key={sec.num}
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-40px" }}
          >
            <div className="flex items-baseline gap-3 mb-3">
              <span className="text-amber-700 font-bold text-lg">{sec.num}.</span>
              <h2 className="text-stone-800 font-bold text-lg">{sec.title}</h2>
            </div>
            <div className="pl-6 text-stone-600 text-sm leading-relaxed space-y-2">
              {sec.content}
            </div>
          </motion.div>
        ))}
      </section>

      <Footer />
    </div>
  );
}
