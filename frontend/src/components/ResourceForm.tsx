import { useState, type FormEvent } from 'react';
import type { CreateResourceInput, Priority } from '../lib/api';

interface ResourceFormProps {
  onAdd: (input: CreateResourceInput) => Promise<void>;
}

const PRIORITIES: ReadonlyArray<{ value: Priority; label: string }> = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
];

const fieldClass =
  'mt-1.5 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 ' +
  'placeholder:text-zinc-400 outline-none transition-[border-color,box-shadow] duration-150 ease-out ' +
  'focus:border-zinc-300 focus:ring-2 focus:ring-zinc-900/10';

const labelClass = 'text-xs font-medium text-zinc-600';

export function ResourceForm({ onAdd }: ResourceFormProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = name.trim() !== '' && description.trim() !== '' && !submitting;
  const priorityIndex = PRIORITIES.findIndex((option) => option.value === priority);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!canSubmit) return;

    setSubmitting(true);
    setError(null);
    try {
      await onAdd({ name: name.trim(), description: description.trim(), priority });
      setName('');
      setDescription('');
      setPriority('medium');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
      <h2 className="text-sm font-semibold text-zinc-900">Add a resource</h2>
      <p className="mt-0.5 text-sm text-zinc-500">
        Sentiment is tagged automatically — you set the priority.
      </p>

      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        <div>
          <label htmlFor="resource-name" className={labelClass}>
            Resource name
          </label>
          <input
            id="resource-name"
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            maxLength={100}
            placeholder="Checkout service"
            className={fieldClass}
          />
        </div>

        <div>
          <label htmlFor="resource-description" className={labelClass}>
            Description
          </label>
          <textarea
            id="resource-description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            maxLength={500}
            rows={3}
            placeholder="What's the state of it? Mention wins, blockers, or anything urgent."
            className={`${fieldClass} resize-y`}
          />
        </div>

        <div>
          <span className={labelClass}>Priority</span>
          <div
            role="group"
            aria-label="Priority"
            className="relative mt-1.5 grid grid-cols-3 rounded-lg bg-zinc-100 p-0.5"
          >
            {/* Sliding selected indicator. */}
            <span
              aria-hidden="true"
              className="absolute inset-y-0.5 left-0.5 rounded-md bg-white shadow-sm transition-transform duration-200 ease-out"
              style={{
                width: 'calc((100% - 4px) / 3)',
                transform: `translateX(${priorityIndex * 100}%)`,
              }}
            />
            {PRIORITIES.map((option) => (
              <button
                key={option.value}
                type="button"
                aria-pressed={priority === option.value}
                onClick={() => setPriority(option.value)}
                className={`relative z-10 rounded-md py-1.5 text-xs font-medium transition-colors duration-150 ease-out ${
                  priority === option.value
                    ? 'text-zinc-900'
                    : 'text-zinc-500 hover:text-zinc-700'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <p role="alert" className="text-sm text-rose-600">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={!canSubmit}
          className="w-full rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-[transform,background-color] duration-150 ease-out hover:bg-zinc-800 active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-zinc-200 disabled:text-zinc-400 sm:w-auto"
        >
          {submitting ? 'Adding…' : 'Add resource'}
        </button>
      </form>
    </section>
  );
}
