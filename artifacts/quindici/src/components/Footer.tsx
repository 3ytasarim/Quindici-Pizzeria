import { Link } from "wouter";

export default function Footer() {
  return (
    <footer className="bg-foreground text-background py-16 md:py-24">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center md:text-left">
          
          <div className="flex flex-col items-center md:items-start gap-6">
            <img src="/logo.png" alt="Quindici Logo" className="h-20 w-auto brightness-0 invert opacity-90" />
            <p className="text-background/70 max-w-xs text-sm">
              Authentische italienische Küche, zubereitet mit Amore.
            </p>
          </div>

          <div className="flex flex-col items-center md:items-start gap-4">
            <h4 className="font-serif text-primary text-xl mb-2">Entdecken</h4>
            <Link href="/" className="text-background/80 hover:text-primary transition-colors">Willkommen</Link>
            <Link href="#speisekarte" className="text-background/80 hover:text-primary transition-colors">Speisekarte</Link>
            <Link href="#ueber-uns" className="text-background/80 hover:text-primary transition-colors">Über uns</Link>
            <Link href="#kontakt" className="text-background/80 hover:text-primary transition-colors">Kontakt & Anfahrt</Link>
          </div>

          <div className="flex flex-col items-center md:items-start gap-4" id="kontakt">
            <h4 className="font-serif text-primary text-xl mb-2">Besuchen Sie uns</h4>
            <p className="text-background/80">Quindici Trattoria Pizzeria<br/>Ludwigsburg</p>
            <Link href="#" className="inline-block mt-4 border-b border-primary text-primary hover:text-background hover:border-background transition-colors pb-1 uppercase tracking-widest text-xs font-semibold">
              Tisch reservieren
            </Link>
          </div>

        </div>

        <div className="mt-20 pt-8 border-t border-background/10 text-center text-sm text-background/50">
          <p>© 2025 Quindici Trattoria Pizzeria. Alle Rechte vorbehalten.</p>
        </div>
      </div>
    </footer>
  );
}
