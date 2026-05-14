import { useCallback, useEffect, useState } from 'react';
import {
  createResource,
  deleteResource,
  getResources,
  getVibeCheck,
  type CreateResourceInput,
  type Resource,
  type VibeCheck,
} from './lib/api';
import { ResourceForm } from './components/ResourceForm';
import { ResourceList } from './components/ResourceList';
import { VibeCheckPanel } from './components/VibeCheck';
import { Reveal } from './components/Reveal';

export default function App() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [vibeCheck, setVibeCheck] = useState<VibeCheck | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const [list, vibe] = await Promise.all([getResources(), getVibeCheck()]);
    setResources(list);
    setVibeCheck(vibe);
  }, []);

  useEffect(() => {
    refresh().catch((err: Error) => setLoadError(err.message));
  }, [refresh]);

  // Refetch list and vibe check together so they never drift out of sync.
  async function handleAdd(input: CreateResourceInput) {
    await createResource(input);
    await refresh();
  }

  const handleDelete = useCallback(
    (id: string) => {
      deleteResource(id)
        .then(refresh)
        .catch((err: Error) => setLoadError(err.message));
    },
    [refresh],
  );

  return (
    <main className="min-h-[100dvh] font-sans text-zinc-900">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-3.5">
          <div className="flex items-center gap-2">
            <span className="flex h-5 w-5 items-center justify-center rounded-md bg-zinc-900 text-white">
              <svg width="11" height="11" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                <circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.5" />
                <circle cx="6" cy="6" r="1.5" fill="currentColor" />
              </svg>
            </span>
            <h1 className="text-[15px] font-semibold tracking-tight">VibeStore</h1>
          </div>
          <span className="text-[13px] text-zinc-500">AI Resource Manager</span>
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-6 pt-8 pb-20">
        <Reveal>
          <p className="text-sm text-zinc-500">
            Log project resources and get an instant, AI-simulated read on where things stand.
          </p>
        </Reveal>

        {loadError && (
          <Reveal className="mt-4">
            <p
              role="alert"
              className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700"
            >
              Could not reach the backend — {loadError}
            </p>
          </Reveal>
        )}

        <div className="mt-5 space-y-5">
          <Reveal delay={60}>
            <VibeCheckPanel vibeCheck={vibeCheck} />
          </Reveal>

          <Reveal delay={120}>
            <ResourceForm onAdd={handleAdd} />
          </Reveal>

          <div>
            <Reveal delay={180}>
              <div className="mb-2.5 flex items-baseline gap-2">
                <h2 className="text-sm font-semibold text-zinc-900">Resources</h2>
                {resources.length > 0 && (
                  <span className="text-xs tabular-nums text-zinc-400">{resources.length}</span>
                )}
              </div>
            </Reveal>
            <ResourceList resources={resources} onDelete={handleDelete} />
          </div>
        </div>
      </div>
    </main>
  );
}
