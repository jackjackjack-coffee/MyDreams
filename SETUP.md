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

This creates the `dreams` and `reports` tables with the right security policies (anyone can read dreams; only signed-in users can write their own), plus the `dream-media` storage bucket for image uploads.

> **If you set up Supabase before image uploads existed,** just re-run the same `schema.sql` file. It's re-runnable and will only add the new column + bucket.

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

## 8. Plant the starter dreams (optional but recommended)

An empty garden makes a bad first impression. After you've opened the app at least once:

1. **SQL Editor** → **New query**.
2. Paste the whole of `supabase/seed.sql` and **Run**.

Twenty hand-written dreams appear, scattered around the spawn point. Safe to run twice — it skips itself if they're already planted.

## 9. Moderation — what happens when someone clicks Report

The safety rules live in the database, so they hold even against someone scripting the API directly:

- A visitor can leave at most **5 dreams per hour** and upload at most **5 files per hour**. Over the limit, the app shows a gentle "the garden needs to rest" message.
- Each visitor can report a given dream **once**.
- When **3 different visitors** report the same dream, it's **hidden automatically** — it vanishes from the world for everyone but isn't deleted.

### Reviewing reported dreams

Open **SQL Editor** and run:

```sql
select * from moderation_queue;
```

Most-reported dreams come first. `hidden = true` means it's already off the map. Then decide, per dream id:

```sql
-- It's fine, put it back (also clear its reports so 1 more report doesn't re-hide it):
update dreams set hidden = false where id = 'PASTE-ID-HERE';
delete from reports where dream_id = 'PASTE-ID-HERE';

-- It's bad, delete it for good (reports go with it automatically):
delete from dreams where id = 'PASTE-ID-HERE';
```

> Deleting an image/video dream removes the marker and the database row; the uploaded file stays in **Storage → dream-media** if you also want to remove it there.
