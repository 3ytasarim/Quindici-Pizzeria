import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload, LogOut, FileText, CheckCircle, AlertCircle,
  Trash2, Eye, Lock, User, UtensilsCrossed, Plus, Pencil, X, Image,
  CalendarCheck, Bell, BellOff, Phone, Mail, Users, Clock, Calendar,
  RefreshCw, ChevronLeft, ChevronRight,
  ChevronUp, ChevronDown, Settings, Instagram, Copy, Search,
} from "lucide-react";

const API = "/api";
const GOLD = "#c5a485";
const POLL_INTERVAL = 2000;

function formatDate(iso: string | null) {
  if (!iso) return "—";
  return new Intl.DateTimeFormat("de-DE", {
    day: "2-digit", month: "long", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  }).format(new Date(iso));
}

function formatReservDate(iso: string) {
  return new Intl.DateTimeFormat("de-DE", {
    day: "2-digit", month: "long", year: "numeric",
  }).format(new Date(iso + "T12:00:00"));
}

function playAlertBeep() {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const playTone = (freq: number, start: number, dur: number) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.connect(g); g.connect(ctx.destination);
      o.frequency.value = freq;
      o.type = "sine";
      g.gain.setValueAtTime(0, ctx.currentTime + start);
      g.gain.linearRampToValueAtTime(0.4, ctx.currentTime + start + 0.01);
      g.gain.linearRampToValueAtTime(0, ctx.currentTime + start + dur);
      o.start(ctx.currentTime + start);
      o.stop(ctx.currentTime + start + dur + 0.05);
    };
    playTone(880, 0, 0.15);
    playTone(1100, 0.2, 0.15);
    playTone(880, 0.4, 0.15);
    playTone(1100, 0.6, 0.25);
  } catch (_) {}
}

interface Dish { id: string; name: string; desc: string; imageUrl: string; }

interface Reservation {
  id: string; date: string; time: string; guests: string;
  firstName: string; lastName: string; phone: string; email: string;
  notes: string; createdAt: string; seen: boolean;
  status: "neu" | "bestätigt" | "storniert";
}

type Tab = "mittagstisch" | "gerichte" | "reservierungen" | "einstellungen" | "seo";

const STATUS_LABELS: Record<Reservation["status"], string> = {
  neu: "Neu", bestätigt: "Bestätigt", storniert: "Storniert",
};
const STATUS_COLORS: Record<Reservation["status"], string> = {
  neu: "text-amber-400 bg-amber-500/10 border-amber-500/30",
  bestätigt: "text-green-400 bg-green-500/10 border-green-500/30",
  storniert: "text-red-400 bg-red-500/10 border-red-500/30",
};

