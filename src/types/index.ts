export interface User {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  interests: string[];
  is_admin: boolean;
  created_at: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  capacity: number;
  image_url?: string;
  created_by: string;
  created_at: string;
  rsvp_count?: number;
  user_rsvp?: RSVPStatus | null;
}

export interface RSVP {
  id: string;
  event_id: string;
  user_id: string;
  status: RSVPStatus;
  created_at: string;
}

export type RSVPStatus = 'attending' | 'waitlist' | 'cancelled';

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  interests: string[];
  is_admin: boolean;
  created_at: string;
  updated_at: string;
}
