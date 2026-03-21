import { Star } from 'lucide-react';

const TESTIMONIALS = [
  {
    name: 'Ahmed Karim', location: 'New Cairo',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80&auto=format&fit=crop&crop=face',
    quote: "I was a complete beginner. HAKA placed me perfectly — no embarrassment, just good padel. Three months later I moved up to Intermediate.",
    rating: 5, level: 'Beginner → Intermediate',
  },
  {
    name: 'Sara Hassan', location: 'Maadi, Cairo',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80&auto=format&fit=crop&crop=face',
    quote: 'The level assessment is spot on. I got matched with players at my exact level — super competitive and fun. Best padel experience in Cairo.',
    rating: 5, level: 'Intermediate',
  },
  {
    name: 'Omar Farouk', location: 'Zamalek, Cairo',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&q=80&auto=format&fit=crop&crop=face',
    quote: "Signed up, assessed, joined the WhatsApp group — 5 minutes total. Played the next day. The community is real, the matches are legit.",
    rating: 5, level: 'Advanced',
  },
];

export default function Testimonials() {
  return (
    <section className="py-20 px-4 border-t border-white/5" style={{ background: 'var(--bg-section)' }}>
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-red-500 text-xs font-bold uppercase tracking-widest mb-3">Player Reviews</p>
          <h2 className="text-4xl font-black text-white">What Players Say</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {TESTIMONIALS.map((t, i) => (
            <div key={i} className="rounded-2xl p-6 border border-white/6 hover:border-red-600/20 transition-all duration-300 group flex flex-col" style={{ background: 'var(--bg-card)' }}>
              {/* Stars */}
              <div className="flex gap-0.5 mb-4">
                {[...Array(t.rating)].map((_, s) => <Star key={s} className="w-4 h-4 fill-red-500 text-red-500" />)}
              </div>

              {/* Quote */}
              <p className="text-gray-300 text-sm leading-relaxed mb-5 flex-1 italic">&ldquo;{t.quote}&rdquo;</p>

              {/* Level badge — neutral */}
              <span className="inline-block text-xs font-bold px-3 py-1 rounded-lg mb-5 border border-white/12 bg-white/5 text-gray-400 self-start">
                {t.level}
              </span>

              {/* Author */}
              <div className="flex items-center gap-3 pt-4 border-t border-white/6">
                <img src={t.avatar} alt={t.name} className="w-10 h-10 rounded-full object-cover border-2 border-red-600/20" />
                <div>
                  <div className="font-bold text-white text-sm">{t.name}</div>
                  <div className="text-xs text-gray-500">{t.location}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
