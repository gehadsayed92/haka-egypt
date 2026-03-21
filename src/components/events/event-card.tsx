import Link from 'next/link';
import { formatDate } from '@/lib/utils';
import { Calendar, MapPin, Users, ArrowRight } from 'lucide-react';
import type { Event } from '@/types';

interface EventCardProps {
  event: Event;
}

export function EventCard({ event }: EventCardProps) {
  const isFull = (event.rsvp_count ?? 0) >= event.capacity;
  const spotsLeft = event.capacity - (event.rsvp_count ?? 0);
  const fillPercent = Math.min(((event.rsvp_count ?? 0) / event.capacity) * 100, 100);

  return (
    <Link href={`/events/${event.id}`} className="group block">
      <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
        {/* Image */}
        <div className="relative h-52 overflow-hidden bg-gray-100">
          {event.image_url ? (
            <img
              src={event.image_url}
              alt={event.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center">
              <Calendar className="w-12 h-12 text-white/40" />
            </div>
          )}

          <div className="absolute top-3 right-3">
            {isFull ? (
              <span className="px-2.5 py-1 bg-gray-900/80 backdrop-blur-sm text-white text-xs font-semibold rounded-full">
                Full
              </span>
            ) : spotsLeft <= 5 ? (
              <span className="px-2.5 py-1 bg-red-500/90 backdrop-blur-sm text-white text-xs font-semibold rounded-full">
                {spotsLeft} spots left!
              </span>
            ) : (
              <span className="px-2.5 py-1 bg-green-500/90 backdrop-blur-sm text-white text-xs font-semibold rounded-full">
                Open
              </span>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-5">
          <h3 className="font-bold text-gray-900 text-lg leading-tight mb-1 group-hover:text-orange-500 transition-colors line-clamp-1">
            {event.title}
          </h3>
          <p className="text-gray-500 text-sm mb-4 line-clamp-2 leading-relaxed">{event.description}</p>

          <div className="space-y-2 mb-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <div className="w-7 h-7 bg-orange-50 rounded-lg flex items-center justify-center shrink-0">
                <Calendar className="w-3.5 h-3.5 text-orange-500" />
              </div>
              <span>{formatDate(event.date)}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <div className="w-7 h-7 bg-orange-50 rounded-lg flex items-center justify-center shrink-0">
                <MapPin className="w-3.5 h-3.5 text-orange-500" />
              </div>
              <span className="truncate">{event.location}</span>
            </div>
          </div>

          {/* Capacity bar */}
          <div className="mb-4">
            <div className="flex items-center justify-between text-xs text-gray-500 mb-1.5">
              <span className="flex items-center gap-1">
                <Users className="w-3.5 h-3.5" />
                {event.rsvp_count ?? 0} / {event.capacity} attending
              </span>
              <span>{Math.round(fillPercent)}% full</span>
            </div>
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  isFull ? 'bg-gray-400' : fillPercent > 80 ? 'bg-red-400' : 'bg-orange-400'
                }`}
                style={{ width: `${fillPercent}%` }}
              />
            </div>
          </div>

          {/* CTA */}
          <div
            className={`flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              isFull
                ? 'bg-gray-100 text-gray-500'
                : 'bg-orange-500 text-white group-hover:bg-orange-600'
            }`}
          >
            <span>{isFull ? 'Join Waitlist' : 'View & RSVP'}</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>
      </div>
    </Link>
  );
}