export default function Admin() {
  const [token, setToken] = useState(() => sessionStorage.getItem("admin_token") ?? "");
  const [loginForm, setLoginForm] = useState({ username: "", password: "" });
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [tab, setTab] = useState<Tab>("mittagstisch");

  const [uploadedAt, setUploadedAt] = useState<string | null>(null);
  const [pdfAvailable, setPdfAvailable] = useState(false);
  const [pdfStatus, setPdfStatus] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [selectedPdf, setSelectedPdf] = useState<File | null>(null);
  const pdfRef = useRef<HTMLInputElement>(null);

  const [dishes, setDishes] = useState<Dish[]>([]);
  const [dishStatus, setDishStatus] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const [editingDish, setEditingDish] = useState<Dish | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [dishForm, setDishForm] = useState({ name: "", desc: "", imageUrl: "" });
  const [dishFile, setDishFile] = useState<File | null>(null);
  const [dishDragOver, setDishDragOver] = useState(false);
  const [dishUploading, setDishUploading] = useState(false);
  const dishFileRef = useRef<HTMLInputElement>(null);

  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [lastCount, setLastCount] = useState<number | null>(null);
  const [newBadge, setNewBadge] = useState(0);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [calendarDate, setCalendarDate] = useState(() => { const d = new Date(); d.setDate(1); return d; });
  const [selectedDay, setSelectedDay] = useState<string | null>(null);


  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const tokenRef = useRef(token);
  tokenRef.current = token;
  const soundRef = useRef(soundEnabled);
  soundRef.current = soundEnabled;
  const lastCountRef = useRef<number | null>(null);
  void lastCount; void setLastCount;

  const authHeaders = useCallback(() => ({ Authorization: `Bearer ${token}` }), [token]);

  // Wrapper: otomatik çıkış on 401
  const authedFetch = useCallback(async (url: string, opts: RequestInit = {}): Promise<Response> => {
    const t = tokenRef.current;
    const headers = { ...(opts.headers as Record<string, string> ?? {}), Authorization: `Bearer ${t}` };
    const r = await fetch(url, { ...opts, headers });
    if (r.status === 401) {
      sessionStorage.removeItem("admin_token");
      setToken("");
    }
    return r;
  }, []);

  const fetchPdfStatus = useCallback(async (t: string) => {
    const r = await fetch(`${API}/mittagstisch`, { headers: { Authorization: `Bearer ${t}` } });
    if (r.ok) { const d = await r.json(); setPdfAvailable(d.available); setUploadedAt(d.uploadedAt); }
  }, []);

  const fetchDishes = useCallback(async () => {
    const r = await fetch(`${API}/dishes`);
    if (r.ok) setDishes(await r.json());
  }, []);


  const fetchReservations = useCallback(async (silent = false) => {
    const t = tokenRef.current;
    if (!t) return;
    try {
      const r = await fetch(`${API}/admin/reservations`, { headers: { Authorization: `Bearer ${t}` } });
      if (r.status === 401) { sessionStorage.removeItem("admin_token"); setToken(""); return; }
      if (!r.ok) return;
      const data: Reservation[] = await r.json();
      setReservations(data);
      if (!silent) setLastRefresh(new Date());
      const unseenCount = data.filter(r => !r.seen).length;
      setNewBadge(unseenCount);
      if (lastCountRef.current !== null && unseenCount > lastCountRef.current) {
        if (soundRef.current) playAlertBeep();
      }
      lastCountRef.current = unseenCount;
    } catch (_) {}
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true); setLoginError("");
    try {
      const r = await fetch(`${API}/admin/login`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginForm),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error ?? "Fehler");
      sessionStorage.setItem("admin_token", d.token);
      setToken(d.token);
      fetchPdfStatus(d.token);
      fetchDishes();
    } catch (err: any) { setLoginError(err.message ?? "Anmeldung fehlgeschlagen"); }
    finally { setLoginLoading(false); }
  };

  useEffect(() => {
    if (token) { fetchPdfStatus(token); fetchDishes(); fetchReservations(); }
  }, [token, fetchPdfStatus, fetchDishes, fetchReservations]);

  useEffect(() => {
    if (!token) return;
    pollRef.current = setInterval(() => fetchReservations(true), POLL_INTERVAL);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [token, fetchReservations]);

  const handleLogout = () => { sessionStorage.removeItem("admin_token"); setToken(""); };

  const handleTabChange = async (t: Tab) => {
    setTab(t);
    if (t === "reservierungen" && newBadge > 0) {
      const unseen = reservations.filter(r => !r.seen);
      await Promise.all(unseen.map(r =>
        authedFetch(`${API}/admin/reservations/${r.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ seen: true }),
        })
      ));
      setNewBadge(0);
      lastCountRef.current = 0;
      setReservations(prev => prev.map(r => ({ ...r, seen: true })));
    }
  };

  const updateReservationStatus = async (id: string, status: Reservation["status"]) => {
    await authedFetch(`${API}/admin/reservations/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setReservations(prev => prev.map(r => r.id === id ? { ...r, status } : r));
  };

  const deleteReservation = async (id: string) => {
    if (!confirm("Reservierung löschen?")) return;
    await authedFetch(`${API}/admin/reservations/${id}`, { method: "DELETE" });
    setReservations(prev => prev.filter(r => r.id !== id));
  };

  const handlePdfUpload = async (file: File) => {
    if (file.type !== "application/pdf") { setPdfStatus({ type: "error", msg: "Bitte eine gültige PDF-Datei auswählen." }); return; }
    setUploading(true); setPdfStatus(null);
    const form = new FormData(); form.append("pdf", file);
    try {
      const r = await authedFetch(`${API}/admin/mittagstisch`, { method: "POST", body: form });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error ?? "Upload fehlgeschlagen");
      setPdfStatus({ type: "success", msg: "PDF erfolgreich hochgeladen!" });
      setSelectedPdf(null); fetchPdfStatus(token);
    } catch (err: any) { setPdfStatus({ type: "error", msg: err.message }); }
    finally { setUploading(false); }
  };

  const handlePdfDelete = async () => {
    if (!confirm("Aktuelles PDF löschen?")) return;
    await authedFetch(`${API}/admin/mittagstisch`, { method: "DELETE" });
    setPdfStatus({ type: "success", msg: "PDF gelöscht." }); fetchPdfStatus(token);
  };

  const openNewForm = () => {
    setEditingDish(null); setDishForm({ name: "", desc: "", imageUrl: "" });
    setDishFile(null); setDishStatus(null); setShowForm(true);
  };
  const openEditForm = (dish: Dish) => {
    setEditingDish(dish); setDishForm({ name: dish.name, desc: dish.desc, imageUrl: dish.imageUrl });
    setDishFile(null); setDishStatus(null); setShowForm(true);
  };
  const handleDishSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setDishUploading(true); setDishStatus(null);
    const form = new FormData();
    form.append("name", dishForm.name); form.append("desc", dishForm.desc);
    if (dishFile) form.append("image", dishFile);
    else if (dishForm.imageUrl) form.append("imageUrl", dishForm.imageUrl);
    try {
      const url = editingDish ? `${API}/dishes/${editingDish.id}` : `${API}/dishes`;
      const method = editingDish ? "PUT" : "POST";
      const r = await authedFetch(url, { method, body: form });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error ?? "Fehler");
      setDishStatus({ type: "success", msg: editingDish ? "Gericht aktualisiert." : "Gericht hinzugefügt." });
      setShowForm(false); fetchDishes();
    } catch (err: any) { setDishStatus({ type: "error", msg: err.message }); }
    finally { setDishUploading(false); }
  };
  const handleDishDelete = async (id: string) => {
    if (!confirm("Dieses Gericht löschen?")) return;
    await authedFetch(`${API}/dishes/${id}`, { method: "DELETE" });
    fetchDishes();
  };

  // ── LOGIN ──
  if (!token) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center px-4">
        <motion.div initial={{ opacity: 0, y: 32 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="w-full max-w-md">
          <div className="text-center mb-10">
            <img src="/logo.png" alt="Quindici" className="h-20 w-auto mx-auto mb-6 opacity-90" />
            <h1 className="text-2xl font-semibold text-white tracking-wide">Admin-Bereich</h1>
            <p className="text-zinc-400 text-sm mt-1">Melden Sie sich an, um fortzufahren</p>
          </div>
          <form onSubmit={handleLogin} className="bg-[#1a1a1a] border border-white/8 p-6 sm:p-8 shadow-2xl">
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-zinc-400 uppercase tracking-widest mb-2">Benutzername</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <input type="text" value={loginForm.username} onChange={e => setLoginForm(f => ({ ...f, username: e.target.value }))}
                    className="w-full bg-[#111] border border-white/10 text-white pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-[#c5a485] transition-colors" placeholder="admin" required />
                </div>
              </div>
              <div>
                <label className="block text-xs text-zinc-400 uppercase tracking-widest mb-2">Passwort</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <input type="password" value={loginForm.password} onChange={e => setLoginForm(f => ({ ...f, password: e.target.value }))}
                    className="w-full bg-[#111] border border-white/10 text-white pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-[#c5a485] transition-colors" placeholder="••••••••" required />
                </div>
              </div>
            </div>
            <AnimatePresence>
              {loginError && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                  className="mt-4 flex items-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 px-3 py-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />{loginError}
                </motion.div>
              )}
            </AnimatePresence>
            <button type="submit" disabled={loginLoading}
              className="mt-6 w-full py-3 text-sm font-semibold uppercase tracking-widest text-black transition-all disabled:opacity-50"
              style={{ backgroundColor: GOLD }}>
              {loginLoading ? "Wird geprüft…" : "Anmelden"}
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  // ── ADMIN PANEL ──
  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white">

      {/* Topbar */}
      <div className="border-b border-white/8 bg-[#1a1a1a]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <img src="/logo.png" alt="Quindici" className="h-7 sm:h-9 w-auto opacity-80 shrink-0" />
            <span className="text-xs sm:text-sm text-zinc-400 font-medium truncate">Admin-Panel</span>
          </div>
          <button onClick={handleLogout}
            className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors uppercase tracking-widest shrink-0">
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Abmelden</span>
          </button>
        </div>
      </div>

      {/* Tabs — scrollable on mobile */}
      <div className="border-b border-white/8 bg-[#151515]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="flex overflow-x-auto scrollbar-none -mb-px">
            {(
              [
                ["mittagstisch", "PDF", "Mittagstisch PDF", FileText, 0],
                ["reservierungen", "Reserv.", "Reservierungen", CalendarCheck, newBadge],
                ["gerichte", "Gerichte", "Lieblingsgerichte", UtensilsCrossed, 0],
                ["einstellungen", "Einst.", "Einstellungen", Settings, 0],
                ["seo", "SEO", "SEO & Analytics", Search, 0],
              ] as const
            ).map(([id, shortLabel, fullLabel, Icon, badge]) => (
              <button key={id} onClick={() => handleTabChange(id as Tab)}
                className={`relative flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-3.5 sm:py-4 text-[11px] sm:text-xs uppercase tracking-widest font-semibold border-b-2 transition-colors whitespace-nowrap shrink-0 ${tab === id ? "border-[#c5a485] text-[#c5a485]" : "border-transparent text-zinc-500 hover:text-zinc-300"}`}>
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span className="sm:hidden">{shortLabel}</span>
                <span className="hidden sm:inline">{fullLabel}</span>
                {badge > 0 && (
                  <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full text-black leading-none"
                    style={{ backgroundColor: GOLD }}>{badge}</span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-10">

        {/* ── MITTAGSTISCH ── */}
        {tab === "mittagstisch" && (
          <>
            <div className="mb-6 sm:mb-8">
              <h2 className="text-lg sm:text-xl font-semibold">Mittagstisch PDF</h2>
              <p className="text-zinc-400 text-sm mt-1">Laden Sie jede Woche das aktuelle Mittagstisch-PDF hoch.</p>
            </div>
            <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
              {/* Status */}
              <div className="bg-[#1a1a1a] border border-white/8 p-5 sm:p-6">
                <h3 className="text-xs uppercase tracking-widest text-zinc-400 mb-4">Aktueller Status</h3>
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className={`p-2.5 sm:p-3 shrink-0 ${pdfAvailable ? "bg-green-500/10" : "bg-zinc-800"}`}>
                    <FileText className={`w-5 h-5 sm:w-6 sm:h-6 ${pdfAvailable ? "text-green-400" : "text-zinc-500"}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{pdfAvailable ? "PDF verfügbar" : "Kein PDF hochgeladen"}</p>
                    <p className="text-xs text-zinc-500 mt-0.5 break-words">
                      {pdfAvailable ? `Hochgeladen: ${formatDate(uploadedAt)}` : "Noch keine Datei vorhanden"}
                    </p>
                  </div>
                </div>
                {pdfAvailable && (
                  <div className="flex flex-wrap gap-2 mt-4 sm:mt-5">
                    <a href="/api/mittagstisch/pdf" target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-xs px-3 py-2 border border-[#c5a485]/40 text-[#c5a485] hover:bg-[#c5a485]/10 transition-colors">
                      <Eye className="w-3.5 h-3.5" />Vorschau
                    </a>
                    <button onClick={handlePdfDelete}
                      className="flex items-center gap-1.5 text-xs px-3 py-2 border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />Löschen
                    </button>
                  </div>
                )}
              </div>
              {/* Upload */}
              <div className="bg-[#1a1a1a] border border-white/8 p-5 sm:p-6">
                <h3 className="text-xs uppercase tracking-widest text-zinc-400 mb-4">Neues PDF hochladen</h3>
                <div onDragOver={e => { e.preventDefault(); setDragOver(true); }} onDragLeave={() => setDragOver(false)}
                  onDrop={e => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) setSelectedPdf(f); }}
                  onClick={() => pdfRef.current?.click()}
                  className={`border-2 border-dashed p-6 sm:p-8 text-center cursor-pointer transition-all ${dragOver ? "border-[#c5a485] bg-[#c5a485]/5" : selectedPdf ? "border-green-500/50 bg-green-500/5" : "border-white/15 hover:border-white/30"}`}>
                  <input ref={pdfRef} type="file" accept=".pdf,application/pdf" className="hidden" onChange={e => e.target.files?.[0] && setSelectedPdf(e.target.files[0])} />
                  {selectedPdf ? (
                    <div><CheckCircle className="w-7 h-7 sm:w-8 sm:h-8 text-green-400 mx-auto mb-2" />
                      <p className="text-sm font-medium truncate">{selectedPdf.name}</p>
                      <p className="text-xs text-zinc-500 mt-1">{(selectedPdf.size / 1024).toFixed(0)} KB</p>
                    </div>
                  ) : (
                    <div><Upload className="w-7 h-7 sm:w-8 sm:h-8 text-zinc-500 mx-auto mb-2" />
                      <p className="text-sm text-zinc-300">PDF hierher ziehen</p>
                      <p className="text-xs text-zinc-500 mt-1">oder klicken zum Auswählen</p>
                    </div>
                  )}
                </div>
                <AnimatePresence>
                  {pdfStatus && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                      className={`mt-3 flex items-start gap-2 text-sm px-3 py-2 ${pdfStatus.type === "success" ? "bg-green-500/10 border border-green-500/20 text-green-400" : "bg-red-500/10 border border-red-500/20 text-red-400"}`}>
                      {pdfStatus.type === "success" ? <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" /> : <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />}
                      {pdfStatus.msg}
                    </motion.div>
                  )}
                </AnimatePresence>
                <button disabled={!selectedPdf || uploading} onClick={() => selectedPdf && handlePdfUpload(selectedPdf)}
                  className="mt-4 w-full py-3 text-sm font-semibold uppercase tracking-widest text-black transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{ backgroundColor: GOLD }}>
                  {uploading ? "Wird hochgeladen…" : "PDF hochladen"}
                </button>
              </div>
            </div>
          </>
        )}

        {/* ── GERICHTE ── */}
        {tab === "gerichte" && (
          <>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6 sm:mb-8">
              <div>
                <h2 className="text-lg sm:text-xl font-semibold">Lieblingsgerichte</h2>
                <p className="text-zinc-400 text-sm mt-1">Gerichte im Carousel verwalten – hinzufügen, bearbeiten, löschen.</p>
              </div>
              <button onClick={openNewForm}
                className="flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold uppercase tracking-widest text-black w-full sm:w-auto"
                style={{ backgroundColor: GOLD }}>
                <Plus className="w-4 h-4" />Neues Gericht
              </button>
            </div>
            <AnimatePresence>
              {dishStatus && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                  className={`mb-4 flex items-start gap-2 text-sm px-3 py-2 ${dishStatus.type === "success" ? "bg-green-500/10 border border-green-500/20 text-green-400" : "bg-red-500/10 border border-red-500/20 text-red-400"}`}>
                  {dishStatus.type === "success" ? <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" /> : <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />}
                  {dishStatus.msg}
                </motion.div>
              )}
            </AnimatePresence>
            <AnimatePresence>
              {showForm && (
                <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}
                  className="bg-[#1a1a1a] border border-white/8 p-5 sm:p-6 mb-6">
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="text-sm font-semibold uppercase tracking-widest text-zinc-300">
                      {editingDish ? "Gericht bearbeiten" : "Neues Gericht"}
                    </h3>
                    <button onClick={() => setShowForm(false)} className="text-zinc-500 hover:text-white transition-colors p-1">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <form onSubmit={handleDishSubmit} className="grid sm:grid-cols-2 gap-4 sm:gap-5">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs text-zinc-400 uppercase tracking-widest mb-2">Name *</label>
                        <input type="text" value={dishForm.name} onChange={e => setDishForm(f => ({ ...f, name: e.target.value }))} required
                          className="w-full bg-[#111] border border-white/10 text-white px-4 py-2.5 text-sm focus:outline-none focus:border-[#c5a485] transition-colors" placeholder="z.B. Margherita" />
                      </div>
                      <div>
                        <label className="block text-xs text-zinc-400 uppercase tracking-widest mb-2">Beschreibung</label>
                        <textarea value={dishForm.desc} onChange={e => setDishForm(f => ({ ...f, desc: e.target.value }))} rows={3}
                          className="w-full bg-[#111] border border-white/10 text-white px-4 py-2.5 text-sm focus:outline-none focus:border-[#c5a485] transition-colors resize-none"
                          placeholder="Zutaten oder kurze Beschreibung" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs text-zinc-400 uppercase tracking-widest mb-2">Foto</label>
                      <div onDragOver={e => { e.preventDefault(); setDishDragOver(true); }} onDragLeave={() => setDishDragOver(false)}
                        onDrop={e => { e.preventDefault(); setDishDragOver(false); const f = e.dataTransfer.files[0]; if (f) setDishFile(f); }}
                        onClick={() => dishFileRef.current?.click()}
                        className={`border-2 border-dashed p-5 text-center cursor-pointer transition-all h-[130px] sm:h-[140px] flex flex-col items-center justify-center ${dishDragOver ? "border-[#c5a485] bg-[#c5a485]/5" : dishFile ? "border-green-500/50 bg-green-500/5" : "border-white/15 hover:border-white/30"}`}>
                        <input ref={dishFileRef} type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && setDishFile(e.target.files[0])} />
                        {dishFile
                          ? (<><CheckCircle className="w-6 h-6 text-green-400 mb-1.5" /><p className="text-xs font-medium truncate max-w-full px-2">{dishFile.name}</p></>)
                          : editingDish?.imageUrl
                          ? (<><img src={editingDish.imageUrl} alt="" className="h-14 w-14 object-cover mb-1.5" /><p className="text-xs text-zinc-500">Klicken zum Ersetzen</p></>)
                          : (<><Image className="w-6 h-6 text-zinc-500 mb-1.5" /><p className="text-xs text-zinc-400">Bild hochladen</p></>)}
                      </div>
                      {!dishFile && (
                        <div className="mt-2">
                          <input type="text" value={dishForm.imageUrl} onChange={e => setDishForm(f => ({ ...f, imageUrl: e.target.value }))}
                            className="w-full bg-[#111] border border-white/10 text-white px-3 py-2 text-xs focus:outline-none focus:border-[#c5a485] transition-colors"
                            placeholder="oder Bild-URL eingeben" />
                        </div>
                      )}
                    </div>
                    <div className="sm:col-span-2 flex flex-col sm:flex-row gap-3 sm:justify-end pt-2">
                      <button type="button" onClick={() => setShowForm(false)}
                        className="w-full sm:w-auto px-5 py-2.5 text-xs font-semibold uppercase tracking-widest text-zinc-400 border border-white/10 hover:border-white/25 transition-colors">
                        Abbrechen
                      </button>
                      <button type="submit" disabled={dishUploading}
                        className="w-full sm:w-auto px-6 py-2.5 text-xs font-semibold uppercase tracking-widest text-black disabled:opacity-50"
                        style={{ backgroundColor: GOLD }}>
                        {dishUploading ? "Wird gespeichert…" : editingDish ? "Speichern" : "Hinzufügen"}
                      </button>
                    </div>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {dishes.map(dish => (
                <motion.div key={dish.id} layout className="bg-[#1a1a1a] border border-white/8 overflow-hidden group">
                  <div className="relative h-40 sm:h-44 overflow-hidden">
                    <img src={dish.imageUrl} alt={dish.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  </div>
                  <div className="p-4">
                    <p className="font-semibold text-sm text-white leading-tight mb-1">{dish.name}</p>
                    <p className="text-xs text-zinc-400 leading-snug line-clamp-2">{dish.desc}</p>
                    <div className="flex gap-2 mt-4">
                      <button onClick={() => openEditForm(dish)}
                        className="flex items-center gap-1.5 text-xs px-3 py-1.5 border border-[#c5a485]/40 text-[#c5a485] hover:bg-[#c5a485]/10 transition-colors">
                        <Pencil className="w-3 h-3" />Bearbeiten
                      </button>
                      <button onClick={() => handleDishDelete(dish.id)}
                        className="flex items-center gap-1.5 text-xs px-3 py-1.5 border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors">
                        <Trash2 className="w-3 h-3" />Löschen
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </>
        )}

        {/* ── RESERVIERUNGEN ── */}
        {tab === "reservierungen" && (() => {
          /* ── calendar helpers ── */
          const year = calendarDate.getFullYear();
          const month = calendarDate.getMonth();
          const firstWeekday = new Date(year, month, 1).getDay(); // 0=Sun
          // shift so Monday=0
          const startOffset = (firstWeekday + 6) % 7;
          const daysInMonth = new Date(year, month + 1, 0).getDate();
          const totalCells = Math.ceil((startOffset + daysInMonth) / 7) * 7;

          // per-day counts
          const countsByDay: Record<string, { bestätigt: number; neu: number; total: number }> = {};
          reservations.forEach(r => {
            if (!countsByDay[r.date]) countsByDay[r.date] = { bestätigt: 0, neu: 0, total: 0 };
            countsByDay[r.date].total++;
            if (r.status === "bestätigt") countsByDay[r.date].bestätigt++;
            if (r.status === "neu") countsByDay[r.date].neu++;
          });

          const todayStr = new Date().toISOString().slice(0, 10);
          const monthNames = ["Januar","Februar","März","April","Mai","Juni","Juli","August","September","Oktober","November","Dezember"];
          const dayLabels = ["Mo","Di","Mi","Do","Fr","Sa","So"];

          const filteredReservations = selectedDay
            ? reservations.filter(r => r.date === selectedDay)
            : reservations;

          return (
            <>
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-6">
                <div>
                  <h2 className="text-lg sm:text-xl font-semibold">Reservierungen</h2>
                  <p className="text-zinc-400 text-sm mt-1 flex items-center gap-1.5 flex-wrap">
                    <RefreshCw className="w-3 h-3 animate-spin shrink-0" style={{ animationDuration: "3s" }} />
                    Echtzeit alle 2 Sek.
                    {lastRefresh && <span className="text-zinc-600">— {lastRefresh.toLocaleTimeString("de-DE")}</span>}
                  </p>
                </div>
                <button
                  onClick={() => setSoundEnabled(s => !s)}
                  className={`flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold uppercase tracking-widest border transition-colors shrink-0 ${soundEnabled ? "border-[#c5a485]/40 text-[#c5a485]" : "border-white/10 text-zinc-500"}`}>
                  {soundEnabled ? <Bell className="w-3.5 h-3.5" /> : <BellOff className="w-3.5 h-3.5" />}
                  {soundEnabled ? "Ton an" : "Ton aus"}
                </button>
              </div>

              {/* ── CALENDAR ── */}
              <div className="bg-[#1a1a1a] border border-white/8 rounded-xl p-4 sm:p-5 mb-6">
                {/* Month nav */}
                <div className="flex items-center justify-between mb-4">
                  <button
                    onClick={() => setCalendarDate(d => { const n = new Date(d); n.setMonth(n.getMonth() - 1); return n; })}
                    className="p-1.5 text-zinc-400 hover:text-white hover:bg-white/6 rounded-lg transition-colors">
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-sm font-semibold tracking-wide">{monthNames[month]} {year}</span>
                  <button
                    onClick={() => setCalendarDate(d => { const n = new Date(d); n.setMonth(n.getMonth() + 1); return n; })}
                    className="p-1.5 text-zinc-400 hover:text-white hover:bg-white/6 rounded-lg transition-colors">
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                {/* Day labels */}
                <div className="grid grid-cols-7 mb-1">
                  {dayLabels.map(d => (
                    <div key={d} className="text-center text-[10px] uppercase tracking-widest text-zinc-600 pb-2">{d}</div>
                  ))}
                </div>

                {/* Day cells */}
                <div className="grid grid-cols-7 gap-0.5">
                  {Array.from({ length: totalCells }).map((_, i) => {
                    const dayNum = i - startOffset + 1;
                    if (dayNum < 1 || dayNum > daysInMonth) {
                      return <div key={i} className="aspect-square" />;
                    }
                    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`;
                    const counts = countsByDay[dateStr];
                    const isToday = dateStr === todayStr;
                    const isSelected = selectedDay === dateStr;

                    return (
                      <button
                        key={i}
                        onClick={() => setSelectedDay(prev => prev === dateStr ? null : dateStr)}
                        className={`relative aspect-square flex flex-col items-center justify-center rounded-lg transition-all text-xs font-medium
                          ${isSelected ? "ring-2 ring-[#c5a485] bg-[#c5a485]/15 text-white"
                            : isToday ? "bg-white/6 text-white"
                            : counts ? "hover:bg-white/6 text-zinc-200"
                            : "hover:bg-white/4 text-zinc-600"}`}
                      >
                        <span className={`text-[11px] sm:text-xs leading-none mb-0.5 ${isToday && !isSelected ? "font-bold" : ""}`}>{dayNum}</span>
                        {counts && (
                          <div className="flex gap-0.5 mt-0.5">
                            {counts.bestätigt > 0 && (
                              <span className="inline-flex items-center justify-center min-w-[14px] h-3.5 px-1 rounded-full text-[9px] font-bold bg-green-500/80 text-white leading-none">
                                {counts.bestätigt}
                              </span>
                            )}
                            {counts.neu > 0 && (
                              <span className="inline-flex items-center justify-center min-w-[14px] h-3.5 px-1 rounded-full text-[9px] font-bold text-black leading-none"
                                style={{ backgroundColor: GOLD }}>
                                {counts.neu}
                              </span>
                            )}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Legend */}
                <div className="flex items-center gap-4 mt-4 pt-3 border-t border-white/6 text-[10px] text-zinc-500">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-green-500/80 inline-block" />Bestätigt
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: GOLD }} />Neu / Ausstehend
                  </span>
                  {selectedDay && (
                    <button onClick={() => setSelectedDay(null)}
                      className="ml-auto flex items-center gap-1 text-[#c5a485] hover:text-white transition-colors">
                      <X className="w-3 h-3" />Filter aufheben
                    </button>
                  )}
                </div>
              </div>

              {/* Selected day heading */}
              {selectedDay && (
                <div className="flex items-center gap-2 mb-4">
                  <Calendar className="w-4 h-4 shrink-0" style={{ color: GOLD }} />
                  <span className="text-sm font-semibold">{formatReservDate(selectedDay)}</span>
                  <span className="text-xs text-zinc-500">
                    — {filteredReservations.length} {filteredReservations.length === 1 ? "Reservierung" : "Reservierungen"}
                  </span>
                </div>
              )}

              {/* List */}
              {filteredReservations.length === 0 ? (
                <div className="text-center py-14 bg-[#1a1a1a] border border-white/8 rounded-xl">
                  <CalendarCheck className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
                  <p className="text-zinc-400 text-sm">
                    {selectedDay ? "Keine Reservierungen für diesen Tag." : "Noch keine Reservierungen eingegangen."}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredReservations.map(r => (
                    <motion.div
                      key={r.id}
                      layout
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`bg-[#1a1a1a] border p-4 sm:p-5 transition-colors rounded-xl ${!r.seen ? "border-[#c5a485]/40" : "border-white/8"}`}
                    >
                      <div className="flex items-center gap-2 flex-wrap mb-3">
                        {!r.seen && (
                          <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 text-black rounded-sm"
                            style={{ backgroundColor: GOLD }}>NEU</span>
                        )}
                        <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 border rounded-sm ${STATUS_COLORS[r.status]}`}>
                          {STATUS_LABELS[r.status]}
                        </span>
                      </div>

                      <div className="grid sm:grid-cols-2 gap-x-6 gap-y-2 mb-3">
                        <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-sm">
                          <span className="flex items-center gap-1.5 font-semibold text-white">
                            <Calendar className="w-3.5 h-3.5 shrink-0" style={{ color: GOLD }} />
                            {formatReservDate(r.date)}
                          </span>
                          <span className="flex items-center gap-1.5 text-zinc-300">
                            <Clock className="w-3.5 h-3.5 text-zinc-500 shrink-0" />{r.time} Uhr
                          </span>
                          <span className="flex items-center gap-1.5 text-zinc-300">
                            <Users className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                            {r.guests} {r.guests === "1" ? "Person" : "Personen"}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-sm text-zinc-300">
                          <span className="flex items-center gap-1.5">
                            <User className="w-3.5 h-3.5 shrink-0" />{r.firstName} {r.lastName}
                          </span>
                          <a href={`tel:${r.phone}`} className="flex items-center gap-1.5 hover:text-[#c5a485] transition-colors">
                            <Phone className="w-3.5 h-3.5 shrink-0" />{r.phone}
                          </a>
                          <a href={`mailto:${r.email}`} className="flex items-center gap-1.5 hover:text-[#c5a485] transition-colors break-all">
                            <Mail className="w-3.5 h-3.5 shrink-0" />{r.email}
                          </a>
                        </div>
                      </div>

                      {r.notes && <p className="text-sm text-zinc-400 italic mb-2">"{r.notes}"</p>}
                      <p className="text-xs text-zinc-500 mb-3">Eingegangen: {formatDate(r.createdAt)}</p>

                      <div className="flex flex-wrap gap-2 pt-3 border-t border-white/6">
                        {r.status !== "bestätigt" && (
                          <button onClick={() => updateReservationStatus(r.id, "bestätigt")}
                            className="flex items-center gap-1.5 text-xs px-3 py-1.5 border border-green-500/30 text-green-400 hover:bg-green-500/10 transition-colors">
                            <CheckCircle className="w-3 h-3" />Bestätigen
                          </button>
                        )}
                        {r.status !== "storniert" && (
                          <button onClick={() => updateReservationStatus(r.id, "storniert")}
                            className="flex items-center gap-1.5 text-xs px-3 py-1.5 border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors">
                            <X className="w-3 h-3" />Stornieren
                          </button>
                        )}
                        <button onClick={() => deleteReservation(r.id)}
                          className="flex items-center gap-1.5 text-xs px-3 py-1.5 border border-white/10 text-zinc-500 hover:text-red-400 hover:border-red-500/30 transition-colors">
                          <Trash2 className="w-3 h-3" />Löschen
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </>
          );
        })()}

        {/* ── EINSTELLUNGEN ── */}
        {tab === "einstellungen" && (
          <SettingsPanel adminToken={sessionStorage.getItem("admin_token") ?? ""} />
        )}

        {tab === "seo" && <SeoTab authedFetch={authedFetch} />}

      </div>
    </div>
  );
}

/* ═══════════════════════════ SETTINGS PANEL ═══════════════════════════════ */
function SettingsPanel({ adminToken }: { adminToken: string }) {
  return (
    <div className="max-w-2xl mx-auto space-y-3">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-1" style={{ fontFamily: "'Playfair Display', serif" }}>
          Einstellungen
        </h2>
        <p className="text-sm text-zinc-500">Website-Konfiguration und Integrationen verwalten.</p>
      </div>
      <InstagramPostPicker adminToken={adminToken} />
      <InstagramSettings adminToken={adminToken} />
    </div>
  );
}

/* ─────────────────────── Instagram Post Picker ──────────────────────── */
interface IGPost { id: string; media_type: string; media_url: string; thumbnail_url?: string; permalink: string; caption?: string; timestamp?: string }

function InstagramPostPicker({ adminToken }: { adminToken: string }) {
  const [open, setOpen] = useState(false);
  const [posts, setPosts] = useState<IGPost[]>([]);
  const [pinnedIds, setPinnedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    if (posts.length > 0) return;
    setLoading(true); setError(null);
    try {
      const r = await fetch("/api/admin/instagram/all-posts", { headers: { Authorization: `Bearer ${adminToken}` } });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error ?? "Fehler");
      setPosts(d.posts ?? []);
      setPinnedIds(d.pinnedIds ?? []);
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  }

  function toggle(id: string) {
    setPinnedIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 3) return [...prev.slice(1), id];
      return [...prev, id];
    });
  }

  async function save() {
    setSaving(true); setSaved(false);
    try {
      const r = await fetch("/api/admin/instagram/pinned", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${adminToken}` },
        body: JSON.stringify({ ids: pinnedIds }),
      });
      if (!r.ok) throw new Error("Fehler beim Speichern");
      setSaved(true); setTimeout(() => setSaved(false), 3000);
    } catch (e: any) { setError(e.message); }
    finally { setSaving(false); }
  }

  useEffect(() => { if (open) load(); }, [open]);

  return (
    <div className="border border-white/8 rounded-xl overflow-hidden bg-[#111]">
      <button onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-white/[0.02] transition-colors">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: "rgba(197,164,133,0.15)" }}>
            <Image className="w-4 h-4" style={{ color: "#c5a485" }} />
          </div>
          <div className="text-left">
            <p className="text-sm font-semibold text-white">Angezeigte Beiträge</p>
            <p className="text-xs text-zinc-500 mt-0.5">
              {pinnedIds.length > 0 ? `${pinnedIds.length} Beitrag${pinnedIds.length > 1 ? "e" : ""} ausgewählt` : "Automatisch (neueste 3)"}
            </p>
          </div>
        </div>
        <ChevronDown className={`w-4 h-4 text-zinc-500 transition-transform duration-300 ${open ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }} className="overflow-hidden">
            <div className="px-5 pb-5 pt-1 border-t border-white/8 space-y-4">
              <p className="text-xs text-zinc-500 leading-relaxed pt-2">
                Wählen Sie bis zu <strong className="text-zinc-300">3 Beiträge</strong> aus, die auf der Website angezeigt werden sollen. Die Reihenfolge entspricht Ihrer Auswahl.
              </p>

              {loading && (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="w-5 h-5 animate-spin text-zinc-500" />
                  <span className="ml-2 text-sm text-zinc-500">Beiträge werden geladen…</span>
                </div>
              )}

              {error && (
                <div className="flex items-center gap-2 text-xs text-red-400 bg-red-900/20 border border-red-800/30 rounded-lg px-3 py-2">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  {error}
                </div>
              )}

              {!loading && posts.length > 0 && (
                <>
                  {/* Selection order indicator */}
                  {pinnedIds.length > 0 && (
                    <div className="flex items-center gap-2">
                      {pinnedIds.map((id, i) => {
                        const p = posts.find((x) => x.id === id);
                        const thumb = p?.media_type === "VIDEO" ? p.thumbnail_url : p?.media_url;
                        return (
                          <div key={id} className="relative">
                            <div className="w-12 h-12 rounded-lg overflow-hidden border-2" style={{ borderColor: "#c5a485" }}>
                              {thumb ? <img src={thumb} className="w-full h-full object-cover" alt="" /> : <div className="w-full h-full bg-zinc-800" />}
                            </div>
                            <span className="absolute -top-1.5 -left-1.5 w-4 h-4 rounded-full text-[9px] font-bold flex items-center justify-center text-black"
                              style={{ backgroundColor: "#c5a485" }}>{i + 1}</span>
                          </div>
                        );
                      })}
                      <button onClick={() => setPinnedIds([])} className="text-xs text-zinc-600 hover:text-zinc-400 ml-1">Auswahl zurücksetzen</button>
                    </div>
                  )}

                  {/* Grid of all posts */}
                  <div className="grid grid-cols-4 gap-2">
                    {posts.map((post) => {
                      const thumb = post.media_type === "VIDEO" ? post.thumbnail_url : post.media_url;
                      const idx = pinnedIds.indexOf(post.id);
                      const selected = idx !== -1;
                      return (
                        <button key={post.id} onClick={() => toggle(post.id)}
                          className="relative aspect-square rounded-lg overflow-hidden group"
                          style={{ border: selected ? "2px solid #c5a485" : "2px solid transparent", outline: "none" }}>
                          {thumb
                            ? <img src={thumb} alt="" className="w-full h-full object-cover" />
                            : <div className="w-full h-full bg-zinc-800 flex items-center justify-center"><Instagram className="w-4 h-4 text-zinc-600" /></div>}
                          {/* overlay */}
                          <div className={`absolute inset-0 transition-colors ${selected ? "bg-black/30" : "bg-black/0 group-hover:bg-black/20"}`} />
                          {selected && (
                            <span className="absolute top-1 left-1 w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center text-black z-10"
                              style={{ backgroundColor: "#c5a485" }}>{idx + 1}</span>
                          )}
                          {post.media_type === "VIDEO" && (
                            <span className="absolute bottom-1 right-1 text-[8px] bg-black/60 text-white px-1 rounded font-bold">REEL</span>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  <button onClick={save} disabled={saving}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-opacity disabled:opacity-40"
                    style={{ backgroundColor: "#c5a485", color: "#1c1917" }}>
                    {saving ? <><RefreshCw className="w-4 h-4 animate-spin" /> Wird gespeichert…</> : <><CheckCircle className="w-4 h-4" /> Auswahl speichern</>}
                  </button>

                  {saved && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      className="flex items-center gap-2 text-xs text-green-400 bg-green-900/20 border border-green-800/30 rounded-lg px-3 py-2">
                      <CheckCircle className="w-3.5 h-3.5" />
                      Auswahl gespeichert. Die Website zeigt jetzt Ihre ausgewählten Beiträge.
                    </motion.div>
                  )}
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─────────────────────── Instagram Settings Card ──────────────────────── */
function InstagramSettings({ adminToken }: { adminToken: string }) {
  const [open, setOpen] = useState(false);
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<{ configured: boolean; savedAt: string | null; expiresInDays: number | null } | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch("/api/admin/instagram/status", { headers: { Authorization: `Bearer ${adminToken}` } })
      .then((r) => r.json())
      .then((d) => setStatus(d))
      .catch(() => {});
  }, [saved]);

  async function handleSave() {
    if (!token.trim()) return;
    setLoading(true); setError(null); setSaved(false);
    try {
      const res = await fetch("/api/admin/instagram/save-token", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${adminToken}` },
        body: JSON.stringify({ shortToken: token.trim() }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error ?? "Fehler beim Speichern");
      setSaved(true);
      setToken("");
      setTimeout(() => setSaved(false), 4000);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  const daysLeft = status?.expiresInDays ?? null;
  const isExpiringSoon = daysLeft !== null && daysLeft < 10;

  return (
    <div className="border border-white/8 rounded-xl overflow-hidden bg-[#111]">
      {/* Card Header */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-white/[0.02] transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: "rgba(197,164,133,0.15)" }}>
            <Instagram className="w-4 h-4" style={{ color: "#c5a485" }} />
          </div>
          <div className="text-left">
            <p className="text-sm font-semibold text-white">Instagram-Feed</p>
            <p className="text-xs text-zinc-500 mt-0.5">
              {status === null
                ? "Wird geladen…"
                : status.configured
                  ? `Verbunden · ${daysLeft !== null ? `noch ${daysLeft} Tage gültig` : "aktiv"}`
                  : "Nicht verbunden"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          {status?.configured && (
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${isExpiringSoon ? "bg-amber-900/40 text-amber-400" : "bg-green-900/40 text-green-400"}`}>
              {isExpiringSoon ? "Bald ablaufend" : "Aktiv"}
            </span>
          )}
          <ChevronDown className={`w-4 h-4 text-zinc-500 transition-transform duration-300 ${open ? "rotate-180" : ""}`} />
        </div>
      </button>

      {/* Expanded Content */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 pt-1 space-y-5 border-t border-white/8">

              {/* Current status detail */}
              {status?.configured && status.savedAt && (
                <div className="flex items-start gap-3 bg-white/[0.03] rounded-lg px-4 py-3 text-xs text-zinc-400">
                  <CheckCircle className="w-4 h-4 text-green-400 shrink-0 mt-0.5" />
                  <div>
                    <p>Token aktiv seit <span className="text-zinc-200">{new Date(status.savedAt).toLocaleDateString("de-DE", { day: "2-digit", month: "long", year: "numeric" })}</span></p>
                    {daysLeft !== null && (
                      <p className="mt-0.5">
                        Gültig noch ca. <span className={isExpiringSoon ? "text-amber-400 font-semibold" : "text-zinc-200"}>{daysLeft} Tage</span>
                        {isExpiringSoon && " — Bitte Token erneuern!"}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Instructions */}
              <div className="space-y-2">
                <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Token erneuern</p>
                <ol className="text-xs text-zinc-500 space-y-1.5 list-decimal list-inside leading-relaxed">
                  <li>
                    <a href="https://developers.facebook.com/tools/explorer" target="_blank" rel="noopener noreferrer"
                      className="underline hover:text-zinc-300 transition-colors" style={{ color: "#c5a485" }}>
                      Graph API Explorer
                    </a>
                    {" "}öffnen → App auswählen
                  </li>
                  <li>Berechtigung <code className="bg-zinc-800 px-1 rounded">instagram_basic</code> hinzufügen</li>
                  <li><strong className="text-zinc-300">Token generieren</strong> → kopieren → unten einfügen</li>
                </ol>
              </div>

              {/* Token input */}
              <div className="space-y-2">
                <div className="relative">
                  <input
                    type="text"
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    placeholder="IGAA… Token hier einfügen"
                    className="w-full bg-zinc-900 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-[#c5a485] pr-10 font-mono"
                  />
                  {token && (
                    <button onClick={() => { navigator.clipboard.writeText(token); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300">
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <button
                  onClick={handleSave}
                  disabled={loading || !token.trim()}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-opacity disabled:opacity-40"
                  style={{ backgroundColor: "#c5a485", color: "#1c1917" }}
                >
                  {loading
                    ? <><RefreshCw className="w-4 h-4 animate-spin" /> Wird gespeichert…</>
                    : <><Instagram className="w-4 h-4" /> Token speichern & aktivieren</>}
                </button>
              </div>

              {/* Feedback */}
              {saved && (
                <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 text-xs text-green-400 bg-green-900/20 border border-green-800/30 rounded-lg px-3 py-2">
                  <CheckCircle className="w-3.5 h-3.5 shrink-0" />
                  Token erfolgreich gespeichert. Instagram-Feed ist jetzt aktiv.
                </motion.div>
              )}
              {error && (
                <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 text-xs text-red-400 bg-red-900/20 border border-red-800/30 rounded-lg px-3 py-2">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  {error}
                </motion.div>
              )}

              <p className="text-[11px] text-zinc-700 leading-relaxed">
                Der Token wird sicher auf dem Server gespeichert und ist ca. 60 Tage gültig.
                Nach Ablauf einfach einen neuen Token generieren und hier einfügen.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─────────────────────────── SEO Tab ─────────────────────────── */

interface SeoPage { title: string; description: string; keywords: string; }
interface SeoConfig {
  pages: Record<string, SeoPage>;
  google: { analyticsId: string; adsId: string; searchConsoleVerification: string; };
}

const PAGES_META = [
  { key: "home",        label: "Startseite",  path: "/" },
  { key: "speisekarte", label: "Speisekarte", path: "/speisekarte" },
  { key: "ueber-uns",   label: "Über Uns",    path: "/ueber-uns" },
  { key: "kontakt",     label: "Kontakt",     path: "/kontakt" },
  { key: "impressum",   label: "Impressum",   path: "/impressum" },
  { key: "datenschutz", label: "Datenschutz", path: "/datenschutz" },
];

const EMPTY_PAGE: SeoPage = { title: "", description: "", keywords: "" };

function SeoTab({ authedFetch }: { authedFetch: (url: string, opts?: RequestInit) => Promise<Response> }) {
  const [cfg, setCfg] = useState<SeoConfig>({
    pages: Object.fromEntries(PAGES_META.map(p => [p.key, { ...EMPTY_PAGE }])),
    google: { analyticsId: "", adsId: "", searchConsoleVerification: "" },
  });
  const [seoLoading, setSeoLoading] = useState(true);
  const [seoSaving, setSeoSaving] = useState(false);
  const [seoSaved, setSeoSaved] = useState(false);
  const [seoError, setSeoError] = useState("");
  const [openPage, setOpenPage] = useState<string>("home");

  useEffect(() => {
    authedFetch(`${API}/admin/seo`)
      .then(r => r.json())
      .then(data => { setCfg(data); setSeoLoading(false); })
      .catch(() => setSeoLoading(false));
  }, []);

  const setPageField = (key: string, field: keyof SeoPage, value: string) =>
    setCfg(prev => ({
      ...prev,
      pages: { ...prev.pages, [key]: { ...(prev.pages[key] ?? EMPTY_PAGE), [field]: value } },
    }));

  const setGoogleField = (field: keyof SeoConfig["google"], value: string) =>
    setCfg(prev => ({ ...prev, google: { ...prev.google, [field]: value } }));

  const handleSeoSave = async () => {
    setSeoSaving(true); setSeoError(""); setSeoSaved(false);
    try {
      const r = await authedFetch(`${API}/admin/seo`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cfg),
      });
      if (!r.ok) throw new Error();
      setSeoSaved(true);
      setTimeout(() => setSeoSaved(false), 3000);
    } catch {
      setSeoError("Fehler beim Speichern. Bitte erneut versuchen.");
    } finally {
      setSeoSaving(false);
    }
  };

  const inp = "w-full bg-zinc-900 border border-white/10 rounded-lg px-3 py-2 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-[#c5a485]";
  const lbl = "text-xs text-zinc-400 uppercase tracking-wider mb-1 block";

  if (seoLoading) return (
    <div className="flex items-center justify-center py-24">
      <RefreshCw className="w-5 h-5 animate-spin text-zinc-500" />
    </div>
  );

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
      className="space-y-6">
      <div className="mb-6 sm:mb-8">
        <h2 className="text-lg sm:text-xl font-semibold flex items-center gap-2">
          <Search className="w-5 h-5" style={{ color: GOLD }} />
          SEO &amp; Analytics
        </h2>
        <p className="text-zinc-400 text-sm mt-1">Meta-Tags pro Seite und Google-Tracking-IDs verwalten.</p>
      </div>

      {/* Per-page */}
      <div className="bg-[#1a1a1a] border border-white/8">
        <div className="px-5 py-4 border-b border-white/8">
          <h3 className="text-xs uppercase tracking-widest text-zinc-400">Seiten-Meta-Tags</h3>
        </div>
        <div className="divide-y divide-white/5">
          {PAGES_META.map(page => (
            <div key={page.key}>
              <button
                onClick={() => setOpenPage(openPage === page.key ? "" : page.key)}
                className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-white/3 transition-colors text-left"
              >
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-zinc-200">{page.label}</span>
                  <span className="text-xs text-zinc-600">{page.path}</span>
                </div>
                {openPage === page.key
                  ? <ChevronUp className="w-4 h-4 text-zinc-500 shrink-0" />
                  : <ChevronDown className="w-4 h-4 text-zinc-500 shrink-0" />}
              </button>
              <AnimatePresence initial={false}>
                {openPage === page.key && (
                  <motion.div key="body"
                    initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}
                    className="overflow-hidden">
                    <div className="px-5 pb-5 space-y-4 bg-zinc-900/30 pt-4">
                      <div>
                        <label className={lbl}>Title <span className="normal-case text-zinc-600">(Browser-Tab &amp; Google)</span></label>
                        <input className={inp}
                          value={cfg.pages[page.key]?.title ?? ""}
                          onChange={e => setPageField(page.key, "title", e.target.value)}
                          placeholder="z.B. Quindici Trattoria Pizzeria – Ludwigsburg" maxLength={70} />
                        <p className="text-[11px] text-zinc-600 mt-1">{(cfg.pages[page.key]?.title ?? "").length}/70 Zeichen</p>
                      </div>
                      <div>
                        <label className={lbl}>Description <span className="normal-case text-zinc-600">(Google-Snippet)</span></label>
                        <textarea className={`${inp} resize-none`} rows={2}
                          value={cfg.pages[page.key]?.description ?? ""}
                          onChange={e => setPageField(page.key, "description", e.target.value)}
                          placeholder="z.B. Authentische italienische Küche in Ludwigsburg." maxLength={160} />
                        <p className="text-[11px] text-zinc-600 mt-1">{(cfg.pages[page.key]?.description ?? "").length}/160 Zeichen</p>
                      </div>
                      <div>
                        <label className={lbl}>Keywords <span className="normal-case text-zinc-600">(kommagetrennt)</span></label>
                        <input className={inp}
                          value={cfg.pages[page.key]?.keywords ?? ""}
                          onChange={e => setPageField(page.key, "keywords", e.target.value)}
                          placeholder="z.B. Pizza Ludwigsburg, Trattoria, Italienisch essen" />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>

      {/* Google */}
      <div className="bg-[#1a1a1a] border border-white/8">
        <div className="px-5 py-4 border-b border-white/8">
          <h3 className="text-xs uppercase tracking-widest text-zinc-400">Google-Tags</h3>
        </div>
        <div className="p-5 space-y-5">
          <div>
            <label className={lbl}>Google Analytics Measurement ID</label>
            <input className={inp} value={cfg.google.analyticsId}
              onChange={e => setGoogleField("analyticsId", e.target.value)}
              placeholder="G-XXXXXXXXXX" spellCheck={false} />
            <p className="text-[11px] text-zinc-600 mt-1">Format: <code className="bg-zinc-800 px-1 rounded">G-XXXXXXXXXX</code> — aus Google Analytics „Datenstrom" kopieren.</p>
          </div>
          <div>
            <label className={lbl}>Google Ads Conversion ID</label>
            <input className={inp} value={cfg.google.adsId}
              onChange={e => setGoogleField("adsId", e.target.value)}
              placeholder="AW-XXXXXXXXXX" spellCheck={false} />
            <p className="text-[11px] text-zinc-600 mt-1">Format: <code className="bg-zinc-800 px-1 rounded">AW-XXXXXXXXXX</code> — aus Google Ads „Conversion-Tracking" kopieren.</p>
          </div>
          <div>
            <label className={lbl}>Google Search Console Verification</label>
            <input className={inp} value={cfg.google.searchConsoleVerification}
              onChange={e => setGoogleField("searchConsoleVerification", e.target.value)}
              placeholder="abc123XYZ..." spellCheck={false} />
            <p className="text-[11px] text-zinc-600 mt-1">
              Nur den <code className="bg-zinc-800 px-1 rounded">content="…"</code>-Wert aus dem{" "}
              <code className="bg-zinc-800 px-1 rounded">{'<meta name="google-site-verification">'}</code>-Tag einfügen.
            </p>
          </div>
        </div>
      </div>

      {/* Save */}
      <div className="flex flex-col gap-3 pb-10">
        <button onClick={handleSeoSave} disabled={seoSaving}
          className="flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-semibold transition-opacity disabled:opacity-50"
          style={{ backgroundColor: GOLD, color: "#1c1917" }}>
          {seoSaving
            ? <><RefreshCw className="w-4 h-4 animate-spin" /> Wird gespeichert…</>
            : <><CheckCircle className="w-4 h-4" /> SEO-Einstellungen speichern</>}
        </button>
        {seoSaved && (
          <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 text-xs text-green-400 bg-green-900/20 border border-green-800/30 rounded-lg px-3 py-2">
            <CheckCircle className="w-3.5 h-3.5 shrink-0" />
            Erfolgreich gespeichert. Änderungen sind sofort aktiv.
          </motion.div>
        )}
        {seoError && (
          <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 text-xs text-red-400 bg-red-900/20 border border-red-800/30 rounded-lg px-3 py-2">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            {seoError}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
