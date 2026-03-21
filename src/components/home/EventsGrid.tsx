'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Calendar, MapPin, Users, ArrowRight, Clock, ChevronDown } from 'lucide-react';
import { formatDate, formatTime } from '@/lib/utils';
import type { Event } from '@/types';

interface EventsGridProps {
  events: (Event & { rsvp_count: number })[];
}

/**
 * 100% padel-specific Unsplash images.
 * Every ID below has been verified to show padel courts, players, or rackets.
 */
const PADEL_IMAGES = [
  // Man playing padel — action shot
  'https://images.unsplash.com/photo-1646649851800-48dba35edc76?w=800&q=80&auto=format&fit=crop',
  // Players celebrating a padel match point
  'https://images.unsplash.com/photo-1646649851780-d9701b7c3c04?w=800&q=80&auto=format&fit=crop',
  // Padel match celebration — doubles team
  'https://images.unsplash.com/photo-1646649852033-7e0f3d679f8b?w=800&q=80&auto=format&fit=crop',
  // Padel court net and glass cage
  'https://images.unsplash.com/photo-1658491830143-72808ca237e3?w=800&q=80&auto=format&fit=crop',
  // Padel pro match action
  'https://images.unsplash.com/photo-1767128890954-20ce481be8f0?w=800&q=80&auto=format&fit=crop',
  // Padel player in motion
  'https://images.unsplash.com/photo-1767128890940-6dfe3d9fc3db?w=800&q=80&auto=format&fit=crop',
];

const DEMO_EVENTS: (Event & { rsvp_count: number })[] = [
  { id: 'padel-1', title: 'HAKA Open Match',       description: 'Mixed-level friendly match. All welcome. 2 courts booked, competitive but fun.',            location: 'New Cairo Sports Club',       date: '2026-03-28T09:00:00', capacity: 8,  rsvp_count: 5,  image_url: PADEL_IMAGES[0], created_by: '', created_at: '', price: 250, group_url: 'https://chat.whatsapp.com/ChdQklSOkhHEdP8aAlBskk', padel_level: 'All Levels',    court_name: 'Court A & B',  duration_hours: 1.5 },
  { id: 'padel-2', title: 'Intermediate Session',   description: 'Fast-paced rotations for players who can maintain consistent rallies across 2 courts.',     location: 'Maadi Club, Cairo',            date: '2026-04-01T18:30:00', capacity: 8,  rsvp_count: 6,  image_url: PADEL_IMAGES[1], created_by: '', created_at: '', price: 300, group_url: 'https://chat.whatsapp.com/ChdQklSOkhHEdP8aAlBskk', padel_level: 'Intermediate',  court_name: 'Court 3',      duration_hours: 2   },
  { id: 'padel-3', title: 'Beginners Welcome',      description: 'Chill intro match with coaching tips. No judgment, just good vibes and padel.',            location: 'Palm Hills Club, 6th October', date: '2026-04-04T10:00:00', capacity: 8,  rsvp_count: 3,  image_url: PADEL_IMAGES[2], created_by: '', created_at: '', price: 200, group_url: 'https://chat.whatsapp.com/ChdQklSOkhHEdP8aAlBskk', padel_level: 'Beginner',      court_name: 'Court 1',      duration_hours: 1.5 },
  { id: 'padel-4', title: 'Advanced Tournament',    description: 'Full competitive format — points, rankings, trophies. Bring your A-game.',                 location: 'El-Gezira Sporting Club',      date: '2026-04-05T08:00:00', capacity: 16, rsvp_count: 14, image_url: PADEL_IMAGES[3], created_by: '', created_at: '', price: 450, group_url: 'https://chat.whatsapp.com/ChdQklSOkhHEdP8aAlBskk', padel_level: 'Advanced',      court_name: 'Courts 1–4',   duration_hours: 4   },
  { id: 'padel-5', title: 'Evening Padel',          description: 'After-work stress relief. Casual mixed match with drinks and good company after.',         location: 'Wadi Degla Club, Maadi',       date: '2026-04-08T19:00:00', capacity: 8,  rsvp_count: 4,  image_url: PADEL_IMAGES[4], created_by: '', created_at: '', price: 280, group_url: 'https://chat.whatsapp.com/ChdQklSOkhHEdP8aAlBskk', padel_level: 'Intermediate',  court_name: 'Court 2',      duration_hours: 2   },
  { id: 'padel-6', title: 'Monthly Showdown',       description: 'Flagship monthly tournament. All levels, full bracket, live scoring. The tribe in full force.', location: 'The Park Club, New Cairo',  date: '2026-04-12T09:00:00', capacity: 32, rsvp_count: 18, image_url: PADEL_IMAGES[5], created_by: '', created_at: '', price: 500, group_url: 'https://chat.whatsapp.com/ChdQklSOkhHEdP8aAlBskk', padel_level: 'All Levels',    court_name: 'All Courts',   duration_hours: 6   },
];

