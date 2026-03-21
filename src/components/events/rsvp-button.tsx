'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import type { RSVPStatus } from '@/types';
import { CheckCircle, Clock, X } from 'lucide-react';

interface RSVPButtonProps {
  eventId: string;
  capacity: number;
  rsvpCount: number;
  userRsvp?: RSVPStatus | null;
  onUpdate?: () => void;
}

export function RSVPButton({ eventId, capacity, rsvpCount, userRsvp, onUpdate }: RSVPButtonProps) {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const router = useRouter();
  const supabase = createClient();
  const isFull = rsvpCount >= capacity;

  const handleRSVP = async () => {
    if (!user) {
      router.push('/login');
      return;
    }

    setLoading(true);
    try {
      if (userRsvp === 'attending' || userRsvp === 'waitlist') {
        // Cancel RSVP
        const { error } = await supabase
          .from('rsvps')
          .delete()
          .eq('event_id', eventId)
          .eq('user_id', user.id);

        if (error) throw error;
        toast.success('RSVP cancelled');
      } else {
        // Add RSVP
        const status: RSVPStatus = isFull ? 'waitlist' : 'attending';
        const { error } = await supabase
          .from('rsvps')
          .upsert({
            event_id: eventId,
            user_id: user.id,
            status,
          });

        if (error) throw error;
        toast.success(isFull ? 'Added to waitlist!' : "You're attending!");
      }
      onUpdate?.();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Something went wrong';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  if (userRsvp === 'attending') {
    return (
      <div className="flex gap-2">
        <div className="flex-1 flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-4 py-2">
          <CheckCircle className="w-4 h-4 text-green-600" />
          <span className="text-green-700 font-medium text-sm">You&apos;re attending!</span>
        </div>
        <Button variant="outline" size="sm" onClick={handleRSVP} loading={loading}>
          <X className="w-4 h-4" />
        </Button>
      </div>
    );
  }

  if (userRsvp === 'waitlist') {
    return (
      <div className="flex gap-2">
        <div className="flex-1 flex items-center gap-2 bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-2">
          <Clock className="w-4 h-4 text-yellow-600" />
          <span className="text-yellow-700 font-medium text-sm">On waitlist</span>
        </div>
        <Button variant="outline" size="sm" onClick={handleRSVP} loading={loading}>
          <X className="w-4 h-4" />
        </Button>
      </div>
    );
  }

  return (
    <Button
      className="w-full"
      variant={isFull ? 'secondary' : 'primary'}
      size="lg"
      onClick={handleRSVP}
      loading={loading}
    >
      {isFull ? 'Join Waitlist' : "RSVP \u2013 I'm Attending"}
    </Button>
  );
}
