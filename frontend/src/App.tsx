import { useCallback, useEffect, useState } from 'react';
import {
  createResource,
  getResources,
  getVibeCheck,
  type CreateResourceInput,
  type Resource,
  type VibeCheck,
} from './lib/api';
import { ResourceForm } from './components/ResourceForm';
import { ResourceList } from './components/ResourceList';
import { VibeCheckPanel } from './components/VibeCheck';

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

  // Refetch both list and vibe check so they stay in sync after a create.
  async function handleAdd(input: CreateResourceInput) {
    await createResource(input);
    await refresh();
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <header>
          <h1 className="text-3xl font-bold tracking-tight">VibeStore</h1>
          <p className="mt-1 text-slate-600">
            Log project resources and get an instant vibe check on project health.
          </p>
        </header>

        {loadError && (
          <p role="alert" className="mt-6 rounded-lg bg-rose-50 px-4 py-3 text-sm text-rose-700">
            Could not reach the backend — {loadError}
          </p>
        )}

        <div className="mt-6 space-y-6">
          <VibeCheckPanel vibeCheck={vibeCheck} />
          <ResourceForm onAdd={handleAdd} />

          <section>
            <h2 className="mb-3 text-lg font-semibold text-slate-900">
              Resources{resources.length > 0 && ` (${resources.length})`}
            </h2>
            <ResourceList resources={resources} />
          </section>
        </div>
      </div>
    </main>
  );
}
