import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navLinks = [
    { name: "Willkommen", href: "/" },
    { name: "Speisekarte", href: "/speisekarte" },
    { name: "Über uns", href: "/ueber-uns" },
    { name: "Kontakt & Anfahrt", href: "/kontakt" },
  ];

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        scrolled
          ? "bg-white shadow-[0_2px_20px_rgba(0,0,0,0.08)] border-b border-amber-100"
          : "bg-background/80 backdrop-blur-md border-b border-transparent"
      }`}
    >
      <div className="container mx-auto px-6 flex h-20 items-center">
        {/* Logo — left */}
        <Link href="/" className="flex items-center gap-3 shrink-0">
          <img src="/logo.png" alt="Quindici Logo" className="h-[72px] w-auto" />
        </Link>

        {/* Desktop Nav — right-aligned toward buttons */}
        <nav className="hidden lg:flex flex-1 items-center justify-end gap-1 mr-6">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="relative px-4 py-2 text-sm font-medium tracking-wide text-stone-700 hover:text-amber-700 transition-colors group"
              data-testid={`nav-link-${link.name.toLowerCase().replace(/\s+/g, "-")}`}
            >
              {link.name}
              <span className="absolute bottom-0 left-4 right-4 h-px bg-amber-600 scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-200" />
            </Link>
          ))}
        </nav>

        {/* Buttons — right */}
        <div className="hidden lg:flex items-center gap-3 shrink-0">
          <Link href="/tisch-reservieren">
            <Button
              variant="outline"
              className="uppercase tracking-widest text-xs font-bold rounded-none px-6 h-11 transition-all"
              style={{ borderColor: "#c5a485", color: "#c5a485", backgroundColor: "transparent" }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#c5a48512"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = "transparent"; }}
              data-testid="button-tisch-reservieren"
            >
              Tisch reservieren
            </Button>
          </Link>
          <a href="https://quindici.lieferservice.3ytasarim.com/" target="_blank" rel="noopener noreferrer">
            <Button
              className="text-white uppercase tracking-widest text-xs font-bold rounded-none px-6 h-11 shadow-sm transition-all"
              style={{ backgroundColor: "#c5a485" }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#b8962e"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#c5a485"; }}
              data-testid="button-jetzt-bestellen"
            >
              Jetzt bestellen
            </Button>
          </a>
        </div>

        {/* Mobile Nav */}
        <div className="lg:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 text-stone-700"
                data-testid="button-mobile-menu"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="bg-white border-l border-amber-100 w-72">
              <div className="flex flex-col pt-10">
                <img src="/logo.png" alt="Quindici Logo" className="h-16 w-auto mx-auto mb-10" />
                <div className="flex flex-col">
                  {navLinks.map((link) => (
                    <Link
                      key={link.name}
                      href={link.href}
                      className="text-base font-medium text-stone-700 hover:text-amber-700 transition-colors py-3 px-2 border-b border-stone-100"
                      data-testid={`mobile-nav-${link.name.toLowerCase().replace(/\s+/g, "-")}`}
                    >
                      {link.name}
                    </Link>
                  ))}
                </div>
                <div className="flex flex-col gap-3 mt-8 px-2">
                  <Link href="/tisch-reservieren" className="w-full">
                    <Button
                      variant="outline"
                      className="w-full uppercase tracking-widest text-[11px] font-semibold rounded-none"
                      style={{ borderColor: "#c5a485", color: "#c5a485" }}
                      data-testid="mobile-button-tisch-reservieren"
                    >
                      Tisch reservieren
                    </Button>
                  </Link>
                  <a href="https://quindici.lieferservice.3ytasarim.com/" target="_blank" rel="noopener noreferrer" className="w-full">
                    <Button
                      className="w-full text-white uppercase tracking-widest text-[11px] font-semibold rounded-none"
                      style={{ backgroundColor: "#c5a485" }}
                      data-testid="mobile-button-jetzt-bestellen"
                    >
                      Jetzt bestellen
                    </Button>
                  </a>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
