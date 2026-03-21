const STATS = [
  { value: '200+', label: 'Active Players', icon: '🎾' },
  { value: '50+',  label: 'Matches Played', icon: '🏆' },
  { value: '6',    label: 'Partner Courts', icon: '📍' },
  { value: '100%', label: 'Satisfaction',   icon: '⭐' },
];

export default function Stats() {
  return (
    <section className="py-16 px-4 border-y border-white/5" style={{ background: 'var(--bg-section)' }}>
      <div className="max-w-4xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {STATS.map(({ value, label, icon }) => (
            <div key={label} className="border border-white/6 hover:border-red-600/25 rounded-2xl p-6 text-center group transition-all duration-300" style={{ background: 'var(--bg-raised)' }}>
              <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">{icon}</div>
              <div className="text-3xl font-black text-white mb-1">{value}</div>
              <div className="text-xs text-gray-500 font-medium uppercase tracking-wider">{label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
