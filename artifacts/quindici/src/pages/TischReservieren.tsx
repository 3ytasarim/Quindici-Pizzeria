import { useState, useEffect, useRef } from "react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, ArrowRight, Calendar, Clock, Users,
  User, Phone, Mail, MessageSquare, CheckCircle, Check,
  Timer, Bell, AlertCircle,
} from "lucide-react";

const GOLD = "#d4af37";
const BG = "#fdf8f2";
const COUNTDOWN_SECONDS = 5 * 60; // 5 minutes

const ALL_TIMES = [
  "11:30","12:00","12:30","13:00","13:30","14:00","14:30","15:00",
  "17:00","17:30","18:00","18:30","19:00","19:30","20:00","20:30",
  "21:00","21:30","22:00","22:30","23:00",
];

function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function tomorrowStr() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function getAvailableTimes(date: string): string[] {
  if (date !== todayStr()) return ALL_TIMES;
  const now = new Date();
  const cutoff = now.getHours() * 60 + now.getMinutes() + 60;
  return ALL_TIMES.filter(t => {
    const [h, m] = t.split(":").map(Number);
    return h * 60 + m > cutoff;
  });
}

function firstAvailableTime(date: string): string {
  return getAvailableTimes(date)[0] ?? "19:00";
}

function formatDate(iso: string) {
  if (!iso) return "—";
  return new Intl.DateTimeFormat("de-DE", {
    day: "2-digit", month: "long", year: "numeric",
  }).format(new Date(iso + "T12:00:00"));
}

