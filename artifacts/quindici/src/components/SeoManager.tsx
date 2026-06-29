import { useEffect } from "react";
import { useLocation } from "wouter";

const API = "/api";

interface SeoPage { title: string; description: string; keywords: string; }
interface SeoConfig {
  pages: Record<string, SeoPage>;
  google: { analyticsId: string; adsId: string; searchConsoleVerification: string; };
}

let cachedConfig: SeoConfig | null = null;

function setMeta(name: string, content: string) {
  if (!content) return;
  let el = document.querySelector<HTMLMetaElement>(`meta[name="${name}"]`);
  if (!el) { el = document.createElement("meta"); el.name = name; document.head.appendChild(el); }
  el.content = content;
}

function setMetaProp(property: string, content: string) {
  if (!content) return;
  let el = document.querySelector<HTMLMetaElement>(`meta[property="${property}"]`);
  if (!el) { el = document.createElement("meta"); el.setAttribute("property", property); document.head.appendChild(el); }
  el.content = content;
}

function injectGtag(id: string) {
  if (!id || document.getElementById(`gtag-${id}`)) return;
  const s = document.createElement("script");
  s.id = `gtag-${id}`;
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtag/js?id=${id}`;
  document.head.appendChild(s);

  if (!(window as any).gtag) {
    const init = document.createElement("script");
    init.id = "gtag-init";
    init.innerHTML = `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());`;
    document.head.appendChild(init);
  }
  (window as any).gtag?.("config", id);
}

function pathToPageKey(pathname: string): string {
  const clean = pathname.replace(/^\//, "").split("?")[0];
  if (!clean || clean === "") return "home";
  if (clean === "ueber-uns") return "ueber-uns";
  return clean;
}

function applySeo(config: SeoConfig, pathname: string) {
  const key = pathToPageKey(pathname);
  const page = config.pages[key];

  if (page?.title) {
    document.title = page.title;
    setMetaProp("og:title", page.title);
  }
  if (page?.description) {
    setMeta("description", page.description);
    setMetaProp("og:description", page.description);
  }
  if (page?.keywords) setMeta("keywords", page.keywords);

  const { analyticsId, adsId, searchConsoleVerification } = config.google;
  if (analyticsId) injectGtag(analyticsId);
  if (adsId) injectGtag(adsId);
  if (searchConsoleVerification) setMeta("google-site-verification", searchConsoleVerification);
}

export default function SeoManager() {
  const [location] = useLocation();

  useEffect(() => {
    async function load() {
      try {
        if (!cachedConfig) {
          const r = await fetch(`${API}/seo`);
          if (r.ok) cachedConfig = await r.json();
        }
        if (cachedConfig) applySeo(cachedConfig, location);
      } catch (_) {}
    }
    load();
  }, [location]);

  return null;
}
