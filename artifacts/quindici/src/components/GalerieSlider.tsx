import { useEffect, useRef, useState } from "react";

interface GalleryItem { id: string; title: string; imageUrl: string; }

const INTERVAL = 3500;

export default function GalerieSlider() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [idx, setIdx] = useState(0);
  const [transitioning, setTransitioning] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    fetch("/api/gallery")
      .then(r => r.ok ? r.json() : [])
      .then(setItems)
      .catch(() => {});
  }, []);

  const goTo = (next: number) => {
    if (transitioning || items.length < 2) return;
    setTransitioning(true);
    setTimeout(() => {
      setIdx((next + items.length) % items.length);
      setTransitioning(false);
    }, 400);
  };

  const resetTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (items.length < 2) return;
    timerRef.current = setInterval(() => goTo(idx + 1), INTERVAL);
  };

  useEffect(() => {
    if (items.length < 2) return;
    timerRef.current = setInterval(() => {
      setIdx(prev => (prev + 1) % items.length);
    }, INTERVAL);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [items.length]);

  if (items.length === 0) return null;

  const prev = (items.length + idx - 1) % items.length;
  const next = (idx + 1) % items.length;

  return (
    <section className="py-16 md:py-24 overflow-hidden" style={{ backgroundColor: "#fdf8f2" }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-10">
          <p className="text-xs tracking-[0.25em] uppercase mb-3" style={{ color: "#d4af37" }}>
            Quindici Trattoria Pizzeria
          </p>
          <h2 className="font-serif text-3xl md:text-4xl text-stone-800">Galerie</h2>
        </div>

        {/* Slider */}
        <div className="relative flex items-center justify-center gap-3 md:gap-5">
          {/* Prev side card */}
          {items.length > 1 && (
            <div
              className="hidden sm:block w-32 md:w-48 lg:w-64 shrink-0 cursor-pointer transition-all duration-300 opacity-40 hover:opacity-60"
              style={{ transform: "scale(0.88)" }}
              onClick={() => { goTo(prev); resetTimer(); }}
            >
              <div className="aspect-[4/3] overflow-hidden rounded-sm shadow-md">
                <img
                  src={items[prev].imageUrl}
                  alt={items[prev].title}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          )}

          {/* Main card */}
          <div className="flex-1 max-w-2xl">
            <div
              className="aspect-[4/3] overflow-hidden rounded-sm shadow-xl transition-opacity duration-400"
              style={{ opacity: transitioning ? 0 : 1 }}
            >
              <img
                key={idx}
                src={items[idx].imageUrl}
                alt={items[idx].title}
                className="w-full h-full object-cover"
              />
            </div>
            {items[idx].title && (
              <p
                className="text-center text-sm text-stone-500 mt-3 transition-opacity duration-400"
                style={{ opacity: transitioning ? 0 : 1 }}
              >
                {items[idx].title}
              </p>
            )}
          </div>

          {/* Next side card */}
          {items.length > 1 && (
            <div
              className="hidden sm:block w-32 md:w-48 lg:w-64 shrink-0 cursor-pointer transition-all duration-300 opacity-40 hover:opacity-60"
              style={{ transform: "scale(0.88)" }}
              onClick={() => { goTo(next); resetTimer(); }}
            >
              <div className="aspect-[4/3] overflow-hidden rounded-sm shadow-md">
                <img
                  src={items[next].imageUrl}
                  alt={items[next].title}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          )}
        </div>

        {/* Dots */}
        {items.length > 1 && (
          <div className="flex justify-center gap-2 mt-6">
            {items.map((_, i) => (
              <button
                key={i}
                onClick={() => { goTo(i); resetTimer(); }}
                className="rounded-full transition-all duration-300"
                style={{
                  width: i === idx ? 24 : 8,
                  height: 8,
                  backgroundColor: i === idx ? "#d4af37" : "#d6cfc4",
                }}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
