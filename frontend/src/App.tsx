import { useEffect, useState } from 'react';
import { api } from './lib/api';

interface Health {
  status: string;
  timestamp: string;
}

export default function App() {
  const [health, setHealth] = useState<Health | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .get<Health>('/health')
      .then(setHealth)
      .catch((e: Error) => setError(e.message));
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-50 text-slate-900">
      <h1 className="text-3xl font-bold">ANVI Test Task</h1>
      <p className="text-slate-600">Scaffold ready — replace this with the task UI.</p>
      <div className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm shadow-sm">
        backend:{' '}
        {error ? (
          <span className="font-mono text-red-600">error — {error}</span>
        ) : health ? (
          <span className="font-mono text-green-600">{health.status}</span>
        ) : (
          <span className="font-mono text-slate-400">checking…</span>
        )}
      </div>
    </main>
  );
}
