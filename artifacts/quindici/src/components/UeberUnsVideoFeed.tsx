import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { Instagram, Heart, MessageCircle, Send, Bookmark, MoreHorizontal, Play } from "lucide-react";

interface VideoSource {
  src: string;
  type: string;
}

interface VideoPost {
  id: string;
  sources: VideoSource[];
  caption: string;
  timeAgo: string;
}

const PROFILE_URL = "https://www.instagram.com/quindicipizza/";
const HANDLE = "@quindicipizza";

// TODO: Alt yazıları (caption) ve zaman etiketlerini onaylayınca güncelle — şu an taslak.
const VIDEO_POSTS: VideoPost[] = [
  {
    id: "1",
    sources: [{ src: "/videos/ueberuns-familie.mp4", type: "video/mp4" }],
    caption: "Familie ist für uns mehr als nur ein Wort. Im Quindici soll sich jeder Gast willkommen fühlen.",
    timeAgo: "2 T.",
  },
  {
    id: "2",
    sources: [
      { src: "/videos/ueberuns-anfang.mov", type: "video/mp4" },
      { src: "/videos/ueberuns-anfang.mov", type: "video/quicktime" },
    ],
    caption: "Der Anfang von Quindici — wie alles begann.",
    timeAgo: "3 T.",
  },
  {
    id: "3",
    sources: [
      { src: "/videos/ueberuns-stolz.mov", type: "video/mp4" },
      { src: "/videos/ueberuns-stolz.mov", type: "video/quicktime" },
    ],
    caption: "Worauf sind wir am meisten stolz? Das erzählen wir Dir hier.",
    timeAgo: "1 W.",
  },
];

const PIZZA_ICONS = [
  { src: "/icon-pizza-1.png", top: "8%", left: "2%", size: 80, rotate: -15, opacity: 0.12 },
  { src: "/icon-pizza-3.png", top: "55%", left: "1%", size: 55, rotate: 20, opacity: 0.09 },
  { src: "/icon-pizza-5.png", top: "80%", left: "4%", size: 70, rotate: -8, opacity: 0.10 },
  { src: "/icon-pizza-2.png", top: "5%", right: "3%", size: 65, rotate: 12, opacity: 0.11 },
  { src: "/icon-pizza-7.png", top: "40%", right: "1%", size: 90, rotate: -22, opacity: 0.08 },
  { src: "/icon-pizza-4.png", top: "75%", right: "2%", size: 58, rotate: 30, opacity: 0.10 },
  { src: "/icon-pizza-cutter.png", top: "20%", left: "8%", size: 50, rotate: 45, opacity: 0.07 },
  { src: "/icon-pizza-slice.png", top: "65%", right: "6%", size: 50, rotate: -40, opacity: 0.07 },
  { src: "/icon-pizza-6.png", top: "90%", left: "30%", size: 45, rotate: 10, opacity: 0.06 },
  { src: "/icon-pizza-8.png", top: "3%", left: "45%", size: 40, rotate: -5, opacity: 0.06 },
];

