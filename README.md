# Haka Egypt - Community Events Platform

A production-ready web app for managing community events and meetups in Egypt.

## Tech Stack
- **Frontend**: Next.js 14 (App Router) + TypeScript
- **Styling**: Tailwind CSS
- **Backend**: Next.js API Routes + Supabase
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth
- **Deployment**: Vercel

## Setup (5 Steps)

### 1. Clone & Install
```bash
git clone <repo-url>
cd haka-egypt
npm install
```

### 2. Create Supabase Project
- Go to [supabase.com](https://supabase.com) and create a new project
- Copy your Project URL and anon key

### 3. Configure Environment
```bash
cp .env.example .env.local
# Fill in your Supabase credentials
```

### 4. Run Database Schema
- In Supabase Dashboard -> SQL Editor
- Run `supabase/schema.sql`
- Set your first user as admin: `UPDATE profiles SET is_admin = true WHERE email = 'your@email.com';`
- Run `supabase/seed.sql` for sample events

### 5. Run Locally
```bash
npm run dev
# Open http://localhost:3000
```

## Deploy to Vercel

1. Push to GitHub
2. Import repo on [vercel.com](https://vercel.com)
3. Add environment variables (same as `.env.local`)
4. Deploy - done!

## Features
- Email authentication (register/login)
- Browse & RSVP to events (attend or waitlist)
- Member profiles with interests
- Admin dashboard (manage events & users)
- Mobile-first responsive design

## Folder Structure
```
src/
├── app/           # Next.js pages
├── components/    # Reusable UI components
├── hooks/         # React hooks
├── lib/           # Supabase clients, utilities
└── types/         # TypeScript types
```
