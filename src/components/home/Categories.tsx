'use client';

import { useState } from 'react';

const CATEGORIES = [
  { id: 'all',          label: 'All Matches',   emoji: '🎾' },
  { id: 'beginner',     label: 'Beginner',      emoji: '🌱' },
  { id: 'intermediate', label: 'Intermediate',  emoji: '⚡' },
  { id: 'advanced',     label: 'Advanced',      emoji: '🔥' },
  { id: 'tournament',   label: 'Tournament',    emoji: '🏆' },
  { id: 'evening',      label: 'Evening',       emoji: '🌙' },
  { id: 'weekend',      label: 'Weekend',       emoji: '☀️' },
  { id: 'open',         label: 'Open Day',      emoji: '🤝' },
];

export default function Categories() {
  const [active, setActive] = useState('all');

  return (
    <section className="sticky top-[4.5rem] z-30 border-b border-white/6 shadow-lg shadow-black/30" style={{ background: 'var(--bg-base)' }}>
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide py-1">
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActive(cat.id)}
              className={`flex flex-col items-center gap-1 px-5 py-3 rounded-none whitespace-nowrap transition-all duration-200 shrink-0 border-b-2 ${
                active === cat.id
                  ? 'border-red-500 text-white'
                  : 'border-transparent text-gray-500 hover:text-gray-300 hover:border-white/15'
              }`}
            >
              <span className="text-xl leading-none">{cat.emoji}</span>
              <span className="text-xs font-semibold">{cat.label}</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
