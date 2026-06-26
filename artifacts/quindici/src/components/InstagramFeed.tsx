import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Instagram, Heart, MessageCircle, Send, Bookmark, MoreHorizontal } from "lucide-react";

interface Post {
  id: string;
  media_type: string;
  media_url: string;
  thumbnail_url?: string;
  permalink: string;
  caption?: string;
  timestamp?: string;
}

const PROFILE_URL = "https://www.instagram.com/quindicipizza/";
const HANDLE = "@quindicipizza";

const PIZZA_ICONS = [
  { src: "/icon-pizza-1.png", top: "8%",  left: "2%",   size: 80,  rotate: -15, opacity: 0.12 },
  { src: "/icon-pizza-3.png", top: "55%", left: "1%",   size: 55,  rotate: 20,  opacity: 0.09 },
  { src: "/icon-pizza-5.png", top: "80%", left: "4%",   size: 70,  rotate: -8,  opacity: 0.10 },
  { src: "/icon-pizza-2.png", top: "5%",  right: "3%",  size: 65,  rotate: 12,  opacity: 0.11 },
  { src: "/icon-pizza-7.png", top: "40%", right: "1%",  size: 90,  rotate: -22, opacity: 0.08 },
  { src: "/icon-pizza-4.png", top: "75%", right: "2%",  size: 58,  rotate: 30,  opacity: 0.10 },
  { src: "/icon-pizza-cutter.png", top: "20%", left: "8%",  size: 50, rotate: 45, opacity: 0.07 },
  { src: "/icon-pizza-slice.png",  top: "65%", right: "6%", size: 50, rotate: -40, opacity: 0.07 },
  { src: "/icon-pizza-6.png", top: "90%", left: "30%",  size: 45,  rotate: 10,  opacity: 0.06 },
  { src: "/icon-pizza-8.png", top: "3%",  left: "45%",  size: 40,  rotate: -5,  opacity: 0.06 },
];

