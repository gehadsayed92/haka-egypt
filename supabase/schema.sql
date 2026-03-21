-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table (extends Supabase auth.users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL DEFAULT '',
  avatar_url TEXT,
  interests TEXT[] DEFAULT '{}',
  is_admin BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Events table
CREATE TABLE public.events (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  date TIMESTAMPTZ NOT NULL,
  location TEXT NOT NULL,
  capacity INTEGER NOT NULL DEFAULT 50,
  image_url TEXT,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RSVPs table
CREATE TABLE public.rsvps (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  status TEXT CHECK (status IN ('attending', 'waitlist', 'cancelled')) NOT NULL DEFAULT 'attending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(event_id, user_id)
);

-- Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rsvps ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Events policies
CREATE POLICY "Events are viewable by everyone" ON public.events FOR SELECT USING (true);
CREATE POLICY "Admins can insert events" ON public.events FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
);
CREATE POLICY "Admins can update events" ON public.events FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
);
CREATE POLICY "Admins can delete events" ON public.events FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
);

-- RSVPs policies
CREATE POLICY "RSVPs are viewable by everyone" ON public.rsvps FOR SELECT USING (true);
CREATE POLICY "Users can manage own RSVPs" ON public.rsvps FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own RSVPs" ON public.rsvps FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own RSVPs" ON public.rsvps FOR DELETE USING (auth.uid() = user_id);

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to get event with RSVP count
CREATE OR REPLACE FUNCTION get_events_with_counts()
RETURNS TABLE (
  id UUID,
  title TEXT,
  description TEXT,
  date TIMESTAMPTZ,
  location TEXT,
  capacity INTEGER,
  image_url TEXT,
  created_by UUID,
  created_at TIMESTAMPTZ,
  rsvp_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    e.id, e.title, e.description, e.date, e.location,
    e.capacity, e.image_url, e.created_by, e.created_at,
    COUNT(r.id) FILTER (WHERE r.status = 'attending') as rsvp_count
  FROM public.events e
  LEFT JOIN public.rsvps r ON e.id = r.event_id
  GROUP BY e.id
  ORDER BY e.date ASC;
END;
$$ LANGUAGE plpgsql;
