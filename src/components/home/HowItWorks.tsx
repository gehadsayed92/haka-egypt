import Link from 'next/link';

const STEPS = [
  {
    number: '01',
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
      </svg>
    ),
    title: 'Pick Your Match',
    desc: 'Browse upcoming Padel sessions filtered by level, location, and time. Find one that fits your schedule.',
  },
  {
    number: '02',
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: 'Confirm Your Level',
    desc: 'Answer 5 quick questions. Our smart system places you in the right game — no sandbagging, no mismatches.',
  },
  {
    number: '03',
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
      </svg>
    ),
    title: 'Pay & Join the Group',
    desc: 'Pay via Instapay, upload your receipt, and get added to the WhatsApp match group. See you on court.',
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 px-4 border-y border-white/5" style={{ background: 'var(--bg-section)' }}>
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="text-center mb-16">
          <p className="text-red-500 text-xs font-bold uppercase tracking-widest mb-3">Simple Process</p>
          <h2 className="text-4xl font-black text-white mb-4">How It Works</h2>
          <p className="text-gray-400 max-w-sm mx-auto text-base">From discovery to first serve in under 3 minutes.</p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
          <div className="hidden md:block absolute top-10 left-[calc(16.67%+1rem)] right-[calc(16.67%+1rem)] h-px bg-gradient-to-r from-red-600/40 via-red-500/20 to-red-600/40" />

          {STEPS.map((step, i) => (
            <div key={i} className="relative flex flex-col items-center text-center p-8 rounded-2xl border border-white/6 hover:border-red-600/25 transition-all duration-300 group" style={{ background: 'var(--bg-card)' }}>
              <span className="absolute -top-3 left-6 text-xs font-black text-red-600/50 tracking-widest">{step.number}</span>

              <div className="w-20 h-20 rounded-full bg-red-600/8 border border-red-600/20 group-hover:border-red-500/40 group-hover:bg-red-600/14 flex items-center justify-center mb-6 text-red-400 transition-all duration-300">
                {step.icon}
              </div>

              <h3 className="text-white font-black text-lg mb-3">{step.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <Link href="/events">
            <button className="px-8 py-4 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl transition-all hover:scale-105 active:scale-95 shadow-lg shadow-red-900/30">
              Start Now — Find a Match
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
}
