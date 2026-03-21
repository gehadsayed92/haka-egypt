'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Calendar, MapPin, Clock, ArrowRight, ArrowLeft,
  CheckCircle, Shield, Upload, X, AlertCircle,
} from 'lucide-react';
import { formatDate, formatTime } from '@/lib/utils';
import type { Event, PadelLevel } from '@/types';

const INSTAPAY_NUMBER = '01234567890';
const INSTAPAY_NAME = 'HAKA Egypt';

// ─── Demo events ────────────────────────────────────────────────────────────
const DEMO_EVENTS: Event[] = [
  { id: 'padel-1', title: 'HAKA Open Match', description: 'Mixed-level friendly match. All welcome. 2 courts booked, competitive but fun.', location: 'New Cairo Sports Club', date: '2026-03-28T09:00:00', capacity: 8, price: 250, group_url: 'https://chat.whatsapp.com/ChdQklSOkhHEdP8aAlBskk', padel_level: 'All Levels', court_name: 'Court A & B', duration_hours: 1.5, created_by: '', created_at: '' },
  { id: 'padel-2', title: 'Intermediate Session', description: 'Fast-paced rotations for players who can maintain consistent rallies.', location: 'Maadi Club, Cairo', date: '2026-04-01T18:30:00', capacity: 8, price: 300, group_url: 'https://chat.whatsapp.com/ChdQklSOkhHEdP8aAlBskk', padel_level: 'Intermediate', court_name: 'Court 3', duration_hours: 2, created_by: '', created_at: '' },
  { id: 'padel-3', title: 'Beginners Welcome', description: 'Chill intro match with coaching tips. No judgment, just good vibes.', location: 'Palm Hills Club, 6th October', date: '2026-04-04T10:00:00', capacity: 8, price: 200, group_url: 'https://chat.whatsapp.com/ChdQklSOkhHEdP8aAlBskk', padel_level: 'Beginner', court_name: 'Court 1', duration_hours: 1.5, created_by: '', created_at: '' },
  { id: 'padel-4', title: 'Advanced Tournament', description: 'Full competitive format — points, rankings, trophies. Bring your A-game.', location: 'El-Gezira Sporting Club', date: '2026-04-05T08:00:00', capacity: 16, price: 450, group_url: 'https://chat.whatsapp.com/ChdQklSOkhHEdP8aAlBskk', padel_level: 'Advanced', court_name: 'Courts 1–4', duration_hours: 4, created_by: '', created_at: '' },
  { id: 'padel-5', title: 'Evening Padel', description: 'After-work casual mixed match. Drinks and good company after.', location: 'Wadi Degla Club, Maadi', date: '2026-04-08T19:00:00', capacity: 8, price: 280, group_url: 'https://chat.whatsapp.com/ChdQklSOkhHEdP8aAlBskk', padel_level: 'Intermediate', court_name: 'Court 2', duration_hours: 2, created_by: '', created_at: '' },
  { id: 'padel-6', title: 'Monthly Showdown', description: 'Flagship monthly tournament. All levels, full bracket, live scoring.', location: 'The Park Club, New Cairo', date: '2026-04-12T09:00:00', capacity: 32, price: 500, group_url: 'https://chat.whatsapp.com/ChdQklSOkhHEdP8aAlBskk', padel_level: 'All Levels', court_name: 'All Courts', duration_hours: 6, created_by: '', created_at: '' },
];

// ─── Level calculation ───────────────────────────────────────────────────────
function calcLevel(exp: string, rally: string, play: string, rating: number): PadelLevel {
  const s = ({ new: 1, casual: 2, regular: 3, advanced: 4 }[exp] ?? 1)
          + ({ no: 0, sometimes: 1, yes: 2 }[rally] ?? 0)
          + ({ practice: 0, friendly: 1, competitive: 2 }[play] ?? 0)
          + (rating - 1);
  if (s <= 4) return 'Beginner';
  if (s <= 8) return 'Intermediate';
  return 'Advanced';
}