function fmtCountdown(s: number) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${String(sec).padStart(2, "0")}`;
}

const steps = [
  { id: 1, label: "Tisch finden" },
  { id: 2, label: "Ihre Angaben" },
  { id: 3, label: "Bestätigung" },
];

const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 60 : -60, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -60 : 60, opacity: 0 }),
};

interface Form1 { date: string; time: string; guests: string; }
interface Form2 { firstName: string; lastName: string; phone: string; email: string; notes: string; }

export default function TischReservieren() {
  const [step, setStep] = useState(1);
  const [dir, setDir] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [timedOut, setTimedOut] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const [f1, setF1] = useState<Form1>({
    date: todayStr(),
    time: firstAvailableTime(todayStr()),
    guests: "2",
  });
  const [f2, setF2] = useState<Form2>({
    firstName: "", lastName: "", phone: "", email: "", notes: "",
  });
  const [errors2, setErrors2] = useState<Partial<Form2>>({});

  // Warteliste state
  const [showWarteliste, setShowWarteliste] = useState(false);
  const [warteEmail, setWarteEmail] = useState("");
  const [wartePhone, setWartePhone] = useState("");
  const [warteSubmitted, setWarteSubmitted] = useState(false);

  // Countdown
  const [countdown, setCountdown] = useState(COUNTDOWN_SECONDS);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (step === 2 && !submitted) {
      setCountdown(COUNTDOWN_SECONDS);
      setTimedOut(false);
      countdownRef.current = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(countdownRef.current!);
            setTimedOut(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (countdownRef.current) clearInterval(countdownRef.current);
    }
    return () => { if (countdownRef.current) clearInterval(countdownRef.current); };
  }, [step, submitted]);

  const go = (next: number) => {
    setDir(next > step ? 1 : -1);
    setStep(next);
    if (next === 1) setTimedOut(false);
  };

  const validateStep2 = () => {
    const e: Partial<Form2> = {};
    if (!f2.firstName.trim()) e.firstName = "Pflichtfeld";
    if (!f2.lastName.trim()) e.lastName = "Pflichtfeld";
    if (!f2.phone.trim()) e.phone = "Pflichtfeld";
    if (!f2.email.trim()) e.email = "Pflichtfeld";
    else if (!/\S+@\S+\.\S+/.test(f2.email)) e.email = "Ungültige E-Mail";
    setErrors2(e);
    return Object.keys(e).length === 0;
  };

  const availableTimes = getAvailableTimes(f1.date);
  const noAvailability = availableTimes.length === 0;

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: BG }}>
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 md:px-12 py-5 border-b border-stone-200/70">
        <Link
          href="/"
          className="flex items-center gap-2 text-stone-500 hover:text-stone-800 transition-colors text-sm font-medium group"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
          Zurück zur Startseite
        </Link>
        <img src="/logo.png" alt="Quindici" className="h-10 w-auto" />
      </div>

      {/* Page header */}
      <div className="text-center pt-10 pb-6 px-4">
        <p className="text-xs font-semibold tracking-[0.25em] uppercase mb-2" style={{ color: GOLD }}>
          Quindici Trattoria Pizzeria
        </p>
        <h1 className="font-serif text-3xl md:text-4xl text-stone-800">
          Reservierung bei Quindici
        </h1>
      </div>

      {/* Step indicator */}
      <div className="flex items-center justify-center px-4 mb-8">
        {steps.map((s, i) => {
          const done = step > s.id;
          const active = step === s.id;
          return (
            <div key={s.id} className="flex items-center">
              <div className="flex flex-col items-center">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 border-2"
                  style={{
                    backgroundColor: done ? GOLD : active ? GOLD : "transparent",
                    borderColor: done || active ? GOLD : "#d6d3d1",
                    color: done || active ? "#fff" : "#a8a29e",
                  }}
                >
                  {done ? <Check className="w-4 h-4" /> : s.id}
                </div>
                <span
                  className="text-[10px] mt-1.5 uppercase tracking-widest font-semibold transition-colors duration-300"
                  style={{ color: active ? GOLD : done ? GOLD : "#a8a29e" }}
                >
                  {s.label}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div
                  className="w-20 md:w-32 h-0.5 mx-1 mb-5 transition-all duration-500"
                  style={{ backgroundColor: step > s.id ? GOLD : "#e7e5e4" }}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Form card */}
      <div className="flex-1 flex items-start justify-center px-4 pb-16">
        <div className="w-full max-w-lg bg-white border border-stone-200 shadow-sm overflow-hidden">
          <AnimatePresence mode="wait" custom={dir}>
            {!submitted ? (
              <motion.div
                key={step}
                custom={dir}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.32, ease: [0.4, 0, 0.2, 1] }}
              >

                {/* ── STEP 1 ── */}
                {step === 1 && (
                  <div className="p-8 md:p-10">
                    <p className="text-xs font-semibold tracking-[0.2em] uppercase text-stone-400 mb-6">
                      Schritt 1 — Tisch finden
                    </p>

                    <div className="space-y-5">
                      {/* Datum */}
                      <div>
                        <label className="flex items-center gap-1.5 text-xs font-semibold text-stone-500 uppercase tracking-widest mb-2">
                          <Calendar className="w-3.5 h-3.5" />Datum
                        </label>
                        <input
                          type="date"
                          min={todayStr()}
                          value={f1.date}
                          onChange={e => {
                            const d = e.target.value;
                            const times = getAvailableTimes(d);
                            const time = times.includes(f1.time) ? f1.time : (times[0] ?? "19:00");
                            setF1(p => ({ ...p, date: d, time }));
                            setShowWarteliste(false);
                            setWarteSubmitted(false);
                          }}
                          className="w-full border border-stone-200 px-4 py-3 text-stone-800 text-sm focus:outline-none transition-colors"
                          onFocus={e => (e.target.style.borderColor = GOLD)}
                          onBlur={e => (e.target.style.borderColor = "#e7e5e4")}
                        />
                      </div>

                      {/* Uhrzeit */}
                      <div>
                        <label className="flex items-center gap-1.5 text-xs font-semibold text-stone-500 uppercase tracking-widest mb-2">
                          <Clock className="w-3.5 h-3.5" />Uhrzeit
                        </label>

                        {noAvailability ? (
                          /* ── No slots today ── */
                          <div className="border border-amber-200 bg-amber-50 px-4 py-4">
                            <p className="text-sm text-amber-800 font-medium mb-1">
                              Heute sind leider keine Tische mehr verfügbar.
                            </p>
                            <p className="text-xs text-amber-600 mb-3">
                              Möchten Sie für morgen reservieren?
                            </p>
                            <button
                              type="button"
                              onClick={() => setF1(p => ({ ...p, date: tomorrowStr(), time: "19:00" }))}
                              className="text-xs font-semibold uppercase tracking-widest px-4 py-2 text-white hover:opacity-90 transition-opacity"
                              style={{ backgroundColor: GOLD }}
                            >
                              Morgen anzeigen →
                            </button>
                          </div>
                        ) : (
                          <select
                            value={f1.time}
                            onChange={e => setF1(p => ({ ...p, time: e.target.value }))}
                            className="w-full border border-stone-200 px-4 py-3 text-stone-800 text-sm focus:outline-none bg-white appearance-none cursor-pointer"
                            onFocus={e => (e.target.style.borderColor = GOLD)}
                            onBlur={e => (e.target.style.borderColor = "#e7e5e4")}
                          >
                            {availableTimes.map(t => (
                              <option key={t} value={t}>{t} Uhr</option>
                            ))}
                          </select>
                        )}
                      </div>

                      {/* Personen */}
                      <div>
                        <label className="flex items-center gap-1.5 text-xs font-semibold text-stone-500 uppercase tracking-widest mb-2">
                          <Users className="w-3.5 h-3.5" />Personenanzahl
                        </label>
                        <div className="grid grid-cols-5 gap-2">
                          {Array.from({ length: 10 }, (_, i) => i + 1).map(n => (
                            <button
                              key={n}
                              type="button"
                              onClick={() => setF1(p => ({ ...p, guests: String(n) }))}
                              className="py-2.5 text-sm font-semibold border transition-all duration-150"
                              style={{
                                backgroundColor: f1.guests === String(n) ? GOLD : "transparent",
                                borderColor: f1.guests === String(n) ? GOLD : "#e7e5e4",
                                color: f1.guests === String(n) ? "#fff" : "#57534e",
                              }}
                            >
                              {n}
                            </button>
                          ))}
                        </div>
                        <p className="text-xs text-stone-400 mt-2">
                          Für mehr als 10 Personen rufen Sie uns bitte an.
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => go(2)}
                      disabled={noAvailability}
                      className="mt-8 w-full py-3.5 flex items-center justify-center gap-2 text-sm font-semibold uppercase tracking-widest text-black transition-opacity hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
                      style={{ backgroundColor: GOLD }}
                    >
                      Weiter <ArrowRight className="w-4 h-4" />
                    </button>

                    {/* Warteliste toggle */}
                    <div className="mt-5 border-t border-stone-100 pt-5">
                      {!showWarteliste ? (
                        <button
                          type="button"
                          onClick={() => setShowWarteliste(true)}
                          className="w-full flex items-center justify-center gap-2 text-xs text-stone-400 hover:text-stone-600 transition-colors"
                        >
                          <Bell className="w-3.5 h-3.5" />
                          Auf die Warteliste setzen lassen
                        </button>
                      ) : warteSubmitted ? (
                        <motion.div
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex items-start gap-3 bg-green-50 border border-green-200 px-4 py-3"
                        >
                          <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                          <div>
                            <p className="text-sm font-medium text-green-800">Auf der Warteliste!</p>
                            <p className="text-xs text-green-600 mt-0.5">
                              Wir benachrichtigen Sie, sobald ein Tisch für {formatDate(f1.date)} um {f1.time} Uhr frei wird.
                            </p>
                          </div>
                        </motion.div>
                      ) : (
                        <motion.div
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="space-y-3"
                        >
                          <p className="text-xs text-stone-500 text-center mb-3 flex items-center justify-center gap-1.5">
                            <Bell className="w-3.5 h-3.5" style={{ color: GOLD }} />
                            Benachrichtigung für {formatDate(f1.date)} um {f1.time} Uhr
                          </p>
                          <input
                            type="email"
                            value={warteEmail}
                            onChange={e => setWarteEmail(e.target.value)}
                            placeholder="E-Mail-Adresse *"
                            className="w-full border border-stone-200 px-4 py-2.5 text-stone-800 text-sm focus:outline-none"
                            onFocus={e => (e.target.style.borderColor = GOLD)}
                            onBlur={e => (e.target.style.borderColor = "#e7e5e4")}
                          />
                          <input
                            type="tel"
                            value={wartePhone}
                            onChange={e => setWartePhone(e.target.value)}
                            placeholder="Telefonnummer (optional)"
                            className="w-full border border-stone-200 px-4 py-2.5 text-stone-800 text-sm focus:outline-none"
                            onFocus={e => (e.target.style.borderColor = GOLD)}
                            onBlur={e => (e.target.style.borderColor = "#e7e5e4")}
                          />
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => setShowWarteliste(false)}
                              className="flex-1 py-2.5 text-xs font-semibold uppercase tracking-widest text-stone-400 border border-stone-200 hover:border-stone-400 transition-colors"
                            >
                              Abbrechen
                            </button>
                            <button
                              type="button"
                              disabled={!warteEmail.trim()}
                              onClick={() => { if (warteEmail.trim()) setWarteSubmitted(true); }}
                              className="flex-[2] py-2.5 text-xs font-semibold uppercase tracking-widest text-black disabled:opacity-40 hover:opacity-90 transition-opacity"
                              style={{ backgroundColor: GOLD }}
                            >
                              Benachrichtigung aktivieren
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </div>
                  </div>
                )}

                {/* ── STEP 2 ── */}
                {step === 2 && (
                  <div className="p-8 md:p-10">

                    {/* Timeout screen */}
                    {timedOut ? (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.97 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center py-6"
                      >
                        <AlertCircle className="w-10 h-10 text-amber-500 mx-auto mb-4" />
                        <h3 className="font-serif text-xl text-stone-800 mb-2">Zeit abgelaufen</h3>
                        <p className="text-sm text-stone-500 mb-6">
                          Ihre Reservierungszeit ist abgelaufen. Bitte wählen Sie erneut einen Tisch.
                        </p>
                        <button
                          onClick={() => go(1)}
                          className="flex items-center gap-2 mx-auto text-sm font-semibold uppercase tracking-widest px-6 py-3 text-black hover:opacity-90"
                          style={{ backgroundColor: GOLD }}
                        >
                          <ArrowLeft className="w-4 h-4" /> Neu auswählen
                        </button>
                      </motion.div>
                    ) : (
                      <>
                        {/* Countdown banner */}
                        <motion.div
                          initial={{ opacity: 0, y: -8 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex items-center gap-3 border px-4 py-3 mb-6"
                          style={{
                            borderColor: countdown < 60 ? "#fca5a5" : "#fde68a",
                            backgroundColor: countdown < 60 ? "#fef2f2" : "#fffbeb",
                          }}
                        >
                          <Timer
                            className="w-4 h-4 shrink-0"
                            style={{ color: countdown < 60 ? "#ef4444" : "#d97706" }}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-stone-600 leading-snug">
                              Wir halten Ihren Tisch noch{" "}
                              <span
                                className="font-bold text-sm tabular-nums"
                                style={{ color: countdown < 60 ? "#ef4444" : "#d97706" }}
                              >
                                {fmtCountdown(countdown)} Min.
                              </span>{" "}
                              für Sie frei.
                            </p>
                          </div>
                          {/* Progress bar */}
                          <div className="w-16 h-1.5 bg-stone-200 shrink-0">
                            <div
                              className="h-full transition-all duration-1000"
                              style={{
                                width: `${(countdown / COUNTDOWN_SECONDS) * 100}%`,
                                backgroundColor: countdown < 60 ? "#ef4444" : GOLD,
                              }}
                            />
                          </div>
                        </motion.div>

                        <p className="text-xs font-semibold tracking-[0.2em] uppercase text-stone-400 mb-6">
                          Schritt 2 — Ihre Angaben
                        </p>

                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <Field label="Vorname" icon={<User className="w-3.5 h-3.5" />} required
                              value={f2.firstName} error={errors2.firstName}
                              onChange={v => { setF2(p => ({ ...p, firstName: v })); setErrors2(p => ({ ...p, firstName: "" })); }}
                              placeholder="Anna" />
                            <Field label="Nachname" icon={<User className="w-3.5 h-3.5" />} required
                              value={f2.lastName} error={errors2.lastName}
                              onChange={v => { setF2(p => ({ ...p, lastName: v })); setErrors2(p => ({ ...p, lastName: "" })); }}
                              placeholder="Müller" />
                          </div>
                          <Field label="Telefon" icon={<Phone className="w-3.5 h-3.5" />} required type="tel"
                            value={f2.phone} error={errors2.phone}
                            onChange={v => { setF2(p => ({ ...p, phone: v })); setErrors2(p => ({ ...p, phone: "" })); }}
                            placeholder="+49 711 000 0000" />
                          <Field label="E-Mail-Adresse" icon={<Mail className="w-3.5 h-3.5" />} required type="email"
                            value={f2.email} error={errors2.email}
                            onChange={v => { setF2(p => ({ ...p, email: v })); setErrors2(p => ({ ...p, email: "" })); }}
                            placeholder="anna@beispiel.de" />
                          <div>
                            <label className="flex items-center gap-1.5 text-xs font-semibold text-stone-500 uppercase tracking-widest mb-2">
                              <MessageSquare className="w-3.5 h-3.5" />Anmerkungen
                              <span className="text-stone-300 font-normal normal-case tracking-normal">(optional)</span>
                            </label>
                            <textarea
                              rows={3}
                              value={f2.notes}
                              onChange={e => setF2(p => ({ ...p, notes: e.target.value }))}
                              placeholder="Allergien, besondere Wünsche, Anlass…"
                              className="w-full border border-stone-200 px-4 py-3 text-stone-800 text-sm focus:outline-none resize-none"
                              onFocus={e => (e.target.style.borderColor = GOLD)}
                              onBlur={e => (e.target.style.borderColor = "#e7e5e4")}
                            />
                          </div>
                        </div>

                        <div className="flex gap-3 mt-8">
                          <button onClick={() => go(1)}
                            className="flex-1 py-3.5 flex items-center justify-center gap-2 text-sm font-semibold uppercase tracking-widest text-stone-500 border border-stone-200 hover:border-stone-400 transition-colors">
                            <ArrowLeft className="w-4 h-4" /> Zurück
                          </button>
                          <button
                            onClick={() => { if (validateStep2()) go(3); }}
                            className="flex-[2] py-3.5 flex items-center justify-center gap-2 text-sm font-semibold uppercase tracking-widest text-black hover:opacity-90 transition-opacity"
                            style={{ backgroundColor: GOLD }}>
                            Weiter <ArrowRight className="w-4 h-4" />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                )}

                {/* ── STEP 3 ── */}
                {step === 3 && (
                  <div className="p-8 md:p-10">
                    <p className="text-xs font-semibold tracking-[0.2em] uppercase text-stone-400 mb-6">
                      Schritt 3 — Zusammenfassung
                    </p>

                    <div className="border border-stone-100 bg-[#fdf8f2] p-5 space-y-3 mb-6">
                      <SummaryRow label="Datum" value={formatDate(f1.date)} />
                      <SummaryRow label="Uhrzeit" value={`${f1.time} Uhr`} />
                      <SummaryRow label="Personen" value={`${f1.guests} ${f1.guests === "1" ? "Person" : "Personen"}`} />
                      <div className="border-t border-stone-200 pt-3 mt-3">
                        <SummaryRow label="Name" value={`${f2.firstName} ${f2.lastName}`} />
                        <SummaryRow label="Telefon" value={f2.phone} />
                        <SummaryRow label="E-Mail" value={f2.email} />
                        {f2.notes && <SummaryRow label="Anmerkungen" value={f2.notes} />}
                      </div>
                    </div>

                    <p className="text-xs text-stone-400 leading-relaxed mb-6">
                      Mit der Bestätigung Ihrer Reservierung erklären Sie sich einverstanden, dass wir Ihre Daten zur Bearbeitung nutzen. Ihre Reservierung wird von uns telefonisch oder per E-Mail bestätigt.
                    </p>

                    {submitError && (
                      <p className="text-xs text-red-500 mb-3 text-center">{submitError}</p>
                    )}
                    <div className="flex gap-3">
                      <button onClick={() => go(2)}
                        className="flex-1 py-3.5 flex items-center justify-center gap-2 text-sm font-semibold uppercase tracking-widest text-stone-500 border border-stone-200 hover:border-stone-400 transition-colors">
                        <ArrowLeft className="w-4 h-4" /> Zurück
                      </button>
                      <button
                        disabled={submitting}
                        onClick={async () => {
                          setSubmitting(true);
                          setSubmitError("");
                          try {
                            const res = await fetch("/api/reservations", {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({
                                date: f1.date, time: f1.time, guests: f1.guests,
                                firstName: f2.firstName, lastName: f2.lastName,
                                phone: f2.phone, email: f2.email, notes: f2.notes,
                              }),
                            });
                            if (!res.ok) throw new Error("Fehler beim Senden");
                            setSubmitted(true);
                          } catch {
                            setSubmitError("Die Reservierung konnte nicht gesendet werden. Bitte versuchen Sie es erneut.");
                          } finally {
                            setSubmitting(false);
                          }
                        }}
                        className="flex-[2] py-3.5 flex items-center justify-center gap-2 text-sm font-semibold uppercase tracking-widest text-black hover:opacity-90 transition-opacity disabled:opacity-60"
                        style={{ backgroundColor: GOLD }}>
                        {submitting ? "Wird gesendet…" : (<>Jetzt reservieren <CheckCircle className="w-4 h-4" /></>)}
                      </button>
                    </div>
                  </div>
                )}

              </motion.div>
            ) : (
              /* ── SUCCESS ── */
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
                className="p-10 md:p-14 flex flex-col items-center text-center"
              >
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.15, type: "spring", stiffness: 260, damping: 20 }}
                  className="w-16 h-16 rounded-full flex items-center justify-center mb-6"
                  style={{ backgroundColor: GOLD }}
                >
                  <Check className="w-8 h-8 text-white" strokeWidth={2.5} />
                </motion.div>
                <motion.h2
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="font-serif text-2xl text-stone-800 mb-3"
                >
                  Anfrage gesendet!
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-stone-500 text-sm leading-relaxed mb-2 max-w-sm"
                >
                  Vielen Dank, <strong>{f2.firstName}</strong>. Wir haben Ihre Reservierungsanfrage für den{" "}
                  <strong>{formatDate(f1.date)}</strong> um <strong>{f1.time} Uhr</strong> ({f1.guests}{" "}
                  {f1.guests === "1" ? "Person" : "Personen"}) erhalten.
                </motion.p>
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="text-stone-400 text-xs leading-relaxed mb-8 max-w-xs"
                >
                  Wir melden uns in Kürze unter{" "}
                  <span className="text-stone-600">{f2.email}</span> oder{" "}
                  <span className="text-stone-600">{f2.phone}</span> zur Bestätigung.
                </motion.p>
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
                  <Link
                    href="/"
                    className="flex items-center gap-2 text-sm font-semibold uppercase tracking-widest px-6 py-3 border transition-colors text-stone-600 border-stone-200 hover:border-stone-400"
                  >
                    <ArrowLeft className="w-4 h-4" /> Zurück zur Startseite
                  </Link>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

/* ─── helpers ─── */

function Field({
  label, icon, required, type = "text", value, error, onChange, placeholder,
}: {
  label: string; icon: React.ReactNode; required?: boolean;
  type?: string; value: string; error?: string;
  onChange: (v: string) => void; placeholder?: string;
}) {
  return (
    <div>
      <label className="flex items-center gap-1.5 text-xs font-semibold text-stone-500 uppercase tracking-widest mb-2">
        {icon}{label}{required && <span style={{ color: GOLD }}>*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full border px-4 py-3 text-stone-800 text-sm focus:outline-none transition-colors"
        style={{ borderColor: error ? "#ef4444" : "#e7e5e4" }}
        onFocus={e => (e.target.style.borderColor = error ? "#ef4444" : GOLD)}
        onBlur={e => (e.target.style.borderColor = error ? "#ef4444" : "#e7e5e4")}
      />
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 text-sm">
      <span className="text-stone-400 shrink-0">{label}</span>
      <span className="text-stone-700 font-medium text-right">{value}</span>
    </div>
  );
}
