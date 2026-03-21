import { createClient } from '@/lib/supabase/server';
import { EventCard } from '@/components/events/event-card';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { Calendar } from 'lucide-react';

export default async function EventsPage() {
  const supabase = createClient();
  const { data: events } = await supabase
    .from('events')
    .select('*, rsvp_count:rsvps(count)')
    .order('date', { ascending: true });

  const allEvents = (events || []).map(e => ({
    ...e,
    rsvp_count: e.rsvp_count?.[0]?.count ?? 0,
  }));

  const upcoming = allEvents.filter(e => new Date(e.date) >= new Date());
  const past = allEvents.filter(e => new Date(e.date) < new Date());

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="mb-10">
            <h1 className="text-3xl font-bold text-gray-900">All Events</h1>
            <p className="text-gray-500 mt-2">Discover and join upcoming community events</p>
          </div>

          {upcoming.length > 0 && (
            <section className="mb-12">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Upcoming</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {upcoming.map(event => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            </section>
          )}

          {past.length > 0 && (
            <section>
              <h2 className="text-xl font-semibold text-gray-400 mb-6">Past Events</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 opacity-60">
                {past.map(event => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            </section>
          )}

          {allEvents.length === 0 && (
            <div className="text-center py-24 text-gray-400">
              <Calendar className="w-16 h-16 mx-auto mb-4 opacity-40" />
              <p className="text-lg">No events scheduled yet.</p>
              <p className="text-sm mt-1">Check back soon!</p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