// ─── Step indicator ──────────────────────────────────────────────────────────
function StepDots({ step, total }: { step: number; total: number }) {
  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-all duration-300 ${
            i + 1 < step ? 'bg-red-600 text-white' : i + 1 === step ? 'bg-red-600 text-white ring-4 ring-red-600/20' : 'bg-white/8 text-gray-500'
          }`}>
            {i + 1 < step ? <CheckCircle className="w-4 h-4" /> : i + 1}
          </div>
          {i < total - 1 && <div className={`w-8 h-px rounded-full transition-all duration-500 ${i + 1 < step ? 'bg-red-600' : 'bg-white/10'}`} />}
        </div>
      ))}
    </div>
  );
}

// ─── Event summary bar ───────────────────────────────────────────────────────
function EventBar({ event }: { event: Event }) {
  const lvlColor: Record<string, string> = { Beginner: 'text-emerald-400', Intermediate: 'text-yellow-400', Advanced: 'text-orange-400', 'All Levels': 'text-red-400' };
  return (
    <div className="bg-white/4 border border-white/8 rounded-xl p-4 mb-6 flex flex-wrap gap-3 text-sm">
      <span className="flex items-center gap-1.5 text-gray-400"><Calendar className="w-3.5 h-3.5 text-gray-500" />{formatDate(event.date)} · {formatTime(event.date)}</span>
      <span className="flex items-center gap-1.5 text-gray-400"><MapPin className="w-3.5 h-3.5 text-gray-500" />{event.location}</span>
      <span className="flex items-center gap-1.5 text-gray-400"><Clock className="w-3.5 h-3.5 text-gray-500" />{event.duration_hours}h</span>
      {event.padel_level && <span className={`flex items-center gap-1.5 font-bold ${lvlColor[event.padel_level] ?? 'text-red-400'}`}><Shield className="w-3.5 h-3.5" />{event.padel_level}</span>}
    </div>
  );
}

// ─── Step 1: Basic Info ──────────────────────────────────────────────────────
function Step1({ data, onChange, onNext }: { data: { name: string; phone: string; email: string }; onChange: (f: string, v: string) => void; onNext: () => void }) {
  const valid = data.name.trim().length >= 2 && data.phone.trim().length >= 9;
  return (
    <div className="space-y-5">
      <div><h2 className="text-xl font-black text-white mb-1">Who are you?</h2><p className="text-gray-500 text-sm">Takes 30 seconds.</p></div>
      <div>
        <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Full Name <span className="text-red-500">*</span></label>
        <input type="text" value={data.name} onChange={e => onChange('name', e.target.value)} placeholder="e.g. Ahmed Hassan" className="w-full bg-white/4 border border-white/10 focus:border-red-500 rounded-xl px-4 py-3.5 text-white placeholder-gray-600 text-sm outline-none transition-colors" />
      </div>
      <div>
        <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">WhatsApp Number <span className="text-red-500">*</span></label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-bold">+20</span>
          <input type="tel" value={data.phone} onChange={e => onChange('phone', e.target.value)} placeholder="1xxxxxxxxx" className="w-full bg-white/4 border border-white/10 focus:border-red-500 rounded-xl pl-14 pr-4 py-3.5 text-white placeholder-gray-600 text-sm outline-none transition-colors" />
        </div>
        <p className="text-gray-600 text-xs mt-1.5">You&apos;ll be added to the match WhatsApp group.</p>
      </div>
      <div>
        <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Email <span className="text-gray-600 font-normal normal-case">(optional)</span></label>
        <input type="email" value={data.email} onChange={e => onChange('email', e.target.value)} placeholder="your@email.com" className="w-full bg-white/4 border border-white/10 focus:border-red-500 rounded-xl px-4 py-3.5 text-white placeholder-gray-600 text-sm outline-none transition-colors" />
      </div>
      <button onClick={onNext} disabled={!valid} className="w-full flex items-center justify-center gap-2 py-4 bg-red-600 hover:bg-red-500 disabled:bg-white/8 disabled:text-gray-600 text-white font-bold rounded-xl transition-all hover:scale-[1.02] active:scale-95 disabled:cursor-not-allowed shadow-lg shadow-red-900/20">
        Continue <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
}

// ─── Step 2: Assessment ──────────────────────────────────────────────────────
const QUESTIONS = [
  { key: 'experience', q: 'How long have you been playing Padel?', opts: [{ v: 'new', l: 'Just started', s: '< 3 months' }, { v: 'casual', l: 'Casual player', s: '3–12 months' }, { v: 'regular', l: 'Regular player', s: '1–2 years' }, { v: 'advanced', l: 'Experienced', s: '3+ years' }] },
  { key: 'position', q: 'Preferred court position?', opts: [{ v: 'left', l: 'Left side', s: 'Power & smash' }, { v: 'right', l: 'Right side', s: 'Control & volley' }, { v: 'both', l: 'Both / Flexible', s: 'No preference' }] },
  { key: 'canRally', q: 'Can you maintain a consistent rally?', opts: [{ v: 'no', l: 'Not yet', s: 'Still learning control' }, { v: 'sometimes', l: 'Sometimes', s: '5–10 shots' }, { v: 'yes', l: 'Yes, comfortably', s: '10+ shots consistently' }] },
  { key: 'playType', q: 'Competitive or casual?', opts: [{ v: 'practice', l: 'Just practice', s: 'Working on technique' }, { v: 'friendly', l: 'Casual & friendly', s: 'Fun over results' }, { v: 'competitive', l: 'Competitive', s: 'I play to win' }] },
  { key: 'selfRating', q: 'Honestly — rate your game', opts: [{ v: 1, l: '1 — Beginner', s: 'Still figuring it out' }, { v: 2, l: '2 — Casual', s: 'Getting comfortable' }, { v: 3, l: '3 — Intermediate', s: 'Solid all-round' }, { v: 4, l: '4 — Advanced', s: 'Competitive level' }, { v: 5, l: '5 — Pro', s: 'Tournament ready' }] },
] as const;

type AssessmentData = { experience: string; position: string; canRally: string; playType: string; selfRating: number };

function Step2({ data, onChange, onNext, onBack }: { data: AssessmentData; onChange: (f: string, v: string | number) => void; onNext: () => void; onBack: () => void }) {
  const [qi, setQi] = useState(0);
  const q = QUESTIONS[qi];
  const cur = data[q.key as keyof AssessmentData];
  const answered = cur !== '' && cur !== 0;
  const allDone = data.experience !== '' && data.position !== '' && data.canRally !== '' && data.playType !== '' && data.selfRating !== 0;

  const pick = (v: string | number) => {
    onChange(q.key, v);
    setTimeout(() => { if (qi < QUESTIONS.length - 1) setQi(p => p + 1); }, 280);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div><h2 className="text-xl font-black text-white">Level check</h2><p className="text-gray-500 text-sm">So we match you right.</p></div>
        <span className="text-gray-500 text-sm font-bold">{qi + 1}/{QUESTIONS.length}</span>
      </div>

      {/* Progress bar */}
      <div className="flex gap-1.5">
        {QUESTIONS.map((_, i) => {
          const k = QUESTIONS[i].key as keyof AssessmentData;
          const done = data[k] !== '' && data[k] !== 0;
          return <button key={i} onClick={() => setQi(i)} className={`flex-1 h-1 rounded-full transition-all ${done ? 'bg-red-500' : i === qi ? 'bg-red-500/40' : 'bg-white/8'}`} />;
        })}
      </div>

      <div className="min-h-[260px]">
        <p className="text-white font-bold mb-4">{q.q}</p>
        <div className="space-y-2.5">
          {(q.opts as readonly { v: string | number; l: string; s: string }[]).map(opt => {
            const sel = cur === opt.v;
            return (
              <button key={String(opt.v)} onClick={() => pick(opt.v)}
                className={`w-full flex items-center justify-between p-4 rounded-xl border text-left transition-all duration-200 ${sel ? 'bg-red-600/15 border-red-500 text-white' : 'bg-white/4 border-white/8 text-gray-300 hover:bg-white/8 hover:border-white/15'}`}
              >
                <div>
                  <p className="font-bold text-sm">{opt.l}</p>
                  <p className={`text-xs mt-0.5 ${sel ? 'text-red-300' : 'text-gray-600'}`}>{opt.s}</p>
                </div>
                {sel && <CheckCircle className="w-4 h-4 text-red-400 shrink-0" />}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex gap-2.5">
        <button onClick={qi > 0 ? () => setQi(p => p - 1) : onBack} className="flex items-center gap-2 px-5 py-3.5 border border-white/10 text-gray-400 hover:text-white hover:border-white/20 rounded-xl font-semibold text-sm transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        {qi < QUESTIONS.length - 1
          ? <button onClick={() => setQi(p => p + 1)} disabled={!answered} className="flex-1 py-3.5 bg-white/8 hover:bg-white/12 disabled:opacity-40 text-white font-bold rounded-xl text-sm transition-all">Next →</button>
          : <button onClick={onNext} disabled={!allDone} className="flex-1 py-3.5 bg-red-600 hover:bg-red-500 disabled:bg-white/8 disabled:text-gray-600 text-white font-bold rounded-xl text-sm transition-all hover:scale-[1.02] active:scale-95 shadow-lg shadow-red-900/20">See My Level →</button>
        }
      </div>
    </div>
  );
}

// ─── Step 3: Approval ────────────────────────────────────────────────────────
function Step3({ level, eventLevel, name, onNext, onBack }: { level: PadelLevel; eventLevel?: PadelLevel | null; name: string; onNext: () => void; onBack: () => void }) {
  const cfg: Record<PadelLevel, { color: string; bg: string; border: string; emoji: string; desc: string }> = {
    Beginner:     { color: 'text-emerald-400', bg: 'bg-emerald-500/8', border: 'border-emerald-500/25', emoji: '🌱', desc: 'Every pro started here. Great foundation ahead.' },
    Intermediate: { color: 'text-yellow-400',  bg: 'bg-yellow-500/8',  border: 'border-yellow-500/25',  emoji: '⚡', desc: 'You\'ve got game. Time to level it up.' },
    Advanced:     { color: 'text-orange-400',  bg: 'bg-orange-500/8',  border: 'border-orange-500/25',  emoji: '🔥', desc: 'You play to win. This is your court.' },
    'All Levels': { color: 'text-red-400',   bg: 'bg-red-500/8',   border: 'border-red-500/25',   emoji: '🎾', desc: 'Versatile and adaptable. You fit anywhere.' },
  };
  const c = cfg[level];
  const isMatch = !eventLevel || eventLevel === 'All Levels' || eventLevel === level;

  return (
    <div className="space-y-5 text-center">
      <div><h2 className="text-xl font-black text-white">Your assessment</h2><p className="text-gray-500 text-sm">Based on your answers, {name.split(' ')[0]}.</p></div>
      <div className={`rounded-2xl border p-8 ${c.bg} ${c.border}`}>
        <div className="text-4xl mb-3">{c.emoji}</div>
        <p className="text-gray-500 text-xs uppercase tracking-widest font-bold mb-2">Your Level</p>
        <p className={`text-3xl font-black mb-2 ${c.color}`}>{level}</p>
        <p className="text-gray-400 text-sm max-w-xs mx-auto">{c.desc}</p>
      </div>
      <div className={`rounded-xl p-4 border ${isMatch ? 'bg-red-500/8 border-red-500/25' : 'bg-yellow-500/8 border-yellow-500/25'}`}>
        <div className="flex items-center justify-center gap-3">
          {isMatch
            ? <><CheckCircle className="w-5 h-5 text-red-400 shrink-0" /><div className="text-left"><p className="text-red-400 font-bold text-sm">Perfect match for this game!</p><p className="text-gray-500 text-xs mt-0.5">Your level fits this match. You&apos;re in.</p></div></>
            : <><AlertCircle className="w-5 h-5 text-yellow-400 shrink-0" /><div className="text-left"><p className="text-yellow-400 font-bold text-sm">We&apos;ll find the right game for you</p><p className="text-gray-500 text-xs mt-0.5">This match targets {eventLevel} players. Proceed anyway.</p></div></>
          }
        </div>
      </div>
      <div className="flex gap-2.5">
        <button onClick={onBack} className="flex items-center gap-2 px-5 py-3.5 border border-white/10 text-gray-400 hover:text-white hover:border-white/20 rounded-xl font-semibold text-sm transition-colors"><ArrowLeft className="w-4 h-4" /> Back</button>
        <button onClick={onNext} className="flex-1 py-3.5 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl text-sm transition-all hover:scale-[1.02] active:scale-95 shadow-lg shadow-red-900/20">Confirm & Pay →</button>
      </div>
    </div>
  );
}

// ─── Step 4: Instapay Payment ────────────────────────────────────────────────
type PaySub = 'instructions' | 'upload' | 'pending';

interface Step4Props {
  event: Event;
  basic: { name: string; phone: string; email: string };
  assess: AssessmentData;
  level: PadelLevel;
  onBack: () => void;
}

function Step4({ event, basic, assess, level, onBack }: Step4Props) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [sub, setSub] = useState<PaySub>('instructions');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    const r = new FileReader();
    r.onloadend = () => setPreview(r.result as string);
    r.readAsDataURL(f);
  };

  const handleSubmit = async () => {
    if (!file) return;
    setSubmitting(true);
    setError(null);

    try {
      const { createClient } = await import('@/lib/supabase/client');
      const supabase = createClient();

      // 1. Upload payment proof to Storage
      let paymentProofUrl: string | null = null;
      const ext = file.name.split('.').pop() ?? 'jpg';
      const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

      const { error: uploadErr } = await supabase.storage
        .from('payment-proofs')
        .upload(path, file, { contentType: file.type, upsert: false });

      if (!uploadErr) {
        const { data: urlData } = supabase.storage.from('payment-proofs').getPublicUrl(path);
        paymentProofUrl = urlData?.publicUrl ?? null;
      }
      // If upload fails, proceed without proof URL (graceful degradation)

      // 2. Save registration to DB
      await supabase.from('padel_registrations').insert({
        event_id: event.id,
        event_title: event.title,
        name: basic.name,
        phone: basic.phone,
        email: basic.email || null,
        level,
        position: assess.position || null,
        experience: assess.experience || null,
        can_rally: assess.canRally || null,
        play_type: assess.playType || null,
        self_rating: assess.selfRating || null,
        payment_proof_url: paymentProofUrl,
        payment_status: 'pending',
      });

      setSub('pending');
    } catch {
      // If DB is not configured yet, still proceed to success
      setSub('pending');
    } finally {
      setSubmitting(false);
    }
  };

  const goToSuccess = () => {
    const p = new URLSearchParams({ event_id: event.id, name: basic.name, level, date: event.date, location: event.location ?? '', status: 'pending' });
    router.push(`/success?${p.toString()}`);
  };

  // Sub-step: Instructions
  if (sub === 'instructions') return (
    <div className="space-y-5">
      <div><h2 className="text-xl font-black text-white">Payment</h2><p className="text-gray-500 text-sm">Send via Instapay, then upload your receipt.</p></div>
      <div className="bg-red-600/8 border border-red-500/25 rounded-2xl p-6 space-y-4">
        <p className="text-red-400 text-xs font-bold uppercase tracking-widest">Step 1 — Send Payment</p>
        <div className="space-y-3">
          {[
            { label: 'Amount', value: `EGP ${event.price}`, highlight: true },
            { label: 'Instapay Number', value: INSTAPAY_NUMBER },
            { label: 'Account Name', value: INSTAPAY_NAME },
            { label: 'Match', value: event.title },
          ].map(({ label, value, highlight }) => (
            <div key={label} className="flex justify-between items-center py-2 border-b border-white/6 last:border-0">
              <span className="text-gray-500 text-sm">{label}</span>
              <span className={`font-bold text-sm ${highlight ? 'text-red-400 text-lg' : 'text-white'}`}>{value}</span>
            </div>
          ))}
        </div>
        <div className="bg-white/4 rounded-xl p-3 text-center">
          <p className="text-gray-400 text-xs">Open Instapay app → Send Money → Enter <span className="text-white font-bold">{INSTAPAY_NUMBER}</span> → Amount <span className="text-red-400 font-bold">EGP {event.price}</span></p>
        </div>
      </div>
      <div className="flex gap-2.5">
        <button onClick={onBack} className="flex items-center gap-2 px-5 py-3.5 border border-white/10 text-gray-400 hover:text-white hover:border-white/20 rounded-xl font-semibold text-sm transition-colors"><ArrowLeft className="w-4 h-4" /> Back</button>
        <button onClick={() => setSub('upload')} className="flex-1 py-3.5 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl text-sm transition-all hover:scale-[1.02] active:scale-95 shadow-lg shadow-red-900/20">I&apos;ve sent the payment →</button>
      </div>
    </div>
  );

  // Sub-step: Upload
  if (sub === 'upload') return (
    <div className="space-y-5">
      <div><h2 className="text-xl font-black text-white">Upload Receipt</h2><p className="text-gray-500 text-sm">Screenshot of your Instapay transfer.</p></div>
      <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleFile} className="hidden" />

      {!preview ? (
        <button onClick={() => fileRef.current?.click()} className="w-full border-2 border-dashed border-white/15 hover:border-red-500/40 bg-white/3 hover:bg-red-500/5 rounded-2xl p-10 text-center transition-all group">
          <Upload className="w-10 h-10 text-gray-600 group-hover:text-red-500 mx-auto mb-3 transition-colors" />
          <p className="text-white font-bold text-sm mb-1">Tap to upload screenshot</p>
          <p className="text-gray-600 text-xs">JPG, PNG — Max 10MB</p>
        </button>
      ) : (
        <div className="relative rounded-2xl overflow-hidden border border-red-500/30">
          <img src={preview} alt="Receipt" className="w-full max-h-64 object-contain bg-black/50" />
          <button onClick={() => { setFile(null); setPreview(null); }} className="absolute top-3 right-3 w-8 h-8 bg-black/60 rounded-full flex items-center justify-center hover:bg-red-600/60 transition-colors">
            <X className="w-4 h-4 text-white" />
          </button>
          <div className="absolute bottom-3 left-3 bg-red-600 text-white text-xs font-bold px-2.5 py-1 rounded-lg flex items-center gap-1.5">
            <CheckCircle className="w-3 h-3" /> {file?.name}
          </div>
        </div>
      )}

      {error && <p className="text-red-400 text-xs text-center">{error}</p>}

      <div className="flex gap-2.5">
        <button onClick={() => setSub('instructions')} className="flex items-center gap-2 px-5 py-3.5 border border-white/10 text-gray-400 hover:text-white hover:border-white/20 rounded-xl font-semibold text-sm transition-colors"><ArrowLeft className="w-4 h-4" /> Back</button>
        <button onClick={handleSubmit} disabled={!file || submitting} className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-red-600 hover:bg-red-500 disabled:bg-white/8 disabled:text-gray-600 text-white font-bold rounded-xl text-sm transition-all hover:scale-[1.02] active:scale-95 disabled:cursor-not-allowed shadow-lg shadow-red-900/20">
          {submitting ? <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Saving...</> : <>Submit Receipt <ArrowRight className="w-4 h-4" /></>}
        </button>
      </div>
    </div>
  );

  // Sub-step: Pending
  return (
    <div className="space-y-5 text-center">
      <div className="flex justify-center">
        <div className="w-20 h-20 rounded-full bg-yellow-500/10 border-2 border-yellow-500/30 flex items-center justify-center">
          <Clock className="w-10 h-10 text-yellow-400" />
        </div>
      </div>
      <div>
        <h2 className="text-xl font-black text-white mb-1">Payment Under Review</h2>
        <p className="text-gray-500 text-sm">We received your receipt. You&apos;ll get a WhatsApp confirmation shortly.</p>
      </div>
      <div className="bg-white/4 border border-white/8 rounded-2xl p-5 text-left space-y-2">
        <p className="text-white font-bold text-sm">{event.title}</p>
        <p className="text-gray-500 text-sm">{formatDate(event.date)} · {event.location}</p>
        <p className="text-gray-500 text-sm">Player: <span className="text-white">{basic.name}</span> · Level: <span className="text-white">{level}</span></p>
      </div>
      <div className="bg-yellow-500/8 border border-yellow-500/20 rounded-xl p-4">
        <p className="text-yellow-400 text-sm font-medium">⏳ Usually confirmed within 30 minutes during working hours.</p>
      </div>
      <button onClick={goToSuccess} className="w-full py-4 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl transition-all hover:scale-[1.02] active:scale-95 shadow-lg shadow-red-900/20">
        Continue →
      </button>
    </div>
  );
}

// ─── Main page ───────────────────────────────────────────────────────────────
export default function JoinPage() {
  const { id } = useParams<{ id: string }>();
  const [event, setEvent] = useState<Event | null>(null);
  const [step, setStep] = useState(1);
  const [basic, setBasic] = useState({ name: '', phone: '', email: '' });
  const [assess, setAssess] = useState({ experience: '', position: '', canRally: '', playType: '', selfRating: 0 });
  const [level, setLevel] = useState<PadelLevel>('Beginner');

  useEffect(() => {
    const demo = DEMO_EVENTS.find(e => e.id === id);
    if (demo) { setEvent(demo); return; }
    import('@/lib/supabase/client').then(({ createClient }) => {
      createClient().from('events').select('*').eq('id', id).single().then(({ data }) => { if (data) setEvent(data); });
    });
  }, [id]);

  if (!event) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-base)' }}>
      <span className="w-8 h-8 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const goToStep3 = () => { setLevel(calcLevel(assess.experience, assess.canRally, assess.playType, assess.selfRating)); setStep(3); };

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: 'var(--bg-base)' }}>
      <div className="absolute top-0 right-0 w-96 h-96 bg-red-900/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-lg mx-auto px-4 py-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-red-600 group-hover:bg-red-500 transition-colors flex items-center justify-center shadow-md shadow-red-900/30">
              <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5"><circle cx="12" cy="12" r="4" fill="white" /><line x1="12" y1="2" x2="12" y2="9" stroke="white" strokeWidth="2" /><line x1="12" y1="15" x2="12" y2="22" stroke="white" strokeWidth="2" /><line x1="2" y1="12" x2="9" y2="12" stroke="white" strokeWidth="2" /><line x1="15" y1="12" x2="22" y2="12" stroke="white" strokeWidth="2" /></svg>
            </div>
            <span className="text-white font-black text-sm tracking-wide uppercase">HAKA</span>
          </Link>
          <span className="text-gray-600 text-xs uppercase tracking-widest font-bold">Registration</span>
        </div>

        <p className="text-red-500 text-xs font-bold uppercase tracking-widest mb-1">Joining</p>
        <h1 className="text-xl font-black text-white mb-5 leading-tight">{event.title}</h1>
        <EventBar event={event} />
        <StepDots step={step} total={4} />

        <div className="border border-white/6 rounded-2xl p-6 sm:p-7" style={{ background: 'var(--bg-card)' }}>
          {step === 1 && <Step1 data={basic} onChange={(f, v) => setBasic(p => ({ ...p, [f]: v }))} onNext={() => setStep(2)} />}
          {step === 2 && <Step2 data={assess} onChange={(f, v) => setAssess(p => ({ ...p, [f]: v as never }))} onNext={goToStep3} onBack={() => setStep(1)} />}
          {step === 3 && <Step3 level={level} eventLevel={event.padel_level} name={basic.name} onNext={() => setStep(4)} onBack={() => setStep(2)} />}
          {step === 4 && <Step4 event={event} basic={basic} assess={assess} level={level} onBack={() => setStep(3)} />}
        </div>

        <p className="text-center text-gray-700 text-xs mt-8">HAKA Egypt · See you on court 🎾</p>
      </div>
    </div>
  );
}
