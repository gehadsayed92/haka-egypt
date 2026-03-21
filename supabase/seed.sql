-- Seed events (run after creating an admin user)
-- Replace 'YOUR_ADMIN_USER_ID' with actual admin user UUID

INSERT INTO public.events (title, description, date, location, capacity, created_by) VALUES
(
  'Haka Egypt Launch Meetup',
  'Join us for the official launch of Haka Egypt community! Connect with like-minded individuals, share ideas, and be part of something amazing. Light refreshments provided.',
  NOW() + INTERVAL '7 days',
  'Cairo, Maadi Community Center',
  100,
  (SELECT id FROM public.profiles WHERE is_admin = true LIMIT 1)
),
(
  'Tech Talks: AI & The Future',
  'An evening of inspiring talks about artificial intelligence, machine learning, and how technology is shaping our world. Speakers from leading Egyptian tech companies.',
  NOW() + INTERVAL '14 days',
  'Cairo, GrEEK Campus',
  60,
  (SELECT id FROM public.profiles WHERE is_admin = true LIMIT 1)
),
(
  'Outdoor Hiking Adventure',
  'A refreshing morning hike in the beautiful Wadi Degla Protectorate. All fitness levels welcome! Bring water and comfortable shoes.',
  NOW() + INTERVAL '21 days',
  'Wadi Degla Protectorate, Cairo',
  30,
  (SELECT id FROM public.profiles WHERE is_admin = true LIMIT 1)
),
(
  'Photography Workshop',
  'Learn the fundamentals of photography with professional photographer Ahmed Hassan. Topics: composition, lighting, and mobile photography tips.',
  NOW() + INTERVAL '28 days',
  'Zamalek Art Gallery, Cairo',
  20,
  (SELECT id FROM public.profiles WHERE is_admin = true LIMIT 1)
);
