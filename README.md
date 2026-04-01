# StandStrong — POTS Fitness Website

A specialized fitness website for people with POTS (Postural Orthostatic Tachycardia Syndrome). Built with Vite, Supabase, and deployed via Vercel.

## Tech Stack
- **Frontend**: Vanilla HTML/CSS/JS + Vite
- **Database**: Supabase (newsletter signups)
- **Deployment**: Vercel
- **Version Control**: GitHub

---

## Local Development

### 1. Install dependencies
```bash
npm install
```

### 2. Set up environment variables
Copy `.env.example` to `.env` and fill in your Supabase credentials:
```bash
cp .env.example .env
```

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
VITE_NEWSLETTER_WEBHOOK_URL=https://your-webhook-url
```

### 3. Run the dev server
```bash
npm run dev
```
Opens at http://localhost:3000

---

## Supabase Setup

1. Go to [supabase.com](https://supabase.com) and create a new project
2. In the SQL editor, run:

```sql
create table subscribers (
  id uuid default gen_random_uuid() primary key,
  email text unique not null,
  created_at timestamp with time zone default now()
);

create table workout_progress (
  id uuid default gen_random_uuid() primary key,
  user_id uuid,
  category text,
  completed int4 default 0,
  created_at timestamp with time zone default now()
);
```

3. Copy your Project URL and anon key from **Settings → API** into your `.env`

---

## Deploy to Vercel

### Option A — Vercel CLI (recommended)
```bash
npm install -g vercel
vercel
```
Follow the prompts. Then add environment variables:
```bash
vercel env add VITE_SUPABASE_URL
vercel env add VITE_SUPABASE_ANON_KEY
```

### Option B — GitHub integration
1. Push to GitHub (see below)
2. Go to [vercel.com](https://vercel.com) → Import Project → select your repo
3. Add environment variables in the Vercel dashboard under **Settings → Environment Variables**

---

## Push to GitHub

```bash
git init
git add .
git commit -m "initial commit: standstrong pots site"
git remote add origin https://github.com/YOUR_USERNAME/standstrong.git
git branch -M main
git push -u origin main
```

---

## Monetization Zones

| Placement | Type | Recommended Network |
|---|---|---|
| Top leaderboard banner | Display ad | Google AdSense |
| In-feed card (between workouts) | Native ad | AdSense / Mediavine |
| Sidebar 300×250 | Display ad | AdSense |
| Gear sidebar | Affiliate links | Amazon Associates |
| Footer affiliate disclosure | Required legal | N/A |

---

## Project Structure

```
standstrong/
├── index.html          # Main site
├── src/
│   ├── main.js         # Filter logic + newsletter Supabase integration
│   └── supabase.js     # Supabase client
├── .env.example        # Environment variable template
├── .gitignore
├── vercel.json         # Vercel SPA routing config
├── vite.config.js
└── package.json
```
