import type { Priority, Resource, Sentiment } from '../lib/api';
import { Reveal } from './Reveal';

const SENTIMENT_BADGE: Record<Sentiment, string> = {
  positive: 'bg-emerald-50 text-emerald-700 ring-emerald-600/15',
  neutral: 'bg-zinc-100 text-zinc-600 ring-zinc-500/15',
  negative: 'bg-rose-50 text-rose-700 ring-rose-600/15',
};

const PRIORITY_BADGE: Record<Priority, string> = {
  low: 'bg-sky-50 text-sky-700 ring-sky-600/15',
  medium: 'bg-amber-50 text-amber-700 ring-amber-600/15',
  high: 'bg-rose-50 text-rose-700 ring-rose-600/15',
};

function Badge({ label, className }: { label: string; className: string }) {
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-[11px] font-medium capitalize ring-1 ring-inset ${className}`}
    >
      {label}
    </span>
  );
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

interface ResourceListProps {
  resources: Resource[];
  onDelete: (id: string) => void;
}

export function ResourceList({ resources, onDelete }: ResourceListProps) {
  if (resources.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-zinc-300 bg-white/60 px-6 py-12 text-center">
        <p className="text-sm text-zinc-500">No resources yet — add your first one above.</p>
      </div>
    );
  }

  // Newest first — the store returns insertion order.
  const ordered = [...resources].reverse();

  return (
    <ul className="space-y-2.5">
      {ordered.map((resource, index) => (
        <li key={resource.id}>
          <Reveal delay={index * 40}>
            <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm transition-colors duration-150 ease-out hover:border-zinc-300">
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-sm font-semibold text-zinc-900">{resource.name}</h3>
                <div className="flex shrink-0 items-center gap-1.5">
                  <Badge
                    label={resource.sentiment}
                    className={SENTIMENT_BADGE[resource.sentiment]}
                  />
                  <Badge
                    label={`${resource.priority} priority`}
                    className={PRIORITY_BADGE[resource.priority]}
                  />
                  <button
                    type="button"
                    onClick={() => onDelete(resource.id)}
                    aria-label={`Delete ${resource.name}`}
                    className="-mr-1 ml-0.5 rounded-md p-1 text-zinc-300 transition-[color,background-color,transform] duration-150 ease-out hover:bg-zinc-100 hover:text-zinc-600 active:scale-90"
                  >
                    <CloseIcon />
                  </button>
                </div>
              </div>
              <p className="mt-1.5 text-sm leading-relaxed text-zinc-600">{resource.description}</p>
              <p className="mt-2.5 text-[11px] uppercase tracking-wider text-zinc-400">
                Logged {formatTime(resource.createdAt)}
              </p>
            </div>
          </Reveal>
        </li>
      ))}
    </ul>
  );
}

function CloseIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path
        d="M3.5 3.5l7 7M10.5 3.5l-7 7"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
      />
    </svg>
  );
}
