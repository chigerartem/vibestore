// The only module that talks to the backend. All calls target /api/* —
// Vite proxies them to the Express server in dev.

export type Sentiment = 'positive' | 'neutral' | 'negative';
export type Priority = 'low' | 'medium' | 'high';

export interface Resource {
  id: string;
  name: string;
  description: string;
  sentiment: Sentiment;
  priority: Priority;
  createdAt: string;
}

export interface VibeCheck {
  total: number;
  sentimentCounts: Record<Sentiment, number>;
  priorityCounts: Record<Priority, number>;
  status: 'Quiet' | 'Buzzing' | 'Steady' | 'Needs attention';
  headline: string;
}

export interface CreateResourceInput {
  name: string;
  description: string;
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`/api${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(body.error ?? `Request failed: ${res.status}`);
  }

  return res.json() as Promise<T>;
}

export function getResources(): Promise<Resource[]> {
  return request<Resource[]>('/resources');
}

export function getVibeCheck(): Promise<VibeCheck> {
  return request<VibeCheck>('/vibe-check');
}

export function createResource(input: CreateResourceInput): Promise<Resource> {
  return request<Resource>('/resources', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}
