import { useSyncExternalStore } from 'react';
import type { Dream } from './types';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

// Hand-rolled external store — avoids pulling in zustand for this one use.
type State = {
  dreams: Dream[];
  loading: boolean;
  error: string | null;
};

let state: State = { dreams: [], loading: false, error: null };
const listeners = new Set<() => void>();

function setState(next: Partial<State>) {
  state = { ...state, ...next };
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return state;
}

export function useDreams() {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

// Realtime cleanup handle — created once on first load.
let started = false;

export async function startDreamSync() {
  if (started) return;
  started = true;

  if (!isSupabaseConfigured) {
    setState({ error: 'Supabase not configured — see .env.example' });
    return;
  }

  setState({ loading: true });

  const { data, error } = await supabase
    .from('dreams')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) {
    setState({ loading: false, error: error.message });
    return;
  }

  setState({ dreams: (data ?? []) as Dream[], loading: false, error: null });

  supabase
    .channel('public:dreams')
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'dreams' },
      (payload) => {
        const incoming = payload.new as Dream;
        // Guard against echoing our own optimistic insert.
        if (state.dreams.some((d) => d.id === incoming.id)) return;
        setState({ dreams: [...state.dreams, incoming] });
      },
    )
    .subscribe();
}

type PlaceDreamInput =
  | { kind: 'text'; text: string; x: number; z: number }
  | { kind: 'image'; file: File; caption?: string; x: number; z: number };

// Optimistic insert — adds the new dream locally immediately, then writes to DB.
// On failure, removes the optimistic row and surfaces the error.
export async function placeDream(
  input: PlaceDreamInput,
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!isSupabaseConfigured) {
    return { ok: false, error: 'Supabase not configured' };
  }

  const { data: userData } = await supabase.auth.getUser();
  const userId = userData.user?.id;
  if (!userId) {
    return { ok: false, error: 'Not signed in' };
  }

  // For images: upload to storage first, get the public URL.
  let mediaUrl: string | null = null;
  let textContent: string | null = null;

  if (input.kind === 'text') {
    textContent = input.text;
  } else {
    const ext = (input.file.name.split('.').pop() || 'jpg').toLowerCase();
    const stamp = Date.now();
    const rand = Math.random().toString(36).slice(2, 8);
    const path = `${userId}/${stamp}-${rand}.${ext}`;

    const { error: upErr } = await supabase.storage
      .from('dream-media')
      .upload(path, input.file, {
        cacheControl: '3600',
        upsert: false,
        contentType: input.file.type || 'image/jpeg',
      });

    if (upErr) {
      return { ok: false, error: upErr.message };
    }

    const { data: urlData } = supabase.storage.from('dream-media').getPublicUrl(path);
    mediaUrl = urlData.publicUrl;
    textContent = input.caption?.trim() || null;
  }

  const optimistic: Dream = {
    id: `optimistic-${Date.now()}`,
    created_at: new Date().toISOString(),
    kind: input.kind,
    text: textContent,
    media_url: mediaUrl,
    x: input.x,
    y: 0,
    z: input.z,
    author_id: userId,
  };
  setState({ dreams: [...state.dreams, optimistic] });

  const { data, error } = await supabase
    .from('dreams')
    .insert({
      kind: input.kind,
      text: textContent,
      media_url: mediaUrl,
      x: input.x,
      y: 0,
      z: input.z,
      author_id: userId,
    })
    .select()
    .single();

  if (error || !data) {
    setState({ dreams: state.dreams.filter((d) => d.id !== optimistic.id) });
    return { ok: false, error: error?.message ?? 'Insert failed' };
  }

  // Replace optimistic with real row.
  setState({
    dreams: state.dreams.map((d) => (d.id === optimistic.id ? (data as Dream) : d)),
  });
  return { ok: true };
}

export async function reportDream(dreamId: string): Promise<{ ok: boolean }> {
  if (!isSupabaseConfigured) return { ok: false };
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData.user?.id;
  if (!userId) return { ok: false };
  const { error } = await supabase
    .from('reports')
    .insert({ dream_id: dreamId, reporter_id: userId });
  return { ok: !error };
}
