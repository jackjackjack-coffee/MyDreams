import { useEffect, useRef, useState } from 'react';
import { Filter } from 'bad-words';
import { placeDream } from './store';
import { getPlayerPos } from './playerPos';

const MAX_LEN = 500;
const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5 MB
const MAX_VIDEO_BYTES = 50 * 1024 * 1024; // 50 MB
const ACCEPTED_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/gif'];
const ACCEPTED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime'];
const filter = new Filter();

type DreamKind = 'text' | 'image' | 'video';

type Props = {
  open: boolean;
  onClose: () => void;
};

const TABS: { kind: DreamKind; label: string; color: string }[] = [
  { kind: 'text',  label: 'Text',  color: 'text-amber-300  border-amber-300/60'  },
  { kind: 'image', label: 'Image', color: 'text-cyan-300   border-cyan-300/60'   },
  { kind: 'video', label: 'Video', color: 'text-fuchsia-300 border-fuchsia-300/60' },
];

export function DreamForm({ open, onClose }: Props) {
  const [kind, setKind] = useState<DreamKind>('text');
  const [text, setText] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageCaption, setImageCaption] = useState('');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [videoCaption, setVideoCaption] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const taRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  // Reset when form opens
  useEffect(() => {
    if (open) {
      setKind('text');
      setText('');
      setImageFile(null);
      setImagePreview(null);
      setImageCaption('');
      setVideoFile(null);
      setVideoPreview(null);
      setVideoCaption('');
      setError(null);
      setSubmitting(false);
      setTimeout(() => taRef.current?.focus(), 0);
    }
  }, [open]);

  // Revoke object URLs when previews change (avoid memory leak)
  useEffect(() => {
    return () => { if (imagePreview) URL.revokeObjectURL(imagePreview); };
  }, [imagePreview]);

  useEffect(() => {
    return () => { if (videoPreview) URL.revokeObjectURL(videoPreview); };
  }, [videoPreview]);

  if (!open) return null;

  const stopGameKeys = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
    e.nativeEvent.stopPropagation();
  };

  const handleFile = (file: File | null) => {
    setError(null);
    if (!file) {
      setImageFile(null);
      setImagePreview(null);
      return;
    }
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      setError('Image must be PNG, JPG, WebP, or GIF.');
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setError(`Image must be under ${Math.round(MAX_IMAGE_BYTES / 1024 / 1024)} MB.`);
      return;
    }
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleVideoFile = (file: File | null) => {
    setError(null);
    if (!file) {
      setVideoFile(null);
      setVideoPreview(null);
      return;
    }
    if (!ACCEPTED_VIDEO_TYPES.includes(file.type)) {
      setError('Video must be MP4, WebM, or MOV.');
      return;
    }
    if (file.size > MAX_VIDEO_BYTES) {
      setError(`Video must be under ${Math.round(MAX_VIDEO_BYTES / 1024 / 1024)} MB.`);
      return;
    }
    if (videoPreview) URL.revokeObjectURL(videoPreview);
    setVideoFile(file);
    setVideoPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const { x, z } = getPlayerPos();

    if (kind === 'text') {
      const trimmed = text.trim();
      if (!trimmed) { setError('Write something first.'); return; }
      if (trimmed.length > MAX_LEN) { setError(`Keep it under ${MAX_LEN} characters.`); return; }
      if (filter.isProfane(trimmed)) { setError('Please keep dreams kind and safe for strangers.'); return; }

      setSubmitting(true);
      const res = await placeDream({ kind: 'text', text: trimmed, x, z });
      setSubmitting(false);
      if (!res.ok) { setError(res.error); return; }
      onClose();
      return;
    }

    if (kind === 'image') {
      if (!imageFile) { setError('Pick an image to upload first.'); return; }
      const trimmedCaption = imageCaption.trim();
      if (trimmedCaption.length > MAX_LEN) {
        setError(`Caption must be under ${MAX_LEN} characters.`); return;
      }
      if (trimmedCaption && filter.isProfane(trimmedCaption)) {
        setError('Please keep captions kind and safe for strangers.'); return;
      }

      setSubmitting(true);
      const res = await placeDream({
        kind: 'image',
        file: imageFile,
        caption: trimmedCaption || undefined,
        x, z,
      });
      setSubmitting(false);
      if (!res.ok) { setError(res.error); return; }
      onClose();
      return;
    }

    if (kind === 'video') {
      if (!videoFile) { setError('Pick a video to upload first.'); return; }
      const trimmedCaption = videoCaption.trim();
      if (trimmedCaption.length > MAX_LEN) {
        setError(`Caption must be under ${MAX_LEN} characters.`); return;
      }
      if (trimmedCaption && filter.isProfane(trimmedCaption)) {
        setError('Please keep captions kind and safe for strangers.'); return;
      }

      setSubmitting(true);
      const res = await placeDream({
        kind: 'video',
        file: videoFile,
        caption: trimmedCaption || undefined,
        x, z,
      });
      setSubmitting(false);
      if (!res.ok) { setError(res.error); return; }
      onClose();
    }
  };

  const submitDisabled =
    submitting ||
    (kind === 'text' && text.trim().length === 0) ||
    (kind === 'image' && !imageFile) ||
    (kind === 'video' && !videoFile);

  return (
    <div
      className="absolute inset-0 z-20 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      style={{ cursor: 'auto' }}
    >
      <form
        onSubmit={handleSubmit}
        className="w-[28rem] max-w-[90vw] rounded-lg bg-black/80 p-5 text-white/90 ring-1 ring-white/10 backdrop-blur"
      >
        <h2 className="mb-1 text-lg font-light tracking-wide">Leave a dream</h2>
        <p className="mb-3 text-xs text-white/50">
          A stranger may walk by and read this. Be kind.
        </p>

        {/* Dream type tabs */}
        <div className="mb-4 flex gap-2">
          {TABS.map(({ kind: k, label, color }) => (
            <button
              key={k}
              type="button"
              onClick={() => { setKind(k); setError(null); }}
              className={`rounded-md border px-3 py-1 text-xs font-medium transition-colors ${
                kind === k
                  ? color + ' bg-white/5'
                  : 'border-white/10 text-white/30 hover:text-white/50'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {kind === 'text' && (
          <>
            <textarea
              ref={taRef}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={stopGameKeys}
              maxLength={MAX_LEN}
              rows={5}
              placeholder="A small wish, a memory, a hope…"
              className="w-full resize-none rounded-md bg-black/50 p-3 text-sm placeholder-white/30 outline-none ring-1 ring-white/10 focus:ring-rose-300/40"
            />
            <div className="mt-1 flex items-center justify-between text-[11px] text-white/40">
              <span>{error ? <span className="text-rose-300">{error}</span> : ' '}</span>
              <span className="tabular-nums">{text.length} / {MAX_LEN}</span>
            </div>
          </>
        )}

        {kind === 'image' && (
          <>
            <input
              ref={fileInputRef}
              type="file"
              accept={ACCEPTED_IMAGE_TYPES.join(',')}
              onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
              className="hidden"
            />

            {!imagePreview ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragEnter={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragOver(false);
                  handleFile(e.dataTransfer.files?.[0] ?? null);
                }}
                className={`flex h-40 flex-col items-center justify-center rounded-md border-2 border-dashed text-center text-sm transition-colors cursor-pointer ${
                  dragOver
                    ? 'border-cyan-300/60 bg-cyan-300/5 text-cyan-200'
                    : 'border-white/10 text-white/40 hover:border-white/20 hover:text-white/60'
                }`}
              >
                <span className="text-2xl mb-1">🖼️</span>
                <span className="font-medium">Click or drop an image here</span>
                <span className="mt-1 text-[11px] text-white/30">
                  PNG, JPG, WebP or GIF · up to 5 MB
                </span>
              </div>
            ) : (
              <div className="relative overflow-hidden rounded-md ring-1 ring-white/10">
                <img
                  src={imagePreview}
                  alt="preview"
                  className="block max-h-56 w-full object-contain bg-black/40"
                />
                <button
                  type="button"
                  onClick={() => { handleFile(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                  className="absolute right-2 top-2 rounded-md bg-black/70 px-2 py-1 text-xs text-white/80 hover:bg-black/90"
                >
                  Remove
                </button>
              </div>
            )}

            <input
              type="text"
              value={imageCaption}
              onChange={(e) => setImageCaption(e.target.value)}
              onKeyDown={stopGameKeys}
              maxLength={MAX_LEN}
              placeholder="Add a caption (optional)…"
              className="mt-3 w-full rounded-md bg-black/50 px-3 py-2 text-sm placeholder-white/30 outline-none ring-1 ring-white/10 focus:ring-cyan-300/40"
            />

            <div className="mt-1 flex items-center justify-between text-[11px] text-white/40">
              <span>{error ? <span className="text-rose-300">{error}</span> : ' '}</span>
              <span className="tabular-nums">{imageCaption.length} / {MAX_LEN}</span>
            </div>
          </>
        )}

        {kind === 'video' && (
          <>
            <input
              ref={videoInputRef}
              type="file"
              accept={ACCEPTED_VIDEO_TYPES.join(',')}
              onChange={(e) => handleVideoFile(e.target.files?.[0] ?? null)}
              className="hidden"
            />

            {!videoPreview ? (
              <div
                onClick={() => videoInputRef.current?.click()}
                onDragEnter={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragOver(false);
                  handleVideoFile(e.dataTransfer.files?.[0] ?? null);
                }}
                className={`flex h-40 flex-col items-center justify-center rounded-md border-2 border-dashed text-center text-sm transition-colors cursor-pointer ${
                  dragOver
                    ? 'border-fuchsia-300/60 bg-fuchsia-300/5 text-fuchsia-200'
                    : 'border-white/10 text-white/40 hover:border-white/20 hover:text-white/60'
                }`}
              >
                <span className="text-2xl mb-1">🎞️</span>
                <span className="font-medium">Click or drop a video here</span>
                <span className="mt-1 text-[11px] text-white/30">
                  MP4, WebM or MOV · up to 50 MB
                </span>
              </div>
            ) : (
              <div className="relative overflow-hidden rounded-md ring-1 ring-white/10">
                <video
                  src={videoPreview}
                  controls
                  preload="metadata"
                  className="block max-h-56 w-full bg-black/40"
                />
                <button
                  type="button"
                  onClick={() => {
                    handleVideoFile(null);
                    if (videoInputRef.current) videoInputRef.current.value = '';
                  }}
                  className="absolute right-2 top-2 rounded-md bg-black/70 px-2 py-1 text-xs text-white/80 hover:bg-black/90"
                >
                  Remove
                </button>
              </div>
            )}

            <input
              type="text"
              value={videoCaption}
              onChange={(e) => setVideoCaption(e.target.value)}
              onKeyDown={stopGameKeys}
              maxLength={MAX_LEN}
              placeholder="Add a caption (optional)…"
              className="mt-3 w-full rounded-md bg-black/50 px-3 py-2 text-sm placeholder-white/30 outline-none ring-1 ring-white/10 focus:ring-fuchsia-300/40"
            />

            <div className="mt-1 flex items-center justify-between text-[11px] text-white/40">
              <span>{error ? <span className="text-rose-300">{error}</span> : ' '}</span>
              <span className="tabular-nums">{videoCaption.length} / {MAX_LEN}</span>
            </div>
          </>
        )}

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
            disabled={submitDisabled}
            className="rounded-md bg-rose-300/80 px-4 py-1.5 text-sm font-medium text-black hover:bg-rose-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'Placing…' : 'Place dream'}
          </button>
        </div>
      </form>
    </div>
  );
}
