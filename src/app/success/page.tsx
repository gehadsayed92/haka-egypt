'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckCircle, MessageCircle, Calendar, MapPin, Shield, Loader2, Clock, Phone } from 'lucide-react';
import Link from 'next/link';
import { formatDate } from '@/lib/utils';

const ORGANIZER_WHATSAPP = 'https://wa.me/+201234567890?text=' + encodeURIComponent('Hi! I just registered for a HAKA Padel match and have a question about my payment.');

const DEMO_GROUP_URLS: Record<string, { group_url: string; title: string }> = {
  'padel-1': { group_url: 'https://chat.whatsapp.com/ChdQklSOkhHEdP8aAlBskk', title: 'HAKA Open Match — New Cairo' },
  'padel-2': { group_url: 'https://chat.whatsapp.com/ChdQklSOkhHEdP8aAlBskk', title: 'Intermediate Padel Session' },
  'padel-3': { group_url: 'https://chat.whatsapp.com/ChdQklSOkhHEdP8aAlBskk', title: 'Beginners Welcome — Palm Hills' },
  'padel-4': { group_url: 'https://chat.whatsapp.com/ChdQklSOkhHEdP8aAlBskk', title: 'Advanced Padel Tournament' },
  'padel-5': { group_url: 'https://chat.whatsapp.com/ChdQklSOkhHEdP8aAlBskk', title: 'Evening Padel — Wadi Degla' },
  'padel-6': { group_url: 'https://chat.whatsapp.com/ChdQklSOkhHEdP8aAlBskk', title: 'HAKA Monthly Showdown' },
};

