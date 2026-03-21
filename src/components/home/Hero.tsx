import Link from 'next/link';

export default function Hero() {
  return (
    <section className="relative flex flex-col items-center justify-center overflow-hidden" style={{ minHeight: '92vh', background: 'var(--bg-base)' }}>

      {/* Padel player smashing — confirmed padel image */}
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1646649851800-48dba35edc76?w=1920&q=85&auto=format&fit=crop"
          alt="Padel pro match action"
          className="w-full h-full object-cover opacity-25"
        />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(6,16,10,0.75) 0%, rgba(6,16,10,0.35) 50%, var(--bg-base) 100%)' }} />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, rgba(6,16,10,0.65) 0%, transparent 50%, rgba(6,16,10,0.45) 100%)' }} />
      </div>

      {/* Court grid — red tint */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.06]"
        style={{ backgroundImage: 'linear-gradient(rgba(220,38,38,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(220,38,38,0.6) 1px, transparent 1px)', backgroundSize: '60px 60px' }}
      />

      {/* Corner brackets */}
      <div className="absolute top-8 left-6 w-10 h-10 border-t-2 border-l-2 border-red-600/40" />
      <div className="absolute top-8 right-6 w-10 h-10 border-t-2 border-r-2 border-red-600/40" />
      <div className="absolute bottom-16 left-6 w-10 h-10 border-b-2 border-l-2 border-red-600/40" />
      <div className="absolute bottom-16 right-6 w-10 h-10 border-b-2 border-r-2 border-red-600/40" />

      {/* Content */}
      <div className="relative z-10 w-full max-w-5xl mx-auto px-4 flex flex-col items-center text-center">

        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-red-600/15 border border-red-500/35 text-red-400 px-4 py-1.5 rounded-full text-xs font-bold mb-8 tracking-wider uppercase backdrop-blur-sm">
          <span className="w-1.5 h-1.5 bg-red-400 rounded-full animate-pulse" />
          Cairo&apos;s #1 Padel Community
        </div>

        {/* Headline */}
        <h1 className="font-black text-white leading-[0.92] tracking-tight mb-5" style={{ fontSize: 'clamp(2.8rem, 10vw, 7rem)' }}>
          Book Your Next
          <br />
          <span className="text-red-500">Padel Match</span>
        </h1>

        <p className="text-gray-300 text-lg md:text-xl max-w-md mb-10 leading-relaxed font-medium">
          Play. Compete. Connect.
          <br />
          <span className="text-gray-400 text-base">Smart matchmaking for all levels across Cairo.</span>
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-3 mb-14">
          <Link href="/events">
            <button className="group flex items-center gap-2 px-9 py-4 bg-red-600 hover:bg-red-500 text-white font-black text-base rounded-xl transition-all duration-200 hover:scale-105 active:scale-95 shadow-xl shadow-red-900/40 tracking-wide">
              Find a Match
              <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </button>
          </Link>
          <Link href="#how-it-works">
            <button className="px-9 py-4 border border-white/25 hover:border-red-500/50 hover:bg-red-600/8 text-white/80 hover:text-white font-semibold text-base rounded-xl transition-all duration-200 tracking-wide backdrop-blur-sm">
              How It Works
            </button>
          </Link>
        </div>

        {/* Stats */}
        <div className="flex flex-wrap justify-center gap-10">
          {[
            { value: '200+', label: 'Active Players' },
            { value: '6',    label: 'Courts Booked' },
            { value: '50+',  label: 'Matches Played' },
          ].map(({ value, label }) => (
            <div key={label} className="text-center">
              <div className="text-2xl font-black text-white">{value}</div>
              <div className="text-xs text-gray-400 font-medium uppercase tracking-wider mt-0.5">{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll cue */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce opacity-40">
        <div className="w-px h-8 bg-gradient-to-b from-red-500 to-transparent" />
      </div>
    </section>
  );
}
