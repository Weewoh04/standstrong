# StandStrong - POTS Fitness Website

A specialized fitness website for people with POTS (Postural Orthostatic Tachycardia Syndrome). Built with Vite and Supabase.

## Tech Stack
- Frontend: Vanilla HTML/CSS/JS + Vite
- Database/Auth: Supabase
- Deployment: Vercel

## Local Development
1. Install dependencies
```bash
npm install
```

2. Set up environment variables
Copy `.env.example` to `.env` and fill values:
```bash
cp .env.example .env
```

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
VITE_NEWSLETTER_WEBHOOK_URL=https://your-webhook-url
```

3. Run dev server
```bash
npm run dev
```

## Supabase Setup
1. Create a Supabase project.
2. In SQL Editor, run `supabase/community_schema.sql`.
3. Ensure Email Auth is enabled in Supabase Auth settings.
4. Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` to local and production env vars.

## Community Features
- Account creation and login
- Story/discussion posting
- Commenting
- Reporting posts/comments
- NSFW firewall:
  - Client-side keyword blocking
  - Database trigger blocking via `community_reject_nsfw()`

## Deploy to Vercel
Set env vars in project settings:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_NEWSLETTER_WEBHOOK_URL`

Then deploy normally.
