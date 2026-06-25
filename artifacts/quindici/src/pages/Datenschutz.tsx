import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const sections = [
  {
    num: "1",
    title: "Datenschutz auf einen Blick",
    content: (
      <>
        <p>Der Schutz Ihrer personenbezogenen Daten ist uns ein wichtiges Anliegen. Wir behandeln Ihre Daten vertraulich und entsprechend den gesetzlichen Datenschutzvorschriften, insbesondere der Datenschutz-Grundverordnung (DSGVO) sowie den geltenden nationalen Datenschutzgesetzen.</p>
        <p>Diese Datenschutzerklärung informiert Sie darüber, welche personenbezogenen Daten wir auf unserer Website erheben, zu welchem Zweck diese verarbeitet werden und welche Rechte Sie als betroffene Person haben.</p>
      </>
    ),
  },
  {
    num: "2",
    title: "Verantwortlicher",
    content: (
      <address className="not-italic space-y-1">
        <p className="font-semibold text-stone-800">Quindici Trattoria Pizzeria</p>
        <p>Bahnhofstraße 17</p>
        <p>71638 Ludwigsburg</p>
        <p className="pt-2">Telefon: <a href="tel:0714147328870" className="hover:text-amber-700 transition-colors">07141 4732887</a></p>
        <p>E-Mail: <a href="mailto:info@trattoria-quindici.de" className="hover:text-amber-700 transition-colors">info@trattoria-quindici.de</a></p>
        <p className="pt-2 text-stone-500 text-sm">Verantwortlich für die Datenverarbeitung ist der Betreiber der oben genannten Einrichtung.</p>
      </address>
    ),
  },
  {
    num: "3",
    title: "Hosting",
    content: (
      <>
        <p>Unsere Website wird bei einem externen Hosting-Dienstleister betrieben. Beim Besuch unserer Website werden automatisch Informationen erhoben und in sogenannten Server-Logfiles gespeichert.</p>
        <p>Hierzu gehören insbesondere:</p>
        <ul>
          <li>IP-Adresse</li>
          <li>Datum und Uhrzeit des Zugriffs</li>
          <li>Browsertyp und Browserversion</li>
          <li>Betriebssystem</li>
          <li>Referrer-URL</li>
          <li>Name der aufgerufenen Datei</li>
          <li>übertragene Datenmenge</li>
        </ul>
        <p>Die Verarbeitung erfolgt auf Grundlage von Art. 6 Abs. 1 lit. f DSGVO. Unser berechtigtes Interesse liegt in der sicheren Bereitstellung und dem störungsfreien Betrieb unserer Website.</p>
        <p>Server-Logfiles werden nur so lange gespeichert, wie dies technisch erforderlich oder gesetzlich vorgeschrieben ist.</p>
      </>
    ),
  },
  {
    num: "4",
    title: "Kontaktaufnahme",
    content: (
      <>
        <p>Wenn Sie uns per Telefon, E-Mail oder über ein Kontaktformular kontaktieren, werden die von Ihnen angegebenen personenbezogenen Daten verarbeitet.</p>
        <p>Hierzu gehören insbesondere:</p>
        <ul>
          <li>Name</li>
          <li>E-Mail-Adresse</li>
          <li>Telefonnummer</li>
          <li>Inhalt Ihrer Nachricht</li>
        </ul>
        <p>Die Verarbeitung erfolgt ausschließlich zur Bearbeitung Ihrer Anfrage.</p>
        <p>Rechtsgrundlage: Art. 6 Abs. 1 lit. b DSGVO (Vertragsanbahnung) bzw. Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse an der Bearbeitung Ihrer Anfrage).</p>
      </>
    ),
  },
  {
    num: "5",
    title: "Tischreservierung",
    content: (
      <>
        <p>Auf unserer Website haben Sie die Möglichkeit, einen Tisch online zu reservieren. Dabei können insbesondere folgende Daten erhoben werden:</p>
        <ul>
          <li>Vorname</li>
          <li>Nachname</li>
          <li>Telefonnummer</li>
          <li>E-Mail-Adresse</li>
          <li>gewünschtes Reservierungsdatum</li>
          <li>Uhrzeit</li>
          <li>Anzahl der Personen</li>
          <li>optionale Bemerkungen</li>
        </ul>
        <p>Diese Daten werden ausschließlich verwendet, um Ihre Reservierung entgegenzunehmen, zu verwalten und gegebenenfalls Rückfragen zu Ihrer Reservierung stellen zu können. Ohne diese Daten ist eine Reservierung leider nicht möglich.</p>
        <p>Rechtsgrundlage der Verarbeitung ist Art. 6 Abs. 1 lit. b DSGVO. Die Daten werden nur solange gespeichert, wie sie für die Durchführung der Reservierung erforderlich sind oder gesetzliche Aufbewahrungspflichten bestehen.</p>
      </>
    ),
  },
  {
    num: "6",
    title: "Online-Bestellungen / Lieferservice",
    content: (
      <>
        <p>Über unsere Website können Speisen zur Lieferung oder Abholung bestellt werden. Hierbei werden unter anderem folgende personenbezogene Daten verarbeitet:</p>
        <ul>
          <li>Vorname</li>
          <li>Nachname</li>
          <li>Lieferadresse</li>
          <li>Telefonnummer</li>
          <li>E-Mail-Adresse</li>
          <li>Bestellinformationen</li>
          <li>Zahlungsinformationen (sofern erforderlich)</li>
        </ul>
        <p>Diese Daten werden ausschließlich verarbeitet, um Ihre Bestellung entgegenzunehmen, auszuliefern und abzurechnen. Rechtsgrundlage: Art. 6 Abs. 1 lit. b DSGVO.</p>
        <p>Ihre Daten werden nicht für Werbezwecke verwendet, sofern Sie hierzu keine ausdrückliche Einwilligung erteilt haben.</p>
      </>
    ),
  },
  {
    num: "7",
    title: "Weiterleitung zu Lieferando",
    content: (
      <p>Sofern Sie über unsere Website auf Lieferando weitergeleitet werden, verlassen Sie unsere Website. Für die Verarbeitung personenbezogener Daten auf den Seiten von Lieferando ist ausschließlich der jeweilige Anbieter verantwortlich. Es gelten die Datenschutzbestimmungen des jeweiligen Anbieters.</p>
    ),
  },
  {
    num: "8",
    title: "Cookies",
    content: (
      <>
        <p>Unsere Website verwendet Cookies. Cookies sind kleine Textdateien, die auf Ihrem Endgerät gespeichert werden.</p>
        <p>Einige Cookies sind technisch notwendig, damit die Website ordnungsgemäß funktioniert. Andere Cookies dienen ausschließlich der Verbesserung der Benutzerfreundlichkeit.</p>
        <p>Sie können Ihren Browser jederzeit so einstellen, dass Cookies gelöscht oder blockiert werden.</p>
        <p>Rechtsgrundlage: Art. 6 Abs. 1 lit. f DSGVO bzw. Art. 6 Abs. 1 lit. a DSGVO, sofern eine Einwilligung erforderlich ist.</p>
      </>
    ),
  },
  {
    num: "9",
    title: "SSL- bzw. TLS-Verschlüsselung",
    content: (
      <>
        <p>Zum Schutz Ihrer personenbezogenen Daten verwendet unsere Website eine SSL-/TLS-Verschlüsselung. Eine verschlüsselte Verbindung erkennen Sie an „https://" sowie dem Schloss-Symbol in Ihrem Browser.</p>
        <p>Dadurch können übermittelte Daten nicht von Dritten mitgelesen werden.</p>
      </>
    ),
  },
  {
    num: "10",
    title: "Google Maps",
    content: (
      <>
        <p>Unsere Website kann Kartenmaterial von Google Maps einbinden. Beim Aufruf einer entsprechenden Seite können personenbezogene Daten, insbesondere Ihre IP-Adresse, an Google übermittelt werden.</p>
        <p>Weitere Informationen finden Sie in der Datenschutzerklärung von Google.</p>
        <p>Rechtsgrundlage: Art. 6 Abs. 1 lit. a DSGVO (Einwilligung) oder Art. 6 Abs. 1 lit. f DSGVO, sofern technisch erforderlich.</p>
      </>
    ),
  },
  {
    num: "11",
    title: "Social Media",
    content: (
      <p>Unsere Website enthält Verlinkungen zu unseren Profilen auf sozialen Netzwerken (z. B. Instagram oder Facebook). Beim Anklicken dieser Links verlassen Sie unsere Website. Für die Datenverarbeitung auf den jeweiligen Plattformen sind ausschließlich deren Betreiber verantwortlich.</p>
    ),
  },
  {
    num: "12",
    title: "Speicherdauer",
    content: (
      <p>Personenbezogene Daten werden nur solange gespeichert, wie dies für die jeweiligen Verarbeitungszwecke erforderlich ist oder gesetzliche Aufbewahrungspflichten bestehen. Anschließend werden die Daten gelöscht oder gesetzeskonform gesperrt.</p>
    ),
  },
  {
    num: "13",
    title: "Ihre Rechte",
    content: (
      <>
        <p>Sie haben jederzeit das Recht auf:</p>
        <ul>
          <li>Auskunft über Ihre gespeicherten Daten (Art. 15 DSGVO)</li>
          <li>Berichtigung unrichtiger Daten (Art. 16 DSGVO)</li>
          <li>Löschung Ihrer Daten (Art. 17 DSGVO)</li>
          <li>Einschränkung der Verarbeitung (Art. 18 DSGVO)</li>
          <li>Datenübertragbarkeit (Art. 20 DSGVO)</li>
          <li>Widerspruch gegen die Verarbeitung (Art. 21 DSGVO)</li>
          <li>Widerruf einer erteilten Einwilligung mit Wirkung für die Zukunft.</li>
        </ul>
      </>
    ),
  },
  {
    num: "14",
    title: "Beschwerderecht",
    content: (
      <p>Sie haben das Recht, sich bei einer Datenschutz-Aufsichtsbehörde über die Verarbeitung Ihrer personenbezogenen Daten zu beschweren.</p>
    ),
  },
  {
    num: "15",
    title: "Änderungen dieser Datenschutzerklärung",
    content: (
      <>
        <p>Wir behalten uns vor, diese Datenschutzerklärung anzupassen, wenn dies aufgrund gesetzlicher Änderungen oder technischer Weiterentwicklungen erforderlich wird. Es gilt jeweils die auf unserer Website veröffentlichte aktuelle Fassung.</p>
        <p className="text-stone-400 text-sm">Stand: Juni 2026</p>
      </>
    ),
  },
];

