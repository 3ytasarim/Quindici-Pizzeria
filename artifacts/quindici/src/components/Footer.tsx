import { Instagram, Facebook, Phone, CalendarCheck } from "lucide-react";
import { useReservationModal } from "@/components/ReservationModal";

const navLinks = [
  { label: "Startseite",        href: "/" },
  { label: "Speisekarte",       href: "/speisekarte" },
  { label: "Mittagstisch",      href: "/speisekarte" },
  { label: "Lieferservice",     href: "https://www.lieferando.de/speisekarte/quindici-pizza#kategorie_b4ba0961-8497-4427-8381-2610b9040620", external: true },
  { label: "Kontakt",           href: "/kontakt" },
  { label: "Impressum",         href: "#" },
  { label: "Datenschutz",       href: "/datenschutz" },
];

export default function Footer() {
  const { open: openReservation } = useReservationModal();

  return (
    <footer className="relative overflow-hidden bg-stone-900 text-white">
      {/* Watermark image — centered */}
      <img
        src="/quindici-script.png"
        alt=""
        aria-hidden="true"
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 select-none pointer-events-none w-[70%] max-w-2xl"
        style={{ opacity: 0.09 }}
      />

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-3 gap-12 items-start">

        {/* LEFT — contact / social */}
        <div className="text-center md:text-left">
          <p className="text-xs font-semibold tracking-[0.25em] uppercase text-stone-400 mb-5">
            In Verbindung bleiben
          </p>
          <div className="flex gap-4 mb-6 justify-center md:justify-start">
            <a
              href="#"
              className="w-9 h-9 flex items-center justify-center border border-stone-600 text-stone-400 hover:text-white hover:border-white transition-colors"
              aria-label="Facebook"
            >
              <Facebook className="w-4 h-4" />
            </a>
            <a
              href="#"
              className="w-9 h-9 flex items-center justify-center border border-stone-600 text-stone-400 hover:text-white hover:border-white transition-colors"
              aria-label="Instagram"
            >
              <Instagram className="w-4 h-4" />
            </a>
          </div>

          <div className="border-t border-stone-700 pt-6 space-y-1">
            <p className="font-semibold text-white text-sm">Quindici Trattoria Pizzeria</p>
            <p className="text-stone-400 text-sm italic">Einfach genießen</p>
            <p className="text-stone-400 text-sm pt-2 leading-relaxed">
              Bahnhofstraße 17<br />71638 Ludwigsburg
            </p>
          </div>
        </div>

        {/* CENTER — logo + CTA */}
        <div className="flex flex-col items-center gap-6">
          <img
            src="/logo-footer.png"
            alt="Quindici Logo"
            className="h-32 w-auto"
          />
          <div className="space-y-3 text-center">
            <a
              href="tel:+4971414732887"
              className="flex items-center justify-center gap-2 text-stone-300 hover:text-white transition-colors text-sm"
            >
              <Phone className="w-4 h-4 text-amber-500 shrink-0" />
              07141 4732887
            </a>
            <button
              onClick={openReservation}
              className="flex items-center justify-center gap-2 text-stone-300 hover:text-white transition-colors text-sm w-full"
            >
              <CalendarCheck className="w-4 h-4 text-amber-500 shrink-0" />
              Tisch reservieren
            </button>
          </div>
        </div>

        {/* RIGHT — navigation */}
        <div className="text-center md:text-right">
          <nav className="flex flex-col gap-2.5 items-center md:items-end">
            <button
              onClick={openReservation}
              className="text-xs font-semibold tracking-[0.2em] uppercase text-stone-400 hover:text-white transition-colors"
            >
              Tisch reservieren
            </button>
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                {...(link.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                className="text-xs font-semibold tracking-[0.2em] uppercase text-stone-400 hover:text-white transition-colors"
              >
                {link.label}
              </a>
            ))}
          </nav>
        </div>

      </div>

      {/* Bottom bar */}
      <div className="relative z-10 border-t border-stone-800 py-4 px-6 text-center">
        <p className="text-xs text-stone-600">
          © {new Date().getFullYear()} Quindici Trattoria Pizzeria · Alle Rechte vorbehalten
        </p>
      </div>
    </footer>
  );
}
