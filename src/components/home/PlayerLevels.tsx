// 100% padel-specific images — courts, net play, action shots
const LEVELS = [
  {
    label: 'Beginner',
    icon: '🌱',
    traits: ['Playing for less than 6 months', 'Still learning ball control', 'Practice-focused sessions', 'Short rallies (under 5 shots)'],
    cta: 'Perfect for you if...',
    img: 'https://images.unsplash.com/photo-1658491830143-72808ca237e3?w=600&q=80&auto=format&fit=crop',
  },
  {
    label: 'Intermediate',
    icon: '⚡',
    traits: ['Playing for 6 months – 2 years', 'Consistent rallies (5–15 shots)', 'Plays friendly & casual matches', 'Decent serve and smash'],
    cta: 'Your level if...',
    img: 'https://images.unsplash.com/photo-1646649851780-d9701b7c3c04?w=600&q=80&auto=format&fit=crop',
    featured: true,
  },
  {
    label: 'Advanced',
    icon: '🔥',
    traits: ['Playing for 2+ years', 'Long rallies (15+ shots)', 'Plays competitive matches', 'Strong tactical awareness'],
    cta: 'You belong here if...',
    img: 'https://images.unsplash.com/photo-1646649851800-48dba35edc76?w=600&q=80&auto=format&fit=crop',
  },
];

export default function PlayerLevels() {
  return (
    <section className="py-24 px-4" style={{ background: 'var(--bg-base)' }}>
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="text-center mb-14">
          <p className="text-red-500 text-xs font-bold uppercase tracking-widest mb-3">Smart Matchmaking</p>
          <h2 className="text-4xl font-black text-white mb-4">Find Your Level</h2>
          <p className="text-gray-400 max-w-md mx-auto text-base">
            We match you with players at your skill level so every match is fun, fair, and competitive.
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {LEVELS.map((level) => (
            <div key={level.label}
              className={`relative rounded-2xl border border-white/6 overflow-hidden transition-all duration-300 group hover:border-red-600/30 ${level.featured ? 'md:-mt-4 md:mb-4' : ''}`}
              style={{ background: 'var(--bg-card)' }}
            >
              {level.featured && (
                <div className="absolute top-4 right-4 z-10">
                  <span className="px-2.5 py-1 bg-red-600 text-white text-xs font-bold rounded-lg">Most Common</span>
                </div>
              )}

              {/* Image */}
              <div className="aspect-[16/9] overflow-hidden relative">
                <img src={level.img} alt={`${level.label} padel`} className="w-full h-full object-cover opacity-60 group-hover:opacity-80 group-hover:scale-105 transition-all duration-500" />
                <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, var(--bg-card) 0%, rgba(0,0,0,0.2) 60%, transparent 100%)' }} />
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-2xl">{level.icon}</span>
                  <span className="px-3 py-1 rounded-lg text-sm font-bold border border-white/15 bg-white/5 text-white">{level.label}</span>
                </div>

                <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-3">{level.cta}</p>
                <ul className="space-y-2">
                  {level.traits.map((trait, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm text-gray-400">
                      <span className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 bg-red-500/70" />
                      {trait}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        <p className="text-center text-gray-600 text-sm mt-10">
          Not sure? Our 5-question assessment will place you automatically when you sign up. 🎾
        </p>
      </div>
    </section>
  );
}
