import { useEffect, useRef, useState } from "react";

interface GalleryItem { id: string; title: string; imageUrl: string; }

const CARD_W = 280;
const GAP = 20;
const SPEED = 0.6; // px per frame

export default function GalerieSlider() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const trackRef = useRef<HTMLDivElement>(null);
  const xRef = useRef(0);
  const rafRef = useRef<number>(0);
  const pausedRef = useRef(false);

  useEffect(() => {
    fetch("/api/gallery")
      .then(r => r.ok ? r.json() : [])
      .then(setItems)
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (items.length === 0) return;
    const track = trackRef.current;
    if (!track) return;

    const itemW = CARD_W + GAP;
    const totalW = itemW * items.length;

    const animate = () => {
      if (!pausedRef.current) {
        xRef.current -= SPEED;
        if (xRef.current <= -totalW) xRef.current += totalW;
        track.style.transform = `translateX(${xRef.current}px)`;
      }
      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [items]);

  if (items.length === 0) return null;

  // Triple-duplicate so the loop is seamless regardless of viewport width
  const displayed = [...items, ...items, ...items];

  return (
    <section className="py-16 md:py-24" style={{ backgroundColor: "#fdf8f2" }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 mb-10">
        <div className="text-center">
          <p className="text-xs tracking-[0.25em] uppercase mb-3" style={{ color: "#d4af37" }}>
            Quindici Trattoria Pizzeria
          </p>
          <h2 className="font-serif text-3xl md:text-4xl text-stone-800">Galerie</h2>
        </div>
      </div>

      {/* Scrolling band — full width, overflow hidden */}
      <div
        className="w-full overflow-hidden"
        onMouseEnter={() => { pausedRef.current = true; }}
        onMouseLeave={() => { pausedRef.current = false; }}
      >
        <div
          ref={trackRef}
          className="flex"
          style={{ gap: GAP, willChange: "transform" }}
        >
          {displayed.map((item, i) => (
            <div
              key={i}
              className="shrink-0 overflow-hidden rounded-sm shadow-md"
              style={{ width: CARD_W }}
            >
              <div className="aspect-[4/3]">
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="w-full h-full object-cover"
                  draggable={false}
                />
              </div>
              {item.title && (
                <p className="text-xs text-stone-500 text-center px-2 py-1.5 truncate">
                  {item.title}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