function VideoCard({ post, index }: { post: VideoPost; index: number }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [playing, setPlaying] = useState(false);

  const shortCaption = post.caption.length > 80 ? post.caption.slice(0, 80) + "…" : post.caption;

  const cardBg = "#1a1108";
  const borderCol = "rgba(255,255,255,0.1)";
  const textMain = "#f5f0ea";
  const textSub = "#a8a29e";
  const iconCol = "#e8e2da";

  const handlePlay = () => {
    setPlaying(true);
    requestAnimationFrame(() => {
      if (videoRef.current) {
        videoRef.current.muted = false;
        videoRef.current.controls = true;
        videoRef.current.play();
      }
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-20px" }}
      transition={{ duration: 0.5, delay: index * 0.12 }}
      className="flex flex-col rounded-xl overflow-hidden"
      style={{ backgroundColor: cardBg, border: `1px solid ${borderCol}` }}
    >
      {/* Card Header */}
      <div className="flex items-center justify-between px-3.5 py-3">
        <a href={PROFILE_URL} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2.5">
          <div className="relative shrink-0">
            <div className="w-9 h-9 rounded-full p-[2px]" style={{ background: "linear-gradient(135deg, #c5a485, #8b6842)" }}>
              <div className="w-full h-full rounded-full overflow-hidden bg-black flex items-center justify-center">
                <img src="/logo.png" alt="Quindici" className="w-7 h-7 object-contain" />
              </div>
            </div>
          </div>
          <div>
            <p className="text-[13px] font-semibold leading-none mb-0.5" style={{ color: textMain }}>quindicipizza</p>
            <p className="text-[11px] leading-none" style={{ color: textSub }}>Ludwigsburg</p>
          </div>
        </a>
        <div className="flex items-center gap-2">
          <span className="text-[11px]" style={{ color: textSub }}>{post.timeAgo}</span>
          <button className="p-1 rounded-full hover:bg-white/10 transition-colors" style={{ color: textSub }}>
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Video */}
      <div className="relative aspect-square overflow-hidden bg-black">
        <video
          ref={videoRef}
          preload="metadata"
          muted
          playsInline
          loop
          className="w-full h-full object-cover"
        >
          {post.sources.map((source) => (
            <source key={source.type} src={source.src} type={source.type} />
          ))}
        </video>

        {!playing && (
          <button
            type="button"
            onClick={handlePlay}
            aria-label="Video abspielen"
            className="absolute inset-0 flex items-center justify-center group"
          >
            <div className="absolute inset-0 bg-black/15 group-hover:bg-black/25 transition-colors" />
            <div className="relative w-16 h-16 rounded-full bg-white/90 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Play className="w-7 h-7 ml-1" style={{ color: "#1c1917" }} fill="#1c1917" />
            </div>
            <div className="absolute top-2.5 right-2.5 bg-black/60 rounded-md px-2 py-0.5 text-[10px] text-white font-bold tracking-wider">
              REEL
            </div>
          </button>
        )}
      </div>

      {/* Action Bar */}
      <div className="px-3.5 pt-3 pb-1 flex items-center justify-between">
        <div className="flex items-center gap-3.5">
          <button onClick={() => setLiked((v) => !v)} className="transition-transform active:scale-90" title="Gefällt mir">
            <Heart className={`w-6 h-6 transition-colors ${liked ? "fill-red-500 text-red-500" : ""}`} style={{ color: liked ? undefined : iconCol }} />
          </button>
          <a href={PROFILE_URL} target="_blank" rel="noopener noreferrer" title="Kommentieren">
            <MessageCircle className="w-6 h-6 hover:opacity-60 transition-opacity" style={{ color: iconCol }} />
          </a>
          <a href={PROFILE_URL} target="_blank" rel="noopener noreferrer" title="Teilen">
            <Send className="w-6 h-6 hover:opacity-60 transition-opacity -rotate-12" style={{ color: iconCol }} />
          </a>
        </div>
        <button onClick={() => setSaved((v) => !v)} className="transition-transform active:scale-90" title="Speichern">
          <Bookmark className={`w-6 h-6 transition-colors ${saved ? "fill-current" : ""}`} style={{ color: iconCol }} />
        </button>
      </div>

      {/* Likes row */}
      <div className="px-3.5 pb-1">
        <p className="text-[13px] font-semibold" style={{ color: textMain }}>
          {liked ? "Dir und anderen gefällt das" : (
            <span>
              Gefällt <a href={PROFILE_URL} target="_blank" rel="noopener noreferrer" className="underline hover:opacity-70" style={{ color: textMain }}>
                quindicipizza
              </a>
            </span>
          )}
        </p>
      </div>

      {/* Caption */}
      {post.caption && (
        <div className="px-3.5 pb-2">
          <p className="text-[13px] leading-snug" style={{ color: textMain }}>
            <span className="font-semibold mr-1">quindicipizza</span>
            {expanded ? post.caption : shortCaption}
            {post.caption.length > 80 && !expanded && (
              <button onClick={() => setExpanded(true)} className="text-xs ml-1 hover:opacity-70" style={{ color: textSub }}>
                mehr
              </button>
            )}
          </p>
        </div>
      )}

      <div className="px-3.5 pb-3">
        <a href={PROFILE_URL} target="_blank" rel="noopener noreferrer" className="text-[12px] hover:opacity-70 transition-opacity" style={{ color: textSub }}>
          Alle Kommentare auf Instagram ansehen
        </a>
      </div>

      <div className="mx-3.5 mb-3.5 mt-0.5">
        <a
          href={PROFILE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full py-2 rounded-lg text-[13px] font-bold transition-opacity hover:opacity-80"
          style={{ backgroundColor: "#c5a485", color: "#1c1917" }}
        >
          <Instagram className="w-3.5 h-3.5" />
          {HANDLE} folgen
        </a>
      </div>
    </motion.div>
  );
}

export default function UeberUnsVideoFeed() {
  const bg = "#18120a";
  const textMain = "#fff";

  return (
    <section className="relative py-16 md:py-20 overflow-hidden" style={{ backgroundColor: bg }}>
      {PIZZA_ICONS.map((icon, i) => (
        <img
          key={i}
          src={icon.src}
          alt=""
          aria-hidden="true"
          style={{
            position: "absolute",
            top: icon.top,
            left: (icon as any).left,
            right: (icon as any).right,
            width: icon.size,
            height: icon.size,
            objectFit: "contain",
            opacity: icon.opacity,
            transform: `rotate(${icon.rotate}deg)`,
            pointerEvents: "none",
            userSelect: "none",
            filter: "brightness(1.4) sepia(0.3)",
          }}
        />
      ))}

      <div className="relative z-10 max-w-5xl mx-auto px-6">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.6 }}
          className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10"
        >
          <div>
            <h2 className="text-3xl md:text-4xl font-bold" style={{ fontFamily: "'Playfair Display', serif", color: textMain }}>
              Folgen Sie uns auf Instagram
            </h2>
          </div>
          <a
            href={PROFILE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm font-semibold shrink-0 transition-opacity hover:opacity-70"
            style={{ color: "#c5a485" }}
          >
            <Instagram className="w-4 h-4" />
            @quindicipizza
          </a>
        </motion.div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-5">
          {VIDEO_POSTS.map((post, i) => (
            <VideoCard key={post.id} post={post} index={i} />
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-8 text-center"
        >
          <a
            href={PROFILE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm font-semibold px-6 py-3 border transition-opacity hover:opacity-70"
            style={{ borderColor: "#c5a485", color: "#c5a485" }}
          >
            <Instagram className="w-4 h-4" />
            Alle Beiträge auf Instagram ansehen
          </a>
        </motion.div>
      </div>
    </section>
  );
}
