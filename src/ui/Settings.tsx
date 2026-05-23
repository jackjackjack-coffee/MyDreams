type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sensitivity: number;
  onSensitivityChange: (v: number) => void;
  locked: boolean;
};

export function Settings({
  open,
  onOpenChange,
  sensitivity,
  onSensitivityChange,
  locked,
}: Props) {
  return (
    <div className="absolute right-4 top-4 z-10 select-none">
      <button
        onClick={() => onOpenChange(!open)}
        disabled={locked}
        className="rounded-md bg-black/40 px-3 py-1.5 text-xs font-medium text-white/80 ring-1 ring-white/10 backdrop-blur transition hover:bg-black/60 disabled:opacity-40"
      >
        Settings
      </button>

      {open && !locked && (
        <div className="mt-2 w-64 rounded-lg bg-black/70 p-4 text-sm text-white/90 ring-1 ring-white/10 backdrop-blur">
          <label className="block">
            <div className="mb-1.5 flex items-center justify-between">
              <span>Mouse sensitivity</span>
              <span className="tabular-nums text-white/60">
                {sensitivity.toFixed(2)}
              </span>
            </div>
            <input
              type="range"
              min={0.1}
              max={3}
              step={0.05}
              value={sensitivity}
              onChange={(e) => onSensitivityChange(parseFloat(e.target.value))}
              className="w-full accent-rose-400"
            />
            <div className="mt-1 flex justify-between text-[10px] text-white/40">
              <span>slower</span>
              <span>faster</span>
            </div>
          </label>
        </div>
      )}
    </div>
  );
}
