import type { Sentiment, VibeCheck } from '../lib/api';

const STATUS_COLOR: Record<VibeCheck['status'], string> = {
  Quiet: 'text-zinc-500',
  Buzzing: 'text-emerald-600',
  Steady: 'text-sky-600',
  'Needs attention': 'text-amber-600',
};

const STATUS_DOT: Record<VibeCheck['status'], string> = {
  Quiet: 'bg-zinc-300',
  Buzzing: 'bg-emerald-500',
  Steady: 'bg-sky-500',
  'Needs attention': 'bg-amber-500',
};

const SENTIMENT_TILES: ReadonlyArray<{ key: Sentiment; label: string; dot: string }> = [
  { key: 'positive', label: 'Positive', dot: 'bg-emerald-500' },
  { key: 'neutral', label: 'Neutral', dot: 'bg-zinc-400' },
  { key: 'negative', label: 'Negative', dot: 'bg-rose-500' },
];

interface VibeCheckPanelProps {
  vibeCheck: VibeCheck | null;
}

export function VibeCheckPanel({ vibeCheck }: VibeCheckPanelProps) {
  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-2">
        <span
          className={`h-1.5 w-1.5 rounded-full ${
            vibeCheck ? `${STATUS_DOT[vibeCheck.status]} animate-vibe-pulse` : 'bg-zinc-300'
          }`}
        />
        <span className="text-[11px] font-medium uppercase tracking-wider text-zinc-400">
          Project health
        </span>
      </div>

      {vibeCheck ? (
        <>
          <div className="mt-3 flex items-end justify-between gap-4">
            <div>
              <h2
                className={`text-2xl font-semibold tracking-tight ${STATUS_COLOR[vibeCheck.status]}`}
              >
                {vibeCheck.status}
              </h2>
              <p className="mt-1 text-sm text-zinc-500">{vibeCheck.headline}</p>
            </div>
            <div className="shrink-0 text-right">
              <div className="text-2xl font-semibold tabular-nums text-zinc-900">
                {vibeCheck.total}
              </div>
              <div className="text-[11px] uppercase tracking-wider text-zinc-400">resources</div>
            </div>
          </div>

          <dl className="mt-5 grid grid-cols-3 gap-px overflow-hidden rounded-xl border border-zinc-200 bg-zinc-200">
            {SENTIMENT_TILES.map((tile) => (
              <div key={tile.key} className="bg-white px-4 py-3">
                <dd className="text-xl font-semibold tabular-nums text-zinc-900">
                  {vibeCheck.sentimentCounts[tile.key]}
                </dd>
                <dt className="mt-0.5 flex items-center gap-1.5 text-xs text-zinc-500">
                  <span className={`h-1.5 w-1.5 rounded-full ${tile.dot}`} />
                  {tile.label}
                </dt>
              </div>
            ))}
          </dl>
        </>
      ) : (
        <div className="mt-3 space-y-2">
          <div className="h-7 w-40 animate-pulse rounded-md bg-zinc-100" />
          <div className="h-4 w-56 animate-pulse rounded-md bg-zinc-100" />
        </div>
      )}
    </section>
  );
}
