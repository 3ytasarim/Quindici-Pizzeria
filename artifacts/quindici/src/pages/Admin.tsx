import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload, LogOut, FileText, CheckCircle, AlertCircle,
  Trash2, Eye, Lock, User, UtensilsCrossed, Plus, Pencil, X, Image,
  CalendarCheck, Bell, BellOff, Phone, Mail, Users, Clock, Calendar,
  RefreshCw,
} from "lucide-react";

const API = "/api";
const GOLD = "#d4af37";
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

type Tab = "mittagstisch" | "gerichte" | "reservierungen";

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
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const tokenRef = useRef(token);
  tokenRef.current = token;
  const soundRef = useRef(soundEnabled);
  soundRef.current = soundEnabled;
  const lastCountRef = useRef<number | null>(null);
  void lastCount; void setLastCount;

  const authHeaders = useCallback(() => ({ Authorization: `Bearer ${token}` }), [token]);

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
        fetch(`${API}/admin/reservations/${r.id}`, {
          method: "PATCH",
          headers: { ...authHeaders(), "Content-Type": "application/json" },
          body: JSON.stringify({ seen: true }),
        })
      ));
      setNewBadge(0);
      lastCountRef.current = 0;
      setReservations(prev => prev.map(r => ({ ...r, seen: true })));
    }
  };

  const updateReservationStatus = async (id: string, status: Reservation["status"]) => {
    await fetch(`${API}/admin/reservations/${id}`, {
      method: "PATCH",
      headers: { ...authHeaders(), "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setReservations(prev => prev.map(r => r.id === id ? { ...r, status } : r));
  };

  const deleteReservation = async (id: string) => {
    if (!confirm("Reservierung löschen?")) return;
    await fetch(`${API}/admin/reservations/${id}`, { method: "DELETE", headers: authHeaders() });
    setReservations(prev => prev.filter(r => r.id !== id));
  };

  const handlePdfUpload = async (file: File) => {
    if (file.type !== "application/pdf") { setPdfStatus({ type: "error", msg: "Bitte eine gültige PDF-Datei auswählen." }); return; }
    setUploading(true); setPdfStatus(null);
    const form = new FormData(); form.append("pdf", file);
    try {
      const r = await fetch(`${API}/admin/mittagstisch`, { method: "POST", headers: authHeaders(), body: form });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error ?? "Upload fehlgeschlagen");
      setPdfStatus({ type: "success", msg: "PDF erfolgreich hochgeladen!" });
      setSelectedPdf(null); fetchPdfStatus(token);
    } catch (err: any) { setPdfStatus({ type: "error", msg: err.message }); }
    finally { setUploading(false); }
  };

  const handlePdfDelete = async () => {
    if (!confirm("Aktuelles PDF löschen?")) return;
    await fetch(`${API}/admin/mittagstisch`, { method: "DELETE", headers: authHeaders() });
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
      const r = await fetch(url, { method, headers: authHeaders(), body: form });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error ?? "Fehler");
      setDishStatus({ type: "success", msg: editingDish ? "Gericht aktualisiert." : "Gericht hinzugefügt." });
      setShowForm(false); fetchDishes();
    } catch (err: any) { setDishStatus({ type: "error", msg: err.message }); }
    finally { setDishUploading(false); }
  };
  const handleDishDelete = async (id: string) => {
    if (!confirm("Dieses Gericht löschen?")) return;
    await fetch(`${API}/dishes/${id}`, { method: "DELETE", headers: authHeaders() });
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
                    className="w-full bg-[#111] border border-white/10 text-white pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-[#d4af37] transition-colors" placeholder="admin" required />
                </div>
              </div>
              <div>
                <label className="block text-xs text-zinc-400 uppercase tracking-widest mb-2">Passwort</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <input type="password" value={loginForm.password} onChange={e => setLoginForm(f => ({ ...f, password: e.target.value }))}
                    className="w-full bg-[#111] border border-white/10 text-white pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-[#d4af37] transition-colors" placeholder="••••••••" required />
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
                ["mittagstisch", "Mittagstisch", "PDF", FileText, 0],
                ["gerichte", "Gerichte", "Lieblingsgerichte", UtensilsCrossed, 0],
                ["reservierungen", "Reservierung.", "Reservierungen", CalendarCheck, newBadge],
              ] as const
            ).map(([id, shortLabel, fullLabel, Icon, badge]) => (
              <button key={id} onClick={() => handleTabChange(id as Tab)}
                className={`relative flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-3.5 sm:py-4 text-[11px] sm:text-xs uppercase tracking-widest font-semibold border-b-2 transition-colors whitespace-nowrap shrink-0 ${tab === id ? "border-[#d4af37] text-[#d4af37]" : "border-transparent text-zinc-500 hover:text-zinc-300"}`}>
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
                      className="flex items-center gap-1.5 text-xs px-3 py-2 border border-[#d4af37]/40 text-[#d4af37] hover:bg-[#d4af37]/10 transition-colors">
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
                  className={`border-2 border-dashed p-6 sm:p-8 text-center cursor-pointer transition-all ${dragOver ? "border-[#d4af37] bg-[#d4af37]/5" : selectedPdf ? "border-green-500/50 bg-green-500/5" : "border-white/15 hover:border-white/30"}`}>
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
                          className="w-full bg-[#111] border border-white/10 text-white px-4 py-2.5 text-sm focus:outline-none focus:border-[#d4af37] transition-colors" placeholder="z.B. Margherita" />
                      </div>
                      <div>
                        <label className="block text-xs text-zinc-400 uppercase tracking-widest mb-2">Beschreibung</label>
                        <textarea value={dishForm.desc} onChange={e => setDishForm(f => ({ ...f, desc: e.target.value }))} rows={3}
                          className="w-full bg-[#111] border border-white/10 text-white px-4 py-2.5 text-sm focus:outline-none focus:border-[#d4af37] transition-colors resize-none"
                          placeholder="Zutaten oder kurze Beschreibung" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs text-zinc-400 uppercase tracking-widest mb-2">Foto</label>
                      <div onDragOver={e => { e.preventDefault(); setDishDragOver(true); }} onDragLeave={() => setDishDragOver(false)}
                        onDrop={e => { e.preventDefault(); setDishDragOver(false); const f = e.dataTransfer.files[0]; if (f) setDishFile(f); }}
                        onClick={() => dishFileRef.current?.click()}
                        className={`border-2 border-dashed p-5 text-center cursor-pointer transition-all h-[130px] sm:h-[140px] flex flex-col items-center justify-center ${dishDragOver ? "border-[#d4af37] bg-[#d4af37]/5" : dishFile ? "border-green-500/50 bg-green-500/5" : "border-white/15 hover:border-white/30"}`}>
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
                            className="w-full bg-[#111] border border-white/10 text-white px-3 py-2 text-xs focus:outline-none focus:border-[#d4af37] transition-colors"
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
                        className="flex items-center gap-1.5 text-xs px-3 py-1.5 border border-[#d4af37]/40 text-[#d4af37] hover:bg-[#d4af37]/10 transition-colors">
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
        {tab === "reservierungen" && (
          <>
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-6 sm:mb-8">
              <div>
                <h2 className="text-lg sm:text-xl font-semibold">Reservierungen</h2>
                <p className="text-zinc-400 text-sm mt-1 flex items-center gap-1.5 flex-wrap">
                  <RefreshCw className="w-3 h-3 animate-spin shrink-0" style={{ animationDuration: "3s" }} />
                  Echtzeit-Aktualisierung alle 2 Sek.
                  {lastRefresh && (
                    <span className="text-zinc-600">
                      — {lastRefresh.toLocaleTimeString("de-DE")}
                    </span>
                  )}
                </p>
              </div>
              <button
                onClick={() => setSoundEnabled(s => !s)}
                className={`flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold uppercase tracking-widest border transition-colors shrink-0 ${soundEnabled ? "border-[#d4af37]/40 text-[#d4af37]" : "border-white/10 text-zinc-500"}`}>
                {soundEnabled ? <Bell className="w-3.5 h-3.5" /> : <BellOff className="w-3.5 h-3.5" />}
                {soundEnabled ? "Ton an" : "Ton aus"}
              </button>
            </div>

            {reservations.length === 0 ? (
              <div className="text-center py-16 sm:py-20 bg-[#1a1a1a] border border-white/8">
                <CalendarCheck className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
                <p className="text-zinc-400 text-sm">Noch keine Reservierungen eingegangen.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {reservations.map(r => (
                  <motion.div
                    key={r.id}
                    layout
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`bg-[#1a1a1a] border p-4 sm:p-5 transition-colors rounded-xl ${!r.seen ? "border-[#d4af37]/40" : "border-white/8"}`}
                  >
                    {/* Badges row */}
                    <div className="flex items-center gap-2 flex-wrap mb-3">
                      {!r.seen && (
                        <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 text-black rounded-sm"
                          style={{ backgroundColor: GOLD }}>NEU</span>
                      )}
                      <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 border rounded-sm ${STATUS_COLORS[r.status]}`}>
                        {STATUS_LABELS[r.status]}
                      </span>
                    </div>

                    {/* Info grid */}
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
                      <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-zinc-400">
                        <span className="flex items-center gap-1.5">
                          <User className="w-3 h-3 shrink-0" />{r.firstName} {r.lastName}
                        </span>
                        <a href={`tel:${r.phone}`} className="flex items-center gap-1.5 hover:text-[#d4af37] transition-colors">
                          <Phone className="w-3 h-3 shrink-0" />{r.phone}
                        </a>
                        <a href={`mailto:${r.email}`} className="flex items-center gap-1.5 hover:text-[#d4af37] transition-colors break-all">
                          <Mail className="w-3 h-3 shrink-0" />{r.email}
                        </a>
                      </div>
                    </div>

                    {r.notes && <p className="text-xs text-zinc-500 italic mb-2">"{r.notes}"</p>}
                    <p className="text-[10px] text-zinc-700 mb-3">Eingegangen: {formatDate(r.createdAt)}</p>

                    {/* Actions — full width on mobile */}
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
        )}
      </div>
    </div>
  );
}
