import { createClient } from '@/lib/supabase/server';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { Badge } from '@/components/ui/badge';
import { RSVPButton } from '@/components/events/rsvp-button';
import { formatDate, formatTime } from '@/lib/utils';
import { Calendar, MapPin, Users, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export default async function EventDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient();

  const { data: event } = await supabase
    .from('events')
    .select('*')
    .eq('id', params.id)
    .single();

  if (!event) notFound();

  const { count: rsvpCount } = await supabase
    .from('rsvps')
    .select('*', { count: 'exact', head: true })
    .eq('event_id', event.id)
    .eq('status', 'attending');

  const { data: { user } } = await supabase.auth.getUser();
  let userRsvp = null;
  if (user) {
    const { data } = await supabase
      .from('rsvps')
      .select('status')
      .eq('event_id', event.id)
      .eq('user_id', user.id)
      .single();
    userRsvp = data?.status ?? null;
  }

  const attendeeCount = rsvpCount ?? 0;
  const spotsLeft = event.capacity - attendeeCount;
  const isFull = spotsLeft <= 0;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 py-8 px-4">
        <div className="max-w-3xl mx-auto">
          <Link href="/events" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 mb-6">
            <ArrowLeft className="w-4 h-4" /> Back to Events
          </Link>

          {event.image_url && (
            <div className="h-64 md:h-80 rounded-2xl overflow-hidden mb-8">
              <img src={event.image_url} alt={event.title} className="w-full h-full object-cover" />
            </div>
          )}

          <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
            <h1 className="text-3xl font-bold text-gray-900">{event.title}</h1>
            <div className="flex gap-2">
              {isFull ? (
                <Badge variant="warning">Full &ndash; Waitlist Open</Badge>
              ) : spotsLeft <= 5 ? (
                <Badge variant="danger">{spotsLeft} spots left!</Badge>
              ) : (
                <Badge variant="success">Open</Badge>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="flex items-center gap-3 bg-orange-50 rounded-xl p-4">
              <Calendar className="w-5 h-5 text-orange-500 shrink-0" />
              <div>
                <p className="text-xs text-gray-500">Date</p>
                <p className="font-medium text-sm">{formatDate(event.date)}</p>
                <p className="text-xs text-gray-600">{formatTime(event.date)}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-orange-50 rounded-xl p-4">
              <MapPin className="w-5 h-5 text-orange-500 shrink-0" />
              <div>
                <p className="text-xs text-gray-500">Location</p>
                <p className="font-medium text-sm">{event.location}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-orange-50 rounded-xl p-4">
              <Users className="w-5 h-5 text-orange-500 shrink-0" />
              <div>
                <p className="text-xs text-gray-500">Attendance</p>
                <p className="font-medium text-sm">{attendeeCount} / {event.capacity}</p>
              </div>
            </div>
          </div>

          <div className="prose max-w-none mb-8">
            <h2 className="text-lg font-semibold mb-3">About this event</h2>
            <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">{event.description}</p>
          </div>

          <div className="sticky bottom-4 bg-white rounded-2xl shadow-lg border p-4">
            <RSVPButton
              eventId={event.id}
              capacity={event.capacity}
              rsvpCount={attendeeCount}
              userRsvp={userRsvp}
            />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
