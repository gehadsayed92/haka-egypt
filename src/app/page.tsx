import { createClient } from '@/lib/supabase/server';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import Hero from '@/components/home/Hero';
import EventsGrid from '@/components/home/EventsGrid';
import HowItWorks from '@/components/home/HowItWorks';
import PlayerLevels from '@/components/home/PlayerLevels';
import Stats from '@/components/home/Stats';
import Testimonials from '@/components/home/Testimonials';
import CTA from '@/components/home/CTA';

export default async function HomePage() {
  const supabase = createClient();
  const { data: events } = await supabase
    .from('events')
    .select('*, rsvp_count:rsvps(count)')
    .gte('date', new Date().toISOString())
    .order('date', { ascending: true })
    .limit(6);

  const upcomingEvents = (events || []).map(e => ({
    ...e,
    rsvp_count: e.rsvp_count?.[0]?.count ?? 0,
  }));

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg-base)' }}>
      <Navbar />
      <Hero />
      <EventsGrid events={upcomingEvents} />
      <HowItWorks />
      <PlayerLevels />
      <Stats />
      <Testimonials />
      <CTA />
      <Footer />
    </div>
  );
}
