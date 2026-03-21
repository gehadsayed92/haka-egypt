import { createClient } from '@/lib/supabase/server';
import { StatsCard } from '@/components/admin/stats-card';
import { Card, CardContent } from '@/components/ui/card';
import { formatDate } from '@/lib/utils';
import { Users, Calendar, CheckCircle, TrendingUp } from 'lucide-react';

export default async function AdminDashboard() {
  const supabase = createClient();

  const [
    { count: userCount },
    { count: eventCount },
    { count: rsvpCount },
    { data: recentEvents },
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('events').select('*', { count: 'exact', head: true }),
    supabase.from('rsvps').select('*', { count: 'exact', head: true }).eq('status', 'attending'),
    supabase.from('events').select('*').order('created_at', { ascending: false }).limit(5),
  ]);

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Haka Egypt community overview</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard title="Total Members" value={userCount ?? 0} icon={<Users className="w-6 h-6" />} />
        <StatsCard title="Total Events" value={eventCount ?? 0} icon={<Calendar className="w-6 h-6" />} />
        <StatsCard title="Total RSVPs" value={rsvpCount ?? 0} icon={<CheckCircle className="w-6 h-6" />} />
        <StatsCard
          title="Avg per Event"
          value={eventCount ? Math.round((rsvpCount ?? 0) / eventCount) : 0}
          icon={<TrendingUp className="w-6 h-6" />}
        />
      </div>

      <Card>
        <CardContent>
          <h2 className="font-semibold text-lg mb-4">Recent Events</h2>
          <div className="space-y-3">
            {(recentEvents || []).map(event => (
              <div key={event.id} className="flex items-center justify-between py-2 border-b last:border-0">
                <div>
                  <p className="font-medium text-sm">{event.title}</p>
                  <p className="text-xs text-gray-500">{formatDate(event.date)} &middot; {event.location}</p>
                </div>
                <span className="text-xs text-gray-400">Cap: {event.capacity}</span>
              </div>
            ))}
            {!recentEvents?.length && (
              <p className="text-gray-400 text-sm">No events yet.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
