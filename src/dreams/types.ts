export type DreamKind = 'text' | 'image' | 'video';

export type Dream = {
  id: string;
  created_at: string;
  kind: DreamKind;
  text: string | null;
  media_url: string | null;
  x: number;
  y: number;
  z: number;
  author_id: string;
  // Optional so the app keeps working against a database that predates the
  // safety pass (re-run supabase/schema.sql to add the column).
  hidden?: boolean;
};

// Color-coded glow per CLAUDE.md spec.
export const DREAM_COLORS: Record<DreamKind, string> = {
  text: '#e8c279', // warm gold
  image: '#6dd5d8', // soft cyan
  video: '#d8a0c4', // pink-magenta
};
