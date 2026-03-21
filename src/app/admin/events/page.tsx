'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { EventForm } from '@/components/events/event-form';
import { DataTable } from '@/components/admin/data-table';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import type { Event } from '@/types';

export default function AdminEventsPage() {
  const supabase = createClient();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | undefined>();

  useEffect(() => { fetchEvents(); }, []);

  const fetchEvents = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('events')
      .select('*, rsvp_count:rsvps(count)')
      .order('date', { ascending: false });
    const formatted = (data || []).map(e => ({
      ...e,
      rsvp_count: e.rsvp_count?.[0]?.count ?? 0,
    }));
    setEvents(formatted);
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this event?')) return;
    const { error } = await supabase.from('events').delete().eq('id', id);
    if (error) {
      toast.error('Failed to delete event');
    } else {
      toast.success('Event deleted');
      fetchEvents();
    }
  };

  const columns = [
    { key: 'title', header: 'Title' },
    {
      key: 'date',
      header: 'Date',
      render: (row: Event) => formatDate(row.date),
    },
    { key: 'location', header: 'Location' },
    {
      key: 'capacity',
      header: 'Capacity',
      render: (row: Event) => `${row.rsvp_count ?? 0} / ${row.capacity}`,
    },
    {
      key: 'status',
      header: 'Status',
      render: (row: Event) => {
        const isPast = new Date(row.date) < new Date();
        return (
          <Badge variant={isPast ? 'default' : 'success'}>
            {isPast ? 'Past' : 'Upcoming'}
          </Badge>
        );
      },
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (row: Event) => (
        <div className="flex gap-2">
          <button
            onClick={() => { setEditingEvent(row); setShowForm(true); }}
            className="p-1.5 rounded hover:bg-gray-100 text-gray-500"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDelete(row.id)}
            className="p-1.5 rounded hover:bg-red-50 text-red-500"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Events</h1>
          <p className="text-gray-500 mt-1">{events.length} total events</p>
        </div>
        <Button onClick={() => { setEditingEvent(undefined); setShowForm(true); }} className="gap-2">
          <Plus className="w-4 h-4" /> New Event
        </Button>
      </div>

      <div className="bg-white rounded-xl border overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-400">Loading...</div>
        ) : (
          <DataTable columns={columns} data={events} />
        )}
      </div>

      <Modal
        isOpen={showForm}
        onClose={() => { setShowForm(false); setEditingEvent(undefined); }}
        title={editingEvent ? 'Edit Event' : 'Create Event'}
      >
        <EventForm
          event={editingEvent}
          onSuccess={() => { setShowForm(false); setEditingEvent(undefined); fetchEvents(); }}
          onCancel={() => { setShowForm(false); setEditingEvent(undefined); }}
        />
      </Modal>
    </div>
  );
}
