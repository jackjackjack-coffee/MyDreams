import { useEffect, useRef, useState } from 'react';
import { Filter } from 'bad-words';
import { placeDream } from './store';
import { getPlayerPos } from './playerPos';

const MAX_LEN = 500;
const filter = new Filter();

type Props = {
  open: boolean;
  onClose: () => void;
};

export function DreamForm({ open, onClose }: Props) {
  const [text, setText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const taRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (open) {
      setText('');
      setError(null);
      setSubmitting(false);
      // Focus the textarea so typing starts immediately.
      setTimeout(() => taRef.current?.focus(), 0);
    }
  }, [open]);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmed = text.trim();
    if (!trimmed) {
      setError('Write something first.');
      return;
    }
    if (trimmed.length > MAX_LEN) {
      setError(`Keep it under ${MAX_LEN} characters.`);
      return;
    }
    if (filter.isProfane(trimmed)) {
      setError('Please keep dreams kind and safe for strangers.');
      return;
    }

    setSubmitting(true);
    const { x, z } = getPlayerPos();
    const res = await placeDream({ kind: 'text', text: trimmed, x, z });
    setSubmitting(false);

    if (!res.ok) {
      setError(res.error);
      return;
    }
    onClose();
  };

  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <form
        onSubmit={handleSubmit}
        className="w-[28rem] max-w-[90vw] rounded-lg bg-black/80 p-5 text-white/90 ring-1 ring-white/10 backdrop-blur"
      >
        <h2 className="mb-1 text-lg font-light tracking-wide">Leave a dream</h2>
        <p className="mb-3 text-xs text-white/50">
          A stranger may walk by and read this. Be kind.
        </p>

        <textarea
          ref={taRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          maxLength={MAX_LEN}
          rows={5}
          placeholder="A small wish, a memory, a hope…"
          className="w-full resize-none rounded-md bg-black/50 p-3 text-sm placeholder-white/30 outline-none ring-1 ring-white/10 focus:ring-rose-300/40"
        />

        <div className="mt-1 flex items-center justify-between text-[11px] text-white/40">
          <span>{error ? <span className="text-rose-300">{error}</span> : ' '}</span>
          <span className="tabular-nums">
            {text.length} / {MAX_LEN}
          </span>
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md px-3 py-1.5 text-sm text-white/70 hover:bg-white/5"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="rounded-md bg-rose-300/80 px-4 py-1.5 text-sm font-medium text-black hover:bg-rose-300 disabled:opacity-50"
          >
            {submitting ? 'Placing…' : 'Place dream'}
          </button>
        </div>
      </form>
    </div>
  );
}
