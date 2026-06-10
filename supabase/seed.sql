-- Optional: plant 20 starter dreams so the first visitors never find an
-- empty garden. Paste into Supabase → SQL Editor → Run.
--
-- Run it AFTER you've opened the app at least once — that first visit creates
-- the anonymous user these dreams will belong to.
--
-- Safe to run twice: it does nothing if the starter dreams are already there.

do $$
declare
  uid uuid;
begin
  select id into uid from auth.users order by created_at limit 1;
  if uid is null then
    raise exception 'No users yet — open the app once in your browser, then re-run this.';
  end if;

  if exists (
    select 1 from public.dreams
    where text = 'I want to write a book that someone reads twice.'
  ) then
    raise notice 'Starter dreams already planted — nothing to do.';
    return;
  end if;

  insert into public.dreams (kind, text, x, y, z, author_id) values
    ('text', 'I hope the version of me from ten years ago would be proud of how gently I turned out.', 12, 0, -18, uid),
    ('text', 'My dream is to open a tiny bakery by the sea. Cinnamon in the morning fog. You''re all invited.', -26, 0, 9, uid),
    ('text', 'I want to learn my grandmother''s language well enough to dream in it.', 31, 0, 24, uid),
    ('text', 'Someday I''ll walk the whole coast of my country, one unhurried summer.', -14, 0, -33, uid),
    ('text', 'I left this here so a stranger would know: whatever you''re carrying tonight, you''re doing better than you think.', 5, 0, 17, uid),
    ('text', 'I dream of a house with a crooked staircase and a cat asleep on every windowsill.', -42, 0, -12, uid),
    ('text', 'One day I want to see the northern lights with my dad, before his eyes get worse.', 48, 0, -7, uid),
    ('text', 'I hope to forgive myself for the years I spent being someone else.', -8, 0, 41, uid),
    ('text', 'My wish: that my little brother never loses the way he laughs at his own jokes.', 22, 0, -45, uid),
    ('text', 'I want to write a book that someone reads twice.', -55, 0, 28, uid),
    ('text', 'To whoever finds this — I planted a garden this spring for the first time. Everything died except one sunflower. I think about that sunflower a lot.', 38, 0, 52, uid),
    ('text', 'I dream about playing piano in a train station and one person stopping to listen all the way through.', -31, 0, -52, uid),
    ('text', 'Someday: a long table, every chair full, nobody checking the time.', 60, 0, 15, uid),
    ('text', 'I hope the ocean is still loud and cold and full of strange things when my daughter is old enough to love it.', -62, 0, -25, uid),
    ('text', 'My quiet dream is to be the kind of old person who feeds birds and knows all their names.', 9, 0, 64, uid),
    ('text', 'I want to fall asleep without rehearsing tomorrow.', -18, 0, 58, uid),
    ('text', 'One day I''ll go back to the town I grew up in and thank the librarian. She knew, I think, that the library was the only quiet place I had.', 44, 0, -38, uid),
    ('text', 'I dream of finishing things. Even small ones. Especially small ones.', -49, 0, 47, uid),
    ('text', 'May whoever reads this find a yellow door someday, and may everything behind it be kind.', 17, 0, -60, uid),
    ('text', 'I left my dream here so it would have somewhere to grow while I get braver.', -5, 0, -10, uid);
end $$;
