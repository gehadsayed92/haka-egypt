'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import toast from 'react-hot-toast';
import type { Event } from '@/types';

interface EventFormProps {
  event?: Event;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function EventForm({ event, onSuccess, onCancel }: EventFormProps) {
  const { user } = useAuth();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: event?.title || '',
    description: event?.description || '',
    date: event?.date ? new Date(event.date).toISOString().slice(0, 16) : '',
    location: event?.location || '',
    capacity: event?.capacity || 50,
    image_url: event?.image_url || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);

    try {
      const payload = {
        ...form,
        date: new Date(form.date).toISOString(),
        capacity: Number(form.capacity),
        created_by: user.id,
      };

      if (event?.id) {
        const { error } = await supabase
          .from('events')
          .update(payload)
          .eq('id', event.id);
        if (error) throw error;
        toast.success('Event updated!');
      } else {
        const { error } = await supabase
          .from('events')
          .insert(payload);
        if (error) throw error;
        toast.success('Event created!');
      }

      onSuccess?.();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Something went wrong';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Event Title"
        value={form.title}
        onChange={e => setForm({ ...form, title: e.target.value })}
        required
        placeholder="Haka Monthly Meetup"
      />
      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-700">Description</label>
        <textarea
          value={form.description}
          onChange={e => setForm({ ...form, description: e.target.value })}
          required
          rows={3}
          placeholder="Tell people what to expect..."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
        />
      </div>
      <Input
        label="Date & Time"
        type="datetime-local"
        value={form.date}
        onChange={e => setForm({ ...form, date: e.target.value })}
        required
      />
      <Input
        label="Location"
        value={form.location}
        onChange={e => setForm({ ...form, location: e.target.value })}
        required
        placeholder="Cairo, Maadi Community Center"
      />
      <Input
        label="Capacity"
        type="number"
        min={1}
        value={form.capacity}
        onChange={e => setForm({ ...form, capacity: Number(e.target.value) })}
        required
      />
      <Input
        label="Image URL (optional)"
        value={form.image_url}
        onChange={e => setForm({ ...form, image_url: e.target.value })}
        placeholder="https://..."
      />
      <div className="flex gap-3 pt-2">
        {onCancel && (
          <Button type="button" variant="secondary" className="flex-1" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" className="flex-1" loading={loading}>
          {event?.id ? 'Update Event' : 'Create Event'}
        </Button>
      </div>
    </form>
  );
}
