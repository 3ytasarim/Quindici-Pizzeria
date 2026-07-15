import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useReservationModal } from "@/components/ReservationModal";
import { useSommerpauseModal } from "@/components/SommerpauseModal";

function AnimatedBurger({ open }: { open: boolean }) {
  return (
    <div className="w-6 h-5 flex flex-col justify-between relative">
      {/* Top bar */}
      <motion.span
        className="block h-[2px] rounded-full origin-center"
        style={{ backgroundColor: "#1c1c1c" }}
        animate={open ? { rotate: 45, y: 9 } : { rotate: 0, y: 0 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      />
      {/* Middle bar */}
      <motion.span
        className="block h-[2px] rounded-full"
        style={{ backgroundColor: "#1c1c1c" }}
        animate={open ? { opacity: 0, scaleX: 0 } : { opacity: 1, scaleX: 1 }}
        transition={{ duration: 0.2, ease: "easeInOut" }}
      />
      {/* Bottom bar */}
      <motion.span
        className="block h-[2px] rounded-full origin-center"
        style={{ backgroundColor: "#1c1c1c" }}
        animate={open ? { rotate: -45, y: -9 } : { rotate: 0, y: 0 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      />
    </div>
  );
}

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { open: openReservation } = useReservationModal();
  const { open: openSommerpause } = useSommerpauseModal();

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
      <div className="container mx-auto px-6 flex h-20 items-center justify-between">

        {/* Logo — left */}
        <Link href="/" className="flex items-center gap-3 shrink-0">
          <img src="/logo.png" alt="Quindici Logo" className="h-[72px] w-auto" />
        </Link>

        {/* Desktop Nav — center-right */}
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

        {/* Desktop Buttons — right */}
        <div className="hidden lg:flex items-center gap-3 shrink-0">
          <Button
            variant="outline"
            className="uppercase tracking-widest text-xs font-bold rounded-none px-6 h-11 transition-all"
            style={{ borderColor: "#c5a485", color: "#c5a485", backgroundColor: "transparent" }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#c5a48512"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = "transparent"; }}
            data-testid="button-tisch-reservieren"
            onClick={openReservation}
          >
            Tisch reservieren
          </Button>
          <Button
            className="text-white uppercase tracking-widest text-xs font-bold rounded-none px-6 h-11 shadow-sm transition-all"
            style={{ backgroundColor: "#c5a485" }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#b8962e"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#c5a485"; }}
            data-testid="button-jetzt-bestellen"
            onClick={openSommerpause}
          >
            Jetzt bestellen
          </Button>
        </div>

        {/* Mobile Hamburger — far right */}
        <div className="lg:hidden">
          <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
            <SheetTrigger asChild>
              <button
                className="flex items-center justify-center w-11 h-11 rounded-full transition-colors hover:bg-amber-50 focus:outline-none"
                aria-label="Menü öffnen"
                data-testid="button-mobile-menu"
              >
                <AnimatedBurger open={menuOpen} />
              </button>
            </SheetTrigger>

            <SheetContent side="right" className="bg-white border-l border-amber-100 w-72 p-0">
              <AnimatePresence>
                {menuOpen && (
                  <motion.div
                    key="mobile-menu"
                    initial={{ opacity: 0, x: 40 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 40 }}
                    transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                    className="flex flex-col h-full pt-10 px-6 pb-8"
                  >
                    <img src="/logo.png" alt="Quindici Logo" className="h-16 w-auto mx-auto mb-10" />

                    <nav className="flex flex-col">
                      {navLinks.map((link, i) => (
                        <motion.div
                          key={link.name}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.08 + i * 0.06, duration: 0.3, ease: "easeOut" }}
                        >
                          <Link
                            href={link.href}
                            onClick={() => setMenuOpen(false)}
                            className="block text-base font-medium text-stone-700 hover:text-amber-700 transition-colors py-3 border-b border-stone-100"
                            data-testid={`mobile-nav-${link.name.toLowerCase().replace(/\s+/g, "-")}`}
                          >
                            {link.name}
                          </Link>
                        </motion.div>
                      ))}
                    </nav>

                    <motion.div
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.36, duration: 0.3, ease: "easeOut" }}
                      className="flex flex-col gap-3 mt-8"
                    >
                      <Button
                        variant="outline"
                        className="w-full uppercase tracking-widest text-[11px] font-semibold rounded-none"
                        style={{ borderColor: "#c5a485", color: "#c5a485" }}
                        data-testid="mobile-button-tisch-reservieren"
                        onClick={() => { setMenuOpen(false); openReservation(); }}
                      >
                        Tisch reservieren
                      </Button>
                      <Button
                        className="w-full text-white uppercase tracking-widest text-[11px] font-semibold rounded-none"
                        style={{ backgroundColor: "#c5a485" }}
                        data-testid="mobile-button-jetzt-bestellen"
                        onClick={() => { setMenuOpen(false); openSommerpause(); }}
                      >
                        Jetzt bestellen
                      </Button>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </SheetContent>
          </Sheet>
        </div>

      </div>
    </header>
  );
}