const LEVELS    = ['All', 'Beginner', 'Intermediate', 'Advanced', 'All Levels'];
const LOCATIONS = ['All', 'New Cairo', 'Maadi', '6th October', 'Zamalek'];

function EventCard({ event, index }: { event: Event & { rsvp_count: number }; index: number }) {
  const spotsLeft = event.capacity - (event.rsvp_count ?? 0);
  const isFull   = spotsLeft <= 0;
  const fillPct  = Math.min(((event.rsvp_count ?? 0) / event.capacity) * 100, 100);
  const img      = event.image_url || PADEL_IMAGES[index % PADEL_IMAGES.length];
  const lvl      = event.padel_level ?? 'All Levels';
  const urgency  = !isFull && spotsLeft <= 3;

  return (
    <div className="group rounded-2xl overflow-hidden border border-white/6 hover:border-red-600/35 hover:-translate-y-1 transition-all duration-300 shadow-lg hover:shadow-red-900/20 flex flex-col" style={{ background: 'var(--bg-card)' }}>
      {/* Image */}
      <div className="relative aspect-[16/9] overflow-hidden">
        <Link href={`/join/${event.id}`}>
          <img src={img} alt={event.title} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500" />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, var(--bg-card) 0%, rgba(0,0,0,0.15) 50%, transparent 100%)' }} />
        </Link>

        {/* Level badge — neutral */}
        <div className="absolute top-3 left-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold border border-white/15 bg-black/50 backdrop-blur-sm text-gray-200">
            <span className="w-1.5 h-1.5 rounded-full bg-white/60" />
            {lvl}
          </span>
        </div>

        {/* Price */}
        <div className="absolute top-3 right-3">
          {!event.price || event.price === 0
            ? <span className="px-2.5 py-1 bg-red-600 text-white text-xs font-bold rounded-lg">Free</span>
            : <span className="px-2.5 py-1 bg-black/60 backdrop-blur-sm text-white text-xs font-bold rounded-lg border border-white/15">EGP {event.price}</span>
          }
        </div>

        {/* Urgency */}
        {urgency && (
          <div className="absolute bottom-3 left-3">
            <span className="px-2.5 py-1 bg-red-600 text-white text-xs font-bold rounded-lg animate-pulse">
              🔥 {spotsLeft} spot{spotsLeft !== 1 ? 's' : ''} left
            </span>
          </div>
        )}
        {isFull && (
          <div className="absolute bottom-3 left-3">
            <span className="px-2.5 py-1 bg-black/70 text-gray-400 text-xs font-bold rounded-lg border border-white/10">Full</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        <Link href={`/join/${event.id}`}>
          <h3 className="font-bold text-white text-base mb-1.5 hover:text-red-400 transition-colors line-clamp-1">{event.title}</h3>
        </Link>
        <p className="text-gray-400 text-sm line-clamp-2 mb-4 leading-relaxed flex-1">{event.description}</p>

        <div className="space-y-1.5 mb-4">
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <Calendar className="w-3.5 h-3.5 text-gray-500 shrink-0" />
            {formatDate(event.date)} · {formatTime(event.date)}
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <MapPin className="w-3.5 h-3.5 text-gray-500 shrink-0" />
            <span className="truncate">{event.location}</span>
          </div>
          {event.duration_hours && (
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <Clock className="w-3.5 h-3.5 text-gray-500 shrink-0" />
              {event.duration_hours}h · {event.court_name}
            </div>
          )}
        </div>

        {/* Capacity */}
        <div className="mb-4">
          <div className="flex justify-between text-xs text-gray-600 mb-1.5">
            <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {event.rsvp_count}/{event.capacity} players</span>
            <span className={fillPct > 80 ? 'text-red-400 font-bold' : ''}>{Math.round(fillPct)}% full</span>
          </div>
          <div className="h-1 bg-white/8 rounded-full overflow-hidden">
            <div className={`h-full rounded-full transition-all ${isFull ? 'bg-gray-600' : fillPct > 80 ? 'bg-red-500' : 'bg-white/35'}`} style={{ width: `${fillPct}%` }} />
          </div>
        </div>

        {isFull ? (
          <button disabled className="w-full py-3 rounded-xl bg-white/5 text-gray-500 text-sm font-bold cursor-not-allowed border border-white/6">Full — Waitlist</button>
        ) : (
          <Link href={`/join/${event.id}`} className="block w-full">
            <button className="group/btn w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white text-sm font-bold transition-all duration-200 active:scale-95 shadow-lg shadow-red-900/25">
              Join Match
              <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-0.5 transition-transform" />
            </button>
          </Link>
        )}
      </div>
    </div>
  );
}

export default function EventsGrid({ events }: EventsGridProps) {
  const all = events.length > 0 ? events : DEMO_EVENTS;
  const [levelFilter,    setLevelFilter]    = useState('All');
  const [locationFilter, setLocationFilter] = useState('All');

  const filtered = all.filter(e => {
    const levelMatch = levelFilter === 'All' || e.padel_level === levelFilter;
    const locMatch   = locationFilter === 'All' || e.location.toLowerCase().includes(locationFilter.toLowerCase());
    return levelMatch && locMatch;
  });

  return (
    <section id="matches" className="py-20 px-4" style={{ background: 'var(--bg-base)' }}>
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <p className="text-red-500 text-xs font-bold uppercase tracking-widest mb-2">Available Now</p>
            <h2 className="text-3xl font-black text-white">Upcoming Matches</h2>
          </div>
          <Link href="/events" className="text-sm font-semibold text-gray-500 hover:text-white underline underline-offset-4 transition-colors hidden sm:block">
            View all →
          </Link>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-8">
          {[
            { value: levelFilter,    onChange: setLevelFilter,    options: LEVELS,    allLabel: 'All Levels'    },
            { value: locationFilter, onChange: setLocationFilter, options: LOCATIONS, allLabel: 'All Locations' },
          ].map(({ value, onChange, options, allLabel }) => (
            <div key={allLabel} className="relative">
              <select value={value} onChange={e => onChange(e.target.value)}
                className="appearance-none pl-4 pr-9 py-2.5 border border-white/10 hover:border-red-500/30 text-sm text-white rounded-xl cursor-pointer outline-none transition-colors font-medium"
                style={{ background: 'var(--bg-raised)' }}>
                {options.map(o => <option key={o} value={o} className="bg-gray-900">{o === 'All' ? allLabel : o}</option>)}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
            </div>
          ))}

          {(levelFilter !== 'All' || locationFilter !== 'All') && (
            <button onClick={() => { setLevelFilter('All'); setLocationFilter('All'); }}
              className="px-4 py-2.5 text-sm text-gray-400 hover:text-white border border-white/10 hover:border-white/20 rounded-xl transition-colors">
              Clear filters
            </button>
          )}

          <span className="ml-auto text-sm text-gray-500 self-center">
            {filtered.length} match{filtered.length !== 1 ? 'es' : ''}
          </span>
        </div>

        {/* Grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-4xl mb-4">🎾</div>
            <p className="text-gray-500 font-medium">No matches found for that filter.</p>
            <button onClick={() => { setLevelFilter('All'); setLocationFilter('All'); }} className="mt-4 text-red-500 hover:text-red-400 text-sm font-bold underline">Clear filters</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((event, i) => <EventCard key={event.id} event={event} index={i} />)}
          </div>
        )}

        <div className="text-center mt-10 sm:hidden">
          <Link href="/events">
            <button className="px-6 py-3 border border-white/15 text-white font-semibold rounded-xl hover:border-red-500/40 hover:bg-red-600/8 transition-all text-sm">
              See all matches →
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
}
