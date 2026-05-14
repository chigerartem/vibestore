import type { Priority, Resource, Sentiment } from '../lib/api';

const SENTIMENT_STYLES: Record<Sentiment, string> = {
  positive: 'bg-emerald-100 text-emerald-700',
  neutral: 'bg-slate-100 text-slate-600',
  negative: 'bg-rose-100 text-rose-700',
};

const PRIORITY_STYLES: Record<Priority, string> = {
  low: 'bg-sky-100 text-sky-700',
  medium: 'bg-amber-100 text-amber-700',
  high: 'bg-rose-100 text-rose-700',
};

function Badge({ label, className }: { label: string; className: string }) {
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${className}`}>
      {label}
    </span>
  );
}

interface ResourceListProps {
  resources: Resource[];
}

export function ResourceList({ resources }: ResourceListProps) {
  if (resources.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-500">
        No resources yet — add your first one above.
      </p>
    );
  }

  // Newest first — the store returns insertion order.
  const ordered = [...resources].reverse();

  return (
    <ul className="space-y-3">
      {ordered.map((resource) => (
        <li
          key={resource.id}
          className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
        >
          <div className="flex items-start justify-between gap-3">
            <h3 className="font-semibold text-slate-900">{resource.name}</h3>
            <div className="flex shrink-0 gap-1.5">
              <Badge label={resource.sentiment} className={SENTIMENT_STYLES[resource.sentiment]} />
              <Badge
                label={`${resource.priority} priority`}
                className={PRIORITY_STYLES[resource.priority]}
              />
            </div>
          </div>
          <p className="mt-1.5 text-sm text-slate-600">{resource.description}</p>
        </li>
      ))}
    </ul>
  );
}
