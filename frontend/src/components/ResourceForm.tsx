import { useState, type FormEvent } from 'react';
import type { CreateResourceInput } from '../lib/api';

interface ResourceFormProps {
  onAdd: (input: CreateResourceInput) => Promise<void>;
}

const fieldClass =
  'mt-1.5 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 ' +
  'placeholder:text-zinc-400 outline-none transition-[border-color,box-shadow] duration-150 ease-out ' +
  'focus:border-zinc-300 focus:ring-2 focus:ring-zinc-900/10';

const labelClass = 'text-xs font-medium text-zinc-600';

export function ResourceForm({ onAdd }: ResourceFormProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = name.trim() !== '' && description.trim() !== '' && !submitting;

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!canSubmit) return;

    setSubmitting(true);
    setError(null);
    try {
      await onAdd({ name: name.trim(), description: description.trim() });
      setName('');
      setDescription('');
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
        The backend tags each resource with a sentiment and priority on save.
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
