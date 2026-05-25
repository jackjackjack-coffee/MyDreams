# MyDreams — first-time setup

You only need to do this once. Takes about 10 minutes.

## 1. Create a free Supabase project

1. Go to https://supabase.com and sign in (GitHub works).
2. Click **New Project**.
3. Give it a name (e.g. `mydreams`) and a strong database password (save it — but you won't need it for the app).
4. Pick a region close to you.
5. Click **Create new project** and wait ~2 minutes for it to spin up.

## 2. Paste the schema

1. In your project dashboard, open **SQL Editor** (left sidebar) → **New query**.
2. Open `supabase/schema.sql` in this repo, copy the whole file, and paste it into the editor.
3. Click **Run** (or press ⌘/Ctrl-Enter). You should see "Success. No rows returned."

This creates the `dreams` and `reports` tables with the right security policies (anyone can read dreams; only signed-in users can write their own).

## 3. Turn on anonymous sign-in

Without a login, every visitor still needs an identity to write to the database. Supabase calls this "anonymous auth."

1. Sidebar → **Authentication** → **Providers**.
2. Find **Anonymous Sign-Ins** in the list.
3. Toggle it **on** and save.

## 4. Copy your project keys

1. Sidebar → **Project Settings** (gear icon) → **API**.
2. Copy two values:
   - **Project URL** (looks like `https://abcdefg.supabase.co`)
   - **anon public** key (long string starting with `eyJ…`)

The `anon` key is safe to ship to the browser — that's its job.

## 5. Wire keys into the app — locally

In the repo root, create a file called `.env.local` (with the dot):

```
VITE_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
```

`.env.local` is in `.gitignore` so it never gets committed. Run `npm run dev` and the app should connect.

## 6. Wire keys into the app — on Vercel

1. In Vercel → your MyDreams project → **Settings** → **Environment Variables**.
2. Add the same two variables (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`) for **Production**, **Preview**, and **Development**.
3. Trigger a redeploy (push any commit, or hit Redeploy in the Vercel dashboard).

## 7. Try it

1. Open your Vercel preview URL.
2. Click to enter the world.
3. Press **E** → write a short dream → **Place dream**.
4. A glowing gold flower should appear at your feet.
5. Walk away, turn back, click the flower → your dream pops up.
6. Refresh the page → it's still there.

If something doesn't work, check the browser console first — most failures print a clear error from Supabase.