export default function Datenschutz() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: "#fdf8f2" }}>
      <Navbar />

      {/* Hero */}
      <section className="relative min-h-[32vh] flex items-center justify-center overflow-hidden" style={{ backgroundColor: "#fdf8f2" }}>
        <div className="relative z-10 text-center px-6">
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="text-amber-700 uppercase text-xs font-semibold mb-4"
            style={{ letterSpacing: "0.3em" }}
          >
            Rechtliches
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
            className="text-5xl md:text-7xl font-bold text-stone-800"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Datenschutz
          </motion.h1>
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mx-auto mt-6 h-px w-16 bg-amber-600"
            style={{ transformOrigin: "center" }}
          />
        </div>
      </section>

      {/* Content */}
      <section className="py-16 md:py-24" style={{ backgroundColor: "#fdf8f2" }}>
        <div className="max-w-3xl mx-auto px-6">
          <div className="space-y-12">
            {sections.map((s, i) => (
              <motion.div
                key={s.num}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.55, delay: i * 0.04, ease: "easeOut" }}
              >
                <div className="flex items-baseline gap-4 mb-3">
                  <span
                    className="text-xs font-bold uppercase tracking-widest shrink-0"
                    style={{ color: "#c5a485" }}
                  >
                    {s.num}.
                  </span>
                  <h2
                    className="text-xl md:text-2xl font-bold text-stone-800"
                    style={{ fontFamily: "'Playfair Display', serif" }}
                  >
                    {s.title}
                  </h2>
                </div>
                <div className="pl-8 text-stone-600 leading-relaxed space-y-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1 [&_ul]:text-stone-500">
                  {s.content}
                </div>
                {i < sections.length - 1 && (
                  <div className="mt-10 h-px bg-stone-200" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
