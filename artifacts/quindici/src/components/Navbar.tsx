import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export default function Navbar() {
  const navLinks = [
    { name: "Willkommen", href: "/" },
    { name: "Speisekarte", href: "#speisekarte" },
    { name: "Über uns", href: "#ueber-uns" },
    { name: "Kontakt & Anfahrt", href: "#kontakt" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 md:px-6 flex h-24 items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <img src="/logo.png" alt="Quindici Logo" className="h-16 w-auto" />
        </Link>
        
        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link 
              key={link.name} 
              href={link.href}
              className="text-sm font-medium tracking-wide text-foreground/80 hover:text-primary transition-colors"
            >
              {link.name}
            </Link>
          ))}
          <div className="flex items-center gap-4 ml-4">
            <Button variant="outline" className="border-primary/50 text-primary hover:bg-primary/5 uppercase tracking-widest text-xs font-semibold rounded-none">
              Tisch reservieren
            </Button>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90 uppercase tracking-widest text-xs font-semibold rounded-none">
              Jetzt bestellen
            </Button>
          </div>
        </nav>

        {/* Mobile Nav */}
        <div className="lg:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="h-10 w-10">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Menü öffnen</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="bg-background border-l-primary/20">
              <div className="flex flex-col gap-8 mt-12">
                {navLinks.map((link) => (
                  <Link 
                    key={link.name} 
                    href={link.href}
                    className="text-xl font-serif text-foreground hover:text-primary transition-colors"
                  >
                    {link.name}
                  </Link>
                ))}
                <div className="flex flex-col gap-4 mt-8">
                  <Button variant="outline" className="w-full border-primary/50 text-primary uppercase tracking-widest text-xs font-semibold rounded-none">
                    Tisch reservieren
                  </Button>
                  <Button className="w-full bg-primary text-primary-foreground uppercase tracking-widest text-xs font-semibold rounded-none">
                    Jetzt bestellen
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
