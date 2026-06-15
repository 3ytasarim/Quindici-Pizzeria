import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, LogOut, FileText, CheckCircle, AlertCircle, Trash2, Eye, Lock, User } from "lucide-react";

const API = "/api";

function formatDate(iso: string | null) {
  if (!iso) return "—";
  return new Intl.DateTimeFormat("de-DE", {
    day: "2-digit", month: "long", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  }).format(new Date(iso));
}

export default function Admin() {
  const [token, setToken] = useState(() => sessionStorage.getItem("admin_token") ?? "");
  const [loginForm, setLoginForm] = useState({ username: "", password: "" });
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  const [uploadedAt, setUploadedAt] = useState<string | null>(null);
  const [pdfAvailable, setPdfAvailable] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const fetchStatus = useCallback(async (t: string) => {
    const r = await fetch(`${API}/mittagstisch`, {
      headers: { Authorization: `Bearer ${t}` },
    });
    if (r.ok) {
      const d = await r.json();
      setPdfAvailable(d.available);
      setUploadedAt(d.uploadedAt);
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError("");
    try {
      const r = await fetch(`${API}/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginForm),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error ?? "Fehler");
      sessionStorage.setItem("admin_token", d.token);
      setToken(d.token);
      fetchStatus(d.token);
    } catch (err: any) {
      setLoginError(err.message ?? "Anmeldung fehlgeschlagen");
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("admin_token");
    setToken("");
    setSelectedFile(null);
  };

  const handleUpload = async (file: File) => {
    if (!file || file.type !== "application/pdf") {
      setStatus({ type: "error", msg: "Bitte eine gültige PDF-Datei auswählen." });
      return;
    }
    setUploading(true);
    setStatus(null);
    const form = new FormData();
    form.append("pdf", file);
    try {
      const r = await fetch(`${API}/admin/mittagstisch`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error ?? "Upload fehlgeschlagen");
      setStatus({ type: "success", msg: "PDF erfolgreich hochgeladen!" });
      setSelectedFile(null);
      fetchStatus(token);
    } catch (err: any) {
      setStatus({ type: "error", msg: err.message });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Aktuelles PDF löschen?")) return;
    await fetch(`${API}/admin/mittagstisch`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    setStatus({ type: "success", msg: "PDF gelöscht." });
    fetchStatus(token);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) setSelectedFile(file);
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="w-full max-w-md"
        >
          <div className="text-center mb-10">
            <img src="/logo.png" alt="Quindici" className="h-20 w-auto mx-auto mb-6 opacity-90" />
            <h1 className="text-2xl font-semibold text-white tracking-wide">Admin-Bereich</h1>
            <p className="text-zinc-400 text-sm mt-1">Melden Sie sich an, um fortzufahren</p>
          </div>

          <form onSubmit={handleLogin} className="bg-[#1a1a1a] border border-white/8 p-8 shadow-2xl">
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-zinc-400 uppercase tracking-widest mb-2">Benutzername</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <input
                    type="text"
                    value={loginForm.username}
                    onChange={e => setLoginForm(f => ({ ...f, username: e.target.value }))}
                    className="w-full bg-[#111] border border-white/10 text-white pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-[#d4af37] transition-colors"
                    placeholder="admin"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs text-zinc-400 uppercase tracking-widest mb-2">Passwort</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <input
                    type="password"
                    value={loginForm.password}
                    onChange={e => setLoginForm(f => ({ ...f, password: e.target.value }))}
                    className="w-full bg-[#111] border border-white/10 text-white pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-[#d4af37] transition-colors"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>
            </div>

            <AnimatePresence>
              {loginError && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-4 flex items-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 px-3 py-2"
                >
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {loginError}
                </motion.div>
              )}
            </AnimatePresence>

            <button
              type="submit"
              disabled={loginLoading}
              className="mt-6 w-full py-3 text-sm font-semibold uppercase tracking-widest text-black transition-all disabled:opacity-50"
              style={{ backgroundColor: "#d4af37" }}
            >
              {loginLoading ? "Wird geprüft…" : "Anmelden"}
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white">
      {/* Topbar */}
      <div className="border-b border-white/8 bg-[#1a1a1a]">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Quindici" className="h-9 w-auto opacity-80" />
            <span className="text-sm text-zinc-400 font-medium">Admin-Panel</span>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-xs text-zinc-400 hover:text-white transition-colors uppercase tracking-widest"
          >
            <LogOut className="w-3.5 h-3.5" />
            Abmelden
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-white">Mittagstisch PDF</h2>
          <p className="text-zinc-400 text-sm mt-1">
            Laden Sie jede Woche das aktuelle Mittagstisch-PDF hoch. Es wird sofort auf der Website verfügbar.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Current status card */}
          <div className="bg-[#1a1a1a] border border-white/8 p-6">
            <h3 className="text-xs uppercase tracking-widest text-zinc-400 mb-4">Aktueller Status</h3>
            <div className="flex items-start gap-4">
              <div className={`p-3 ${pdfAvailable ? "bg-green-500/10" : "bg-zinc-800"}`}>
                <FileText className={`w-6 h-6 ${pdfAvailable ? "text-green-400" : "text-zinc-500"}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white">
                  {pdfAvailable ? "PDF verfügbar" : "Kein PDF hochgeladen"}
                </p>
                <p className="text-xs text-zinc-500 mt-0.5">
                  {pdfAvailable ? `Hochgeladen: ${formatDate(uploadedAt)}` : "Noch keine Datei vorhanden"}
                </p>
              </div>
            </div>

            {pdfAvailable && (
              <div className="flex gap-2 mt-5">
                <a
                  href="/api/mittagstisch/pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs px-3 py-2 border border-[#d4af37]/40 text-[#d4af37] hover:bg-[#d4af37]/10 transition-colors"
                >
                  <Eye className="w-3.5 h-3.5" />
                  Vorschau
                </a>
                <button
                  onClick={handleDelete}
                  className="flex items-center gap-1.5 text-xs px-3 py-2 border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Löschen
                </button>
              </div>
            )}
          </div>

          {/* Upload card */}
          <div className="bg-[#1a1a1a] border border-white/8 p-6">
            <h3 className="text-xs uppercase tracking-widest text-zinc-400 mb-4">Neues PDF hochladen</h3>

            <div
              onDragOver={e => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={onDrop}
              onClick={() => fileRef.current?.click()}
              className={`border-2 border-dashed p-8 text-center cursor-pointer transition-all ${
                dragOver
                  ? "border-[#d4af37] bg-[#d4af37]/5"
                  : selectedFile
                  ? "border-green-500/50 bg-green-500/5"
                  : "border-white/15 hover:border-white/30"
              }`}
            >
              <input
                ref={fileRef}
                type="file"
                accept=".pdf,application/pdf"
                className="hidden"
                onChange={e => e.target.files?.[0] && setSelectedFile(e.target.files[0])}
              />
              {selectedFile ? (
                <div>
                  <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-2" />
                  <p className="text-sm text-white font-medium truncate">{selectedFile.name}</p>
                  <p className="text-xs text-zinc-500 mt-1">{(selectedFile.size / 1024).toFixed(0)} KB</p>
                </div>
              ) : (
                <div>
                  <Upload className="w-8 h-8 text-zinc-500 mx-auto mb-2" />
                  <p className="text-sm text-zinc-300">PDF hierher ziehen</p>
                  <p className="text-xs text-zinc-500 mt-1">oder klicken zum Auswählen</p>
                </div>
              )}
            </div>

            <AnimatePresence>
              {status && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className={`mt-3 flex items-center gap-2 text-sm px-3 py-2 ${
                    status.type === "success"
                      ? "bg-green-500/10 border border-green-500/20 text-green-400"
                      : "bg-red-500/10 border border-red-500/20 text-red-400"
                  }`}
                >
                  {status.type === "success"
                    ? <CheckCircle className="w-4 h-4 shrink-0" />
                    : <AlertCircle className="w-4 h-4 shrink-0" />}
                  {status.msg}
                </motion.div>
              )}
            </AnimatePresence>

            <button
              disabled={!selectedFile || uploading}
              onClick={() => selectedFile && handleUpload(selectedFile)}
              className="mt-4 w-full py-3 text-sm font-semibold uppercase tracking-widest text-black transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ backgroundColor: "#d4af37" }}
            >
              {uploading ? "Wird hochgeladen…" : "PDF hochladen"}
            </button>
          </div>
        </div>

        <div className="mt-6 bg-[#1a1a1a] border border-white/8 p-5">
          <h3 className="text-xs uppercase tracking-widest text-zinc-400 mb-3">Hinweise</h3>
          <ul className="text-sm text-zinc-400 space-y-1.5 list-disc list-inside">
            <li>Das hochgeladene PDF ersetzt automatisch das vorherige.</li>
            <li>Maximale Dateigröße: 20 MB.</li>
            <li>Der Button "Mittagstisch der Woche" auf der Website öffnet sofort das neue PDF.</li>
            <li>Die Anmeldung ist für 12 Stunden gültig.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