function timeAgo(timestamp?: string): string {
  if (!timestamp) return "";
  const diff = (Date.now() - new Date(timestamp).getTime()) / 1000;
  if (diff < 3600) return `${Math.floor(diff / 60)} Min.`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} Std.`;
  if (diff < 604800) return `${Math.floor(diff / 86400)} T.`;
  if (diff < 2592000) return `${Math.floor(diff / 604800)} W.`;
  return `${Math.floor(diff / 2592000)} Mon.`;
};

function InstagramCard({ post, index, light }: { post: Post; index: number; light: boolean }) {
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const imgSrc = post.media_type === "VIDEO" ? post.thumbnail_url : post.media_url;
  const caption = post.caption ?? "";
  const shortCaption = caption.length > 80 ? caption.slice(0, 80) + "…" : caption;

  const cardBg = light ? "#fff" : "#1a1108";
  const borderCol = light ? "rgba(0,0,0,0.12)" : "rgba(255,255,255,0.1)";
  const textMain = light ? "#1c1917" : "#f5f0ea";
  const textSub = light ? "#78716c" : "#a8a29e";
  const iconCol = light ? "#1c1917" : "#e8e2da";

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
          {/* Avatar with gold ring */}
          <div className="relative shrink-0">
            <div className="w-9 h-9 rounded-full p-[2px]"
              style={{ background: "linear-gradient(135deg, #c5a485, #8b6842)" }}>
              <div className="w-full h-full rounded-full overflow-hidden bg-black flex items-center justify-center">
                <img src="/logo.png" alt="Quindici" className="w-7 h-7 object-contain" />
              </div>
            </div>
          </div>
          <div>
            <p className="text-[13px] font-semibold leading-none mb-0.5" style={{ color: textMain }}>
              quindicipizza
            </p>
            <p className="text-[11px] leading-none" style={{ color: textSub }}>
              Ludwigsburg
            </p>
          </div>
        </a>
        <div className="flex items-center gap-2">
          {post.timestamp && (
            <span className="text-[11px]" style={{ color: textSub }}>{timeAgo(post.timestamp)}</span>
          )}
          <button className="p-1 rounded-full hover:bg-white/10 transition-colors" style={{ color: textSub }}>
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Image */}
      <a href={post.permalink} target="_blank" rel="noopener noreferrer" className="block relative aspect-square overflow-hidden">
        {imgSrc ? (
          <img
            src={imgSrc}
            alt={caption.slice(0, 60) || "Instagram Post"}
            className="w-full h-full object-cover hover:scale-[1.02] transition-transform duration-700"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: light ? "#e7e0d8" : "#2a1f12" }}>
            <Instagram className="w-10 h-10 opacity-20" style={{ color: textMain }} />
          </div>
        )}
        {post.media_type === "VIDEO" && (
          <div className="absolute top-2.5 right-2.5 bg-black/60 rounded-md px-2 py-0.5 text-[10px] text-white font-bold tracking-wider">
            REEL
          </div>
        )}
      </a>

      {/* Action Bar */}
      <div className="px-3.5 pt-3 pb-1 flex items-center justify-between">
        <div className="flex items-center gap-3.5">
          {/* Like */}
          <button
            onClick={() => setLiked((v) => !v)}
            className="transition-transform active:scale-90"
            title="Gefällt mir"
          >
            <Heart
              className={`w-6 h-6 transition-colors ${liked ? "fill-red-500 text-red-500" : ""}`}
              style={{ color: liked ? undefined : iconCol }}
            />
          </button>
          {/* Comment → opens post */}
          <a href={post.permalink} target="_blank" rel="noopener noreferrer" title="Kommentieren">
            <MessageCircle className="w-6 h-6 hover:opacity-60 transition-opacity" style={{ color: iconCol }} />
          </a>
          {/* Share → opens post */}
          <a href={post.permalink} target="_blank" rel="noopener noreferrer" title="Teilen">
            <Send className="w-6 h-6 hover:opacity-60 transition-opacity -rotate-12" style={{ color: iconCol }} />
          </a>
        </div>
        {/* Bookmark */}
        <button onClick={() => setSaved((v) => !v)} className="transition-transform active:scale-90" title="Speichern">
          <Bookmark
            className={`w-6 h-6 transition-colors ${saved ? "fill-current" : ""}`}
            style={{ color: iconCol }}
          />
        </button>
      </div>

      {/* Likes row */}
      <div className="px-3.5 pb-1">
        <p className="text-[13px] font-semibold" style={{ color: textMain }}>
          {liked ? "Dir und anderen gefällt das" : (
            <span>
              Gefällt <a href={post.permalink} target="_blank" rel="noopener noreferrer" className="underline hover:opacity-70" style={{ color: textMain }}>
                quindicipizza
              </a>
            </span>
          )}
        </p>
      </div>

      {/* Caption */}
      {caption && (
        <div className="px-3.5 pb-2">
          <p className="text-[13px] leading-snug" style={{ color: textMain }}>
            <span className="font-semibold mr-1">quindicipizza</span>
            {expanded ? caption : shortCaption}
            {caption.length > 80 && !expanded && (
              <button onClick={() => setExpanded(true)} className="text-xs ml-1 hover:opacity-70" style={{ color: textSub }}>
                mehr
              </button>
            )}
          </p>
        </div>
      )}

      {/* View comments → post link */}
      <div className="px-3.5 pb-3">
        <a href={post.permalink} target="_blank" rel="noopener noreferrer"
          className="text-[12px] hover:opacity-70 transition-opacity" style={{ color: textSub }}>
          Alle Kommentare auf Instagram ansehen
        </a>
      </div>

      {/* Follow CTA at bottom */}
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

export default function InstagramFeed({ light = false }: { light?: boolean }) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/instagram/posts")
      .then((r) => r.json())
      .then((d) => setPosts(d.posts ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const bg = light ? "#fdf8f2" : "#18120a";
  const textMain = light ? "#1c1917" : "#fff";
  const textSub = light ? "#78716c" : "#a8a29e";
  const borderCol = light ? "rgba(0,0,0,0.08)" : "rgba(255,255,255,0.08)";

  return (
    <section className="relative py-16 md:py-20 overflow-hidden" style={{ backgroundColor: bg }}>

      {/* Pizza icon decorations — only on dark variant */}
      {!light && PIZZA_ICONS.map((icon, i) => (
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
            <p className="text-xs font-semibold tracking-[0.25em] uppercase mb-2" style={{ color: "#c5a485" }}>
              Social Media
            </p>
            <h2
              className="text-3xl md:text-4xl font-bold"
              style={{ fontFamily: "'Playfair Display', serif", color: textMain }}
            >
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
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-5">
            {[0, 1, 2].map((i) => (
              <div key={i} className="rounded-xl overflow-hidden animate-pulse"
                style={{ backgroundColor: light ? "#e7e0d8" : "#2a1f12", height: 460 }} />
            ))}
          </div>
        ) : posts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-5">
            {posts.map((post, i) => (
              <InstagramCard key={post.id} post={post} index={i} light={light} />
            ))}
          </div>
        ) : (
          /* Placeholder */
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-5">
            {[0, 1, 2].map((i) => (
              <motion.a
                key={i}
                href={PROFILE_URL}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="group rounded-xl aspect-square flex items-center justify-center"
                style={{ backgroundColor: light ? "#ede8e0" : "#231810", border: `1px solid ${borderCol}` }}
              >
                <div className="flex flex-col items-center gap-2 opacity-40 group-hover:opacity-70 transition-opacity">
                  <Instagram className="w-8 h-8" style={{ color: textMain }} />
                  <span className="text-xs" style={{ color: textSub }}>@quindicipizza</span>
                </div>
              </motion.a>
            ))}
          </div>
        )}

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
