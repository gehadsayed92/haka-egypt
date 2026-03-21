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
  // Payment & community group fields
  price?: number | null;
  payment_url?: string | null;
  group_url?: string | null;
  // Padel-specific fields
  padel_level?: PadelLevel | null;
  court_name?: string | null;
  duration_hours?: number | null;
  whatsapp_group_id?: string | null;
}

export interface RSVP {
  id: string;
  event_id: string;
  user_id: string;
  status: RSVPStatus;
  created_at: string;
}

export type RSVPStatus = 'attending' | 'waitlist' | 'cancelled';

export type PadelLevel = 'Beginner' | 'Intermediate' | 'Advanced' | 'All Levels';

export interface PadelRegistration {
  // Step 1 — Basic Info
  name: string;
  phone: string; // WhatsApp number (Egyptian format)
  email?: string;
  // Step 2 — Level Assessment
  experience: 'new' | 'casual' | 'regular' | 'advanced';
  canRally: 'no' | 'sometimes' | 'yes';
  playType: 'practice' | 'friendly' | 'competitive';
  selfRating: 1 | 2 | 3 | 4 | 5;
  // Computed
  level: PadelLevel;
  event_id: string;
}

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
