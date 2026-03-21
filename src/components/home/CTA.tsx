import Link from 'next/link';

export default function CTA() {
  return (
    <section className="relative py-24 px-4 overflow-hidden" style={{ background: 'var(--bg-base)' }}>
      {/* Padel court background — aerial court view */}
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1646649853703-7645147474ba?w=1920&q=80&auto=format&fit=crop"
          alt="Padel rackets on court"
          className="w-full h-full object-cover opacity-10"
        />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, var(--bg-base) 0%, rgba(6,16,10,0.85) 60%, rgba(6,16,10,0.65) 100%)' }} />
      </div>

      {/* Subtle red grid */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.04]"
        style={{ backgroundImage: 'linear-gradient(rgba(220,38,38,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(220,38,38,0.8) 1px, transparent 1px)', backgroundSize: '80px 80px' }}
      />

      {/* Corner marks */}
      <div className="absolute top-8 left-8 w-8 h-8 border-t-2 border-l-2 border-red-600/30" />
      <div className="absolute top-8 right-8 w-8 h-8 border-t-2 border-r-2 border-red-600/30" />
      <div className="absolute bottom-8 left-8 w-8 h-8 border-b-2 border-l-2 border-red-600/30" />
      <div className="absolute bottom-8 right-8 w-8 h-8 border-b-2 border-r-2 border-red-600/30" />

      <div className="relative max-w-2xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 bg-red-600/10 border border-red-500/25 text-red-400 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-8">
          <span className="w-1.5 h-1.5 bg-red-400 rounded-full animate-pulse" />
          Courts are waiting
        </div>

        <h2 className="text-5xl md:text-6xl font-black text-white leading-tight mb-5">
          See You<br />
          <span className="text-red-500">On Court.</span>
        </h2>

        <p className="text-gray-300 text-lg leading-relaxed mb-10 max-w-md mx-auto">
          Join Cairo&apos;s fastest-growing Padel community. Smart matchmaking, real competition, instant WhatsApp access.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/events">
            <button className="group flex items-center justify-center gap-2 px-9 py-4 bg-red-600 hover:bg-red-500 text-white font-bold text-base rounded-xl transition-all hover:scale-105 active:scale-95 shadow-xl shadow-red-900/30">
              Find a Match
              <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </button>
          </Link>
          <Link href="/register">
            <button className="px-9 py-4 border border-white/20 hover:border-white/40 hover:bg-white/5 text-white/80 hover:text-white font-semibold text-base rounded-xl transition-all">
              Create Account
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
}
