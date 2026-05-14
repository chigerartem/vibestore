import type { VibeCheck } from '../lib/api';

const STATUS_STYLES: Record<VibeCheck['status'], string> = {
  Quiet: 'bg-slate-100 text-slate-600',
  Buzzing: 'bg-emerald-100 text-emerald-700',
  Steady: 'bg-sky-100 text-sky-700',
  'Needs attention': 'bg-rose-100 text-rose-700',
};

interface VibeCheckPanelProps {
  vibeCheck: VibeCheck | null;
}

export function VibeCheckPanel({ vibeCheck }: VibeCheckPanelProps) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-slate-900">Vibe Check</h2>
        {vibeCheck && (
          <span
            className={`rounded-full px-3 py-1 text-sm font-semibold ${STATUS_STYLES[vibeCheck.status]}`}
          >
            {vibeCheck.status}
          </span>
        )}
      </div>

      {vibeCheck ? (
        <>
          <p className="mt-2 text-sm text-slate-600">{vibeCheck.headline}</p>
          <dl className="mt-4 grid grid-cols-3 gap-3 text-center">
            <Stat label="Positive" value={vibeCheck.sentimentCounts.positive} />
            <Stat label="Neutral" value={vibeCheck.sentimentCounts.neutral} />
            <Stat label="Negative" value={vibeCheck.sentimentCounts.negative} />
          </dl>
        </>
      ) : (
        <p className="mt-2 text-sm text-slate-400">Loading…</p>
      )}
    </section>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg bg-slate-50 py-2">
      <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</dt>
      <dd className="text-xl font-semibold text-slate-900">{value}</dd>
    </div>
  );
}
