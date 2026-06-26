import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Instagram } from "lucide-react";

interface Post {
  id: string;
  media_type: string;
  media_url: string;
  thumbnail_url?: string;
  permalink: string;
  caption?: string;
}

const PROFILE_URL = "https://www.instagram.com/quindicipizza/";

export default function InstagramFeed({ light = false }: { light?: boolean }) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [configured, setConfigured] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/instagram/posts")
      .then((r) => r.json())
      .then((d) => {
        setPosts(d.posts ?? []);
        setConfigured(d.configured ?? false);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const bg = light ? "#fdf8f2" : "#18120a";
  const textMain = light ? "#1c1917" : "#fff";
  const textSub = light ? "#78716c" : "#a8a29e";
  const borderCol = light ? "rgba(0,0,0,0.08)" : "rgba(255,255,255,0.08)";

  return (
    <section className="py-16 md:py-20" style={{ backgroundColor: bg }}>
      <div className="max-w-6xl mx-auto px-6">

        {/* Header */}
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
            className="flex items-center gap-2 text-sm font-semibold shrink-0 transition-colors"
            style={{ color: "#c5a485" }}
          >
            <Instagram className="w-4 h-4" />
            @quindicipizza
          </a>
        </motion.div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-3 gap-3 md:gap-4">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="aspect-square animate-pulse"
                style={{ backgroundColor: light ? "#e7e0d8" : "#2a1f12" }}
              />
            ))}
          </div>
        ) : posts.length > 0 ? (
          <div className="grid grid-cols-3 gap-3 md:gap-4">
            {posts.map((post, i) => {
              const imgSrc = post.media_type === "VIDEO" ? post.thumbnail_url : post.media_url;
              return (
                <motion.a
                  key={post.id}
                  href={post.permalink}
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-20px" }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="group relative aspect-square overflow-hidden block"
                  style={{ border: `1px solid ${borderCol}` }}
                >
                  {imgSrc && (
                    <img
                      src={imgSrc}
                      alt={post.caption?.slice(0, 60) ?? "Instagram Post"}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  )}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-300 flex items-center justify-center">
                    <Instagram className="w-7 h-7 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                </motion.a>
              );
            })}
          </div>
        ) : (
          /* Placeholder — no token configured */
          <div className="grid grid-cols-3 gap-3 md:gap-4">
            {[0, 1, 2].map((i) => (
              <motion.a
                key={i}
                href={PROFILE_URL}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-20px" }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="group relative aspect-square overflow-hidden flex items-center justify-center"
                style={{
                  backgroundColor: light ? "#ede8e0" : "#231810",
                  border: `1px solid ${borderCol}`,
                }}
              >
                <div className="flex flex-col items-center gap-2 opacity-40 group-hover:opacity-70 transition-opacity">
                  <Instagram className="w-8 h-8" style={{ color: textMain }} />
                  <span className="text-xs" style={{ color: textSub }}>@quindicipizza</span>
                </div>
              </motion.a>
            ))}
          </div>
        )}

        {/* CTA */}
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
            className="inline-flex items-center gap-2 text-sm font-semibold px-6 py-3 border transition-colors"
            style={{
              borderColor: "#c5a485",
              color: "#c5a485",
            }}
          >
            <Instagram className="w-4 h-4" />
            Alle Beiträge auf Instagram ansehen
          </a>
        </motion.div>

      </div>
    </section>
  );
}
