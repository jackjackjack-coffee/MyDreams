import { useState } from 'react';
import type { Dream } from './types';
import { reportDream } from './store';

function timeAgo(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  const m = Math.floor(ms / 60000);
  if (m < 1) return 'a moment ago';
  if (m < 60) return `${m} minute${m === 1 ? '' : 's'} ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} hour${h === 1 ? '' : 's'} ago`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d} day${d === 1 ? '' : 's'} ago`;
  const mo = Math.floor(d / 30);
  if (mo < 12) return `${mo} month${mo === 1 ? '' : 's'} ago`;
  const y = Math.floor(mo / 12);
  return `${y} year${y === 1 ? '' : 's'} ago`;
}

type Props = {
  dream: Dream | null;
  onClose: () => void;
};

export function DreamPopup({ dream, onClose }: Props) {
  const [reported, setReported] = useState(false);

  if (!dream) return null;

  const handleReport = async () => {
    if (reported) return;
    setReported(true);
    await reportDream(dream.id);
  };

  return (
    <div
      className="absolute inset-0 z-20 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      style={{ cursor: 'auto' }}
    >
      <div className="w-[28rem] max-w-[90vw] rounded-lg bg-black/80 p-5 text-white/90 ring-1 ring-white/10 backdrop-blur">
        <div className="mb-3 text-[11px] uppercase tracking-widest text-white/40">
          A dream · {timeAgo(dream.created_at)}
        </div>

        {dream.kind === 'image' && dream.media_url && (
          <img
            src={dream.media_url}
            alt="A stranger's image"
            className="mb-3 block max-h-80 w-full rounded-md bg-black/40 object-contain ring-1 ring-white/5"
          />
        )}

        {dream.kind === 'video' && dream.media_url && (
          <video
            src={dream.media_url}
            controls
            preload="metadata"
            className="mb-3 block max-h-80 w-full rounded-md bg-black/40 ring-1 ring-white/5"
          />
        )}

        {dream.text && (
          <p className="whitespace-pre-wrap text-base leading-relaxed text-white/90">
            {dream.text}
          </p>
        )}

        <div className="mt-5 flex items-center justify-between">
          <button
            type="button"
            onClick={handleReport}
            disabled={reported}
            className="text-xs text-white/40 hover:text-rose-300 disabled:text-white/30"
          >
            {reported ? 'Reported — thank you' : 'Report'}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md bg-white/10 px-4 py-1.5 text-sm text-white/80 hover:bg-white/20"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
