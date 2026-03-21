'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Event } from '@/types';

export function useEvents() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('events')
      .select(`
        *,
        rsvp_count:rsvps(count)
      `)
      .order('date', { ascending: true });

    if (data) {
      const formatted = data.map(e => ({
        ...e,
        rsvp_count: e.rsvp_count?.[0]?.count ?? 0,
      }));
      setEvents(formatted);
    }
    setLoading(false);
  };

  return { events, loading, refetch: fetchEvents };
}
