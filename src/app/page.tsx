import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { EventCard } from '@/components/events/event-card';
import { ArrowRight, Users, Calendar, MapPin, Star, Heart, Gamepad2, Zap } from 'lucide-react';

export default async function HomePage() {
  const supabase = createClient();
  const { data: events } = await supabase
    .from('events')
    .select('*, rsvp_count:rsvps(count)')
    .gte('date', new Date().toISOString())
    .order('date', { ascending: true })
    .limit(3);

  const upcomingEvents = (events || []).map(e => ({
    ...e,
    rsvp_count: e.rsvp_count?.[0]?.count ?? 0,
  }));

  const stats = [
    { value: '1,000+', label: 'Adventures', icon: MapPin },
    { value: '500+', label: 'Community Events', icon: Users },
    { value: '300+', label: 'Gamified Adventures', icon: Gamepad2 },
    { value: '10+', label: 'Team Builds', icon: Heart },
  ];

  const testimonials = [
    {
      name: 'Ahmed Karim',
      location: 'Cairo',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80&auto=format&fit=crop&crop=face',
      quote: "I came for the adventure, stayed for the people. Haka literally changed how I see Cairo — no cap.",
      rating: 5,
    },
    {
      name: 'Sara Hassan',
      location: 'Alexandria',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&q=80&auto=format&fit=crop&crop=face',
      quote: 'The gamified adventures hit different. Every event feels like a main character moment fr.',
      rating: 5,
    },
    {
      name: 'Omar Farouk',
      location: 'Giza',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&q=80&auto=format&fit=crop&crop=face',
      quote: 'White Desert, Nile trips, rooftop meetups — Haka keeps dropping new experiences and I keep showing up.',
      rating: 5,
    },
  ];

  const howItWorks = [
    {
      step: '1',
      icon: Users,
      title: 'Create Your Profile',
      desc: 'Sign up in 30 seconds. Tell us your vibe — adventure, social, or both.',
    },
    {
      step: '2',
      icon: Gamepad2,
      title: 'Pick Your Adventure',
      desc: 'Browse gamified experiences, community drops, and epic events near you.',
    },
    {
      step: '3',
      icon: Zap,
      title: 'Show Up & Level Up',
      desc: 'RSVP, arrive, make memories. You never return the same person.',
    },
  ];

  const placeholderEvents = [
    {
      title: 'Sunset Rooftop Meetup',
      location: 'Cairo, Zamalek',
      date: 'Fri, Apr 4 · 7:00 PM',
      img: 'https://images.unsplash.com/photo-1527525443983-6e60c75fff46?w=600&q=80&auto=format&fit=crop',
      spots: '12 spots left',
      category: 'Social',
    },
    {
      title: 'White Desert Adventure',
      location: 'Farafra, Egypt',
      date: 'Sat, Apr 12 · 6:00 AM',
      img: 'https://images.unsplash.com/photo-1539768942893-daf53e448371?w=600&q=80&auto=format&fit=crop',
      spots: '5 spots left',
      category: 'Adventure',
    },
    {
      title: 'Gamified City Hunt',
      location: 'Cairo, Downtown',
      date: 'Thu, Apr 17 · 4:00 PM',
      img: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=600&q=80&auto=format&fit=crop',
      spots: 'Open',
      category: 'Gamified',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />

      {/* ── HERO ─────────────────────────────────────────── */}
      <section className="relative min-h-[92vh] flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=1920&q=80&auto=format&fit=crop"
            alt="Haka adventure community"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-black/20" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-orange-500/20 border border-orange-500/50 backdrop-blur-sm text-orange-300 px-4 py-2 rounded-full text-sm font-semibold mb-8 tracking-wide">
              <span className="w-2 h-2 bg-orange-400 rounded-full animate-pulse" />
              Adventures with a Twist 🔥
            </div>

            <h1 className="text-5xl md:text-7xl font-black text-white leading-[1.05] mb-6 tracking-tight">
              Never Return
              <br />
              <span className="text-orange-400">The Same Person.</span>
            </h1>

            <p className="text-lg md:text-xl text-gray-300 mb-10 max-w-xl leading-relaxed">
              Gamified adventures. Tight community. Zero boring moments.
              <br className="hidden sm:block" />
              This is Haka — Egypt&apos;s most unfiltered experience platform.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/events">
                <button className="group flex items-center gap-2.5 px-8 py-4 bg-orange-500 hover:bg-orange-400 text-white font-black text-base rounded-2xl transition-all duration-200 shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 hover:scale-[1.02] active:scale-[0.98] uppercase tracking-wide">
                  Find My Adventure
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </Link>
              <Link href="/register">
                <button className="flex items-center gap-2.5 px-8 py-4 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/30 text-white font-bold text-base rounded-2xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]">
                  Join the Crew 🤙
                </button>
              </Link>
            </div>

            <div className="flex items-center gap-3 mt-10">
              <div className="flex -space-x-2">
                {[
                  'photo-1507003211169-0a1dd7228f2d',
                  'photo-1494790108755-2616b612b786',
                  'photo-1472099645785-5658abf4ff4e',
                  'photo-1500648767791-00dcc994a43e',
                ].map((id, i) => (
                  <img
                    key={i}
                    src={`https://images.unsplash.com/${id}?w=64&q=80&auto=format&fit=crop&crop=face`}
                    alt=""
                    className="w-9 h-9 rounded-full border-2 border-black/40 object-cover"
                  />
                ))}
              </div>
              <p className="text-sm text-gray-300">
                <span className="text-white font-black">1,000+</span> adventurers already in
              </p>
            </div>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
          <div className="w-px h-10 bg-gradient-to-b from-white/40 to-transparent animate-pulse mx-auto" />
        </div>
      </section>

      {/* ── STATS ────────────────────────────────────────── */}
      <section className="bg-gray-950 py-12 px-4">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map(({ value, label, icon: Icon }) => (
            <div key={label} className="text-center group">
              <div className="flex justify-center mb-3">
                <div className="w-11 h-11 bg-orange-500/10 rounded-xl flex items-center justify-center group-hover:bg-orange-500/20 transition-colors">
                  <Icon className="w-5 h-5 text-orange-400" />
                </div>
              </div>
              <div className="text-3xl font-black text-white mb-0.5">{value}</div>
              <div className="text-xs text-gray-500 font-semibold uppercase tracking-widest">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURED EVENTS ──────────────────────────────── */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-10">
            <div>
              <span className="text-orange-500 text-sm font-black uppercase tracking-widest">What&apos;s Dropping</span>
              <h2 className="text-4xl font-black text-gray-900 mt-1">Upcoming Adventures</h2>
            </div>
            <Link
              href="/events"
              className="hidden sm:flex items-center gap-1.5 text-sm font-bold text-gray-500 hover:text-orange-500 transition-colors group"
            >
              See all drops
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          {upcomingEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcomingEvents.map(event => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {placeholderEvents.map((e, i) => (
                <div
                  key={i}
                  className="group bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                >
                  <div className="relative h-52 overflow-hidden">
                    <img
                      src={e.img}
                      alt={e.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3">
                      <span className="px-2.5 py-1 bg-black/60 backdrop-blur-sm text-white text-xs font-bold rounded-full uppercase tracking-wide">
                        {e.category}
                      </span>
                    </div>
                    <div className="absolute top-3 right-3">
                      <span className="px-2.5 py-1 bg-orange-500 text-white text-xs font-bold rounded-full">
                        {e.spots}
                      </span>
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="font-black text-gray-900 text-lg mb-2 group-hover:text-orange-500 transition-colors">
                      {e.title}
                    </h3>
                    <div className="flex items-center gap-1.5 text-sm text-gray-500 mb-1.5">
                      <Calendar className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                      {e.date}
                    </div>
                    <div className="flex items-center gap-1.5 text-sm text-gray-500 mb-5">
                      <MapPin className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                      {e.location}
                    </div>
                    <div className="flex items-center justify-between px-4 py-2.5 bg-orange-500 group-hover:bg-orange-600 rounded-xl text-white text-sm font-black uppercase tracking-wide transition-colors">
                      <span>I&apos;m In</span>
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="text-center mt-8 sm:hidden">
            <Link href="/events">
              <button className="inline-flex items-center gap-2 px-6 py-3 border-2 border-gray-200 hover:border-orange-500 hover:text-orange-500 text-gray-700 font-bold rounded-xl transition-colors text-sm uppercase tracking-wide">
                See all drops <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── COMMUNITY GRID ───────────────────────────────── */}
      <section className="py-20 px-4 bg-gray-950">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-orange-500 text-sm font-black uppercase tracking-widest">The Haka Community</span>
            <h2 className="text-4xl md:text-5xl font-black text-white mt-2 leading-tight">
              Real people.
              <br />
              <span className="text-orange-400">Real vibes.</span>
            </h2>
            <p className="text-gray-400 mt-4 max-w-md mx-auto leading-relaxed">
              No filters. No corporate nonsense. Just thousands of young Egyptians living their best lives through Haka.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-w-4xl mx-auto">
            <div className="row-span-2 rounded-2xl overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=600&q=80&auto=format&fit=crop"
                alt="Haka festival"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
              />
            </div>
            <div className="rounded-2xl overflow-hidden aspect-square">
              <img
                src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=600&q=80&auto=format&fit=crop"
                alt="Community"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
              />
            </div>
            <div className="rounded-2xl overflow-hidden aspect-square">
              <img
                src="https://images.unsplash.com/photo-1528605248644-14dd04022da1?w=600&q=80&auto=format&fit=crop"
                alt="Group vibes"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
              />
            </div>
            <div className="rounded-2xl overflow-hidden aspect-square">
              <img
                src="https://images.unsplash.com/photo-1539768942893-daf53e448371?w=600&q=80&auto=format&fit=crop"
                alt="Egypt adventure"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
              />
            </div>
            <div className="rounded-2xl overflow-hidden aspect-square relative group cursor-pointer">
              <img
                src="https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&q=80&auto=format&fit=crop"
                alt="Nightlife"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl">
                <div className="text-white text-center">
                  <p className="font-black text-xl">+500</p>
                  <p className="text-sm text-gray-300">more moments</p>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center mt-10">
            <a
              href="https://www.instagram.com/hakaegypt/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 text-white font-bold rounded-full text-sm hover:opacity-90 transition-opacity shadow-lg"
            >
              Follow @hakaegypt
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────── */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <span className="text-orange-500 text-sm font-black uppercase tracking-widest">So Easy It&apos;s Unreal</span>
            <h2 className="text-4xl font-black text-gray-900 mt-2">How It Works</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {howItWorks.map(({ step, icon: Icon, title, desc }) => (
              <div key={step} className="text-center group">
                <div className="relative inline-flex mb-5">
                  <div className="w-16 h-16 bg-orange-500 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-200 group-hover:scale-110 group-hover:bg-orange-600 transition-all duration-300">
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <span className="absolute -top-2 -right-2 w-6 h-6 bg-gray-900 text-white text-xs font-black rounded-full flex items-center justify-center">
                    {step}
                  </span>
                </div>
                <h3 className="text-lg font-black text-gray-900 mb-2">{title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ─────────────────────────────────── */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-orange-500 text-sm font-black uppercase tracking-widest">From the Crew</span>
            <h2 className="text-4xl font-black text-gray-900 mt-2">What They&apos;re Saying</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300"
              >
                <div className="flex gap-0.5 mb-4">
                  {[...Array(t.rating)].map((_, s) => (
                    <Star key={s} className="w-4 h-4 fill-orange-400 text-orange-400" />
                  ))}
                </div>
                <p className="text-gray-700 text-sm leading-relaxed mb-5 italic">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <img
                    src={t.avatar}
                    alt={t.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <div className="font-black text-gray-900 text-sm">{t.name}</div>
                    <div className="text-xs text-gray-400 flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {t.location}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── JOIN CTA ──────────────────────────────────────── */}
      <section className="py-24 px-4 bg-orange-500 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-80 h-80 bg-orange-400 rounded-full -translate-y-1/2 translate-x-1/2 opacity-50" />
          <div className="absolute bottom-0 left-0 w-56 h-56 bg-orange-600 rounded-full translate-y-1/2 -translate-x-1/2 opacity-50" />
        </div>

        <div className="relative max-w-2xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/20 text-white px-4 py-2 rounded-full text-sm font-bold mb-6 tracking-wide">
            🤙 Only Positive Vibes Allowed
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-white mb-4 leading-tight">
            Your Adventure
            <br />
            Awaits.
          </h2>
          <p className="text-orange-100 text-lg mb-10 leading-relaxed max-w-lg mx-auto">
            Real adventures. Real community. Zero cringe.
            Join thousands already living the Haka life — you never return the same person.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <button className="px-8 py-4 bg-white text-orange-600 font-black text-base rounded-2xl hover:bg-orange-50 transition-all duration-200 shadow-xl hover:scale-[1.02] active:scale-[0.98] uppercase tracking-wide">
                Book My Adventure
              </button>
            </Link>
            <Link href="/events">
              <button className="px-8 py-4 bg-transparent border-2 border-white/50 hover:border-white hover:bg-white/10 text-white font-bold text-base rounded-2xl transition-all duration-200">
                Browse Events
              </button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