function SuccessContent() {
  const searchParams = useSearchParams();

  const name     = searchParams.get('name') ?? '';
  const phone    = searchParams.get('phone') ?? '';
  const level    = searchParams.get('level') ?? '';
  const date     = searchParams.get('date') ?? '';
  const location = searchParams.get('location') ?? '';
  const eventId  = searchParams.get('event_id') ?? '';
  const status   = searchParams.get('status') ?? 'confirmed';

  const isPending = status === 'pending';

  const [groupUrl, setGroupUrl] = useState<string | null>(null);
  const [eventTitle, setEventTitle] = useState<string>('');
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    if (!eventId) return;
    const demo = DEMO_GROUP_URLS[eventId];
    if (demo) { setGroupUrl(demo.group_url); setEventTitle(demo.title); return; }
    import('@/lib/supabase/client').then(({ createClient }) => {
      createClient().from('events').select('group_url,title').eq('id', eventId).single()
        .then(({ data }) => {
          if (data?.group_url) setGroupUrl(data.group_url);
          if (data?.title) setEventTitle(data.title);
        });
    });
  }, [eventId]);

  useEffect(() => {
    const t = setTimeout(() => setPulse(true), 400);
    return () => clearTimeout(t);
  }, []);

  const buildWhatsAppLink = () => {
    if (!groupUrl) return null;
    if (groupUrl.includes('chat.whatsapp.com')) return groupUrl;
    const cleanPhone = phone.replace(/\D/g, '');
    const dateStr = date ? formatDate(date) : 'upcoming';
    const message = `Hi! I just registered for HAKA Padel — ${eventTitle || 'match'} on ${dateStr} at ${location}. My name is ${name}, level: ${level}. Looking forward to playing! 🎾`;
    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
  };

  const whatsappLink = buildWhatsAppLink() ?? groupUrl;
  const firstName = name.split(' ')[0] || 'Warrior';

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden" style={{ background: 'var(--bg-base)' }}>
      {/* Background — padel court, very subtle */}
      <div className="absolute inset-0 pointer-events-none">
        <img
          src="https://images.unsplash.com/photo-1658491830143-72808ca237e3?w=1920&q=60&auto=format&fit=crop"
          alt=""
          className="w-full h-full object-cover opacity-[0.04]"
        />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, var(--bg-base) 0%, transparent 40%, transparent 60%, var(--bg-base) 100%)' }} />
      </div>

      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl transition-opacity duration-1000 ${pulse ? 'opacity-100' : 'opacity-0'} w-[500px] h-[500px] ${isPending ? 'bg-white/3' : 'bg-red-700/6'}`} />

        {/* Corner marks */}
        <div className="absolute top-10 left-6 w-10 h-10 border-t border-l border-red-600/20" />
        <div className="absolute top-10 right-6 w-10 h-10 border-t border-r border-red-600/20" />
        <div className="absolute bottom-10 left-6 w-10 h-10 border-b border-l border-red-600/20" />
        <div className="absolute bottom-10 right-6 w-10 h-10 border-b border-r border-red-600/20" />
      </div>

      <div className="relative z-10 max-w-sm w-full text-center py-12">
        {/* HAKA logo mark */}
        <div className="flex justify-center mb-10">
          <img src="/haka-logo.svg" alt="HAKA Egypt" className="h-7 w-auto opacity-70" />
        </div>

        {/* Status icon */}
        <div className="flex justify-center mb-8">
          {isPending ? (
            <div className={`w-24 h-24 rounded-full flex items-center justify-center transition-all duration-700 ${pulse ? 'bg-white/5 border-2 border-white/20 scale-100' : 'scale-75 opacity-0'}`}>
              <Clock className="w-12 h-12 text-gray-300" />
            </div>
          ) : (
            <div className={`w-24 h-24 rounded-full flex items-center justify-center transition-all duration-700 ${pulse ? 'bg-red-600/10 border-2 border-red-500/30 scale-100' : 'scale-75 opacity-0'}`}>
              <CheckCircle className="w-12 h-12 text-red-400" />
            </div>
          )}
        </div>

        {/* Headline */}
        {isPending ? (
          <>
            <h1 className="text-4xl font-black text-white mb-2 leading-tight">
              Payment
              <br />
              <span className="text-gray-400">Under Review</span>
            </h1>
            <p className="text-gray-400 text-base mb-2">{firstName}, we received your receipt.</p>
            <p className="text-gray-500 text-sm mb-8 leading-relaxed">
              Once confirmed, you&apos;ll get WhatsApp access to your match group. Usually within a few hours.
            </p>
          </>
        ) : (
          <>
            <h1 className="text-4xl font-black text-white mb-2 leading-tight">
              You&apos;re In.
              <br />
              <span className="text-red-500">See You On Court.</span>
            </h1>
            <p className="text-gray-400 text-base mb-8">{firstName}, your spot is confirmed.</p>
          </>
        )}

        {/* Event details card */}
        {(eventTitle || date || location || level) && (
          <div className="border border-white/8 rounded-2xl p-5 mb-6 text-left space-y-3" style={{ background: 'var(--bg-raised)' }}>
            {eventTitle && <p className="text-white font-black text-sm leading-snug">{eventTitle}</p>}
            {date && (
              <div className="flex items-center gap-2.5 text-sm text-gray-400">
                <Calendar className="w-4 h-4 text-gray-500 shrink-0" />
                {formatDate(date)}
              </div>
            )}
            {location && (
              <div className="flex items-center gap-2.5 text-sm text-gray-400">
                <MapPin className="w-4 h-4 text-gray-500 shrink-0" />
                {location}
              </div>
            )}
            {level && (
              <div className="flex items-center gap-2.5 text-sm text-gray-400">
                <Shield className="w-4 h-4 text-gray-500 shrink-0" />
                Level: <span className="text-white font-bold">{level}</span>
              </div>
            )}
          </div>
        )}

        {/* Pending notice */}
        {isPending && (
          <div className="bg-white/4 border border-white/10 rounded-2xl p-4 mb-6 text-left">
            <p className="text-white/60 text-xs font-bold uppercase tracking-widest mb-1">What happens next</p>
            <ul className="text-gray-400 text-sm space-y-1.5 mt-2">
              <li>1. Our team reviews your Instapay receipt</li>
              <li>2. You get added to the match WhatsApp group</li>
              <li>3. Show up, warm up, play. 🎾</li>
            </ul>
          </div>
        )}

        {/* CTAs */}
        {isPending ? (
          <div className="space-y-3">
            <div className="w-full flex items-center justify-center gap-3 py-4 bg-white/5 border border-white/10 text-gray-500 font-bold text-sm rounded-xl cursor-not-allowed select-none">
              <MessageCircle className="w-5 h-5" />
              WhatsApp Group — Pending Approval
            </div>
            <a href={ORGANIZER_WHATSAPP} target="_blank" rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-3 py-3.5 border border-red-600/30 hover:border-red-500/50 hover:bg-red-600/8 text-red-400 hover:text-red-300 font-semibold text-sm rounded-xl transition-all">
              <Phone className="w-4 h-4" />
              Contact Organizer
            </a>
          </div>
        ) : whatsappLink ? (
          <div className="space-y-3">
            {/* WhatsApp keeps brand color */}
            <a href={whatsappLink} target="_blank" rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-3 py-4 bg-[#25D366] hover:bg-[#1ebe5d] text-white font-black text-base rounded-xl transition-all hover:scale-105 active:scale-95 shadow-lg shadow-black/30">
              <MessageCircle className="w-5 h-5" />
              Join WhatsApp Group
            </a>
            <a href={ORGANIZER_WHATSAPP} target="_blank" rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-3 py-3.5 border border-white/10 hover:border-white/20 text-gray-500 hover:text-gray-300 font-semibold text-sm rounded-xl transition-all">
              <Phone className="w-4 h-4" />
              Contact Organizer
            </a>
          </div>
        ) : (
          <div className="border border-white/8 rounded-2xl p-5 mb-4" style={{ background: 'var(--bg-raised)' }}>
            <p className="text-gray-400 text-sm">You&apos;ll receive your WhatsApp group link shortly. Check your phone.</p>
          </div>
        )}

        <Link href="/events" className="block mt-4">
          <button className="w-full py-3.5 border border-white/10 text-gray-500 hover:text-white hover:border-white/20 font-semibold rounded-xl transition-all text-sm">
            Browse More Matches
          </button>
        </Link>

        <p className="text-gray-700 text-xs mt-8">HAKA Egypt · Cairo&apos;s Padel Community 🎾</p>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen" style={{ background: 'var(--bg-base)' }}>
        <Loader2 className="w-10 h-10 text-red-600 animate-spin" />
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}
