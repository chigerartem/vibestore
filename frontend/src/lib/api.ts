// The module the app talks to for data.
//
// Normal build: real HTTP calls to the Express backend at /api/* (Vite proxies in dev).
// Demo build (VITE_DEMO=true, for the static GitHub Pages demo): the same calls are
// served in-browser by ./demoApi, so the hosted demo is fully interactive with no server.

import * as demo from './demoApi';

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

  // 204 No Content (DELETE) — there is no body to parse.
  if (res.status === 204) {
    return undefined as T;
  }

  return res.json() as Promise<T>;
}

const DEMO = import.meta.env.VITE_DEMO === 'true';

function httpGetResources(): Promise<Resource[]> {
  return request<Resource[]>('/resources');
}

function httpGetVibeCheck(): Promise<VibeCheck> {
  return request<VibeCheck>('/vibe-check');
}

function httpCreateResource(input: CreateResourceInput): Promise<Resource> {
  return request<Resource>('/resources', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

function httpDeleteResource(id: string): Promise<void> {
  return request<void>(`/resources/${id}`, { method: 'DELETE' });
}

// In the static demo there is no backend — route every call to the in-browser stand-in.
export const getResources = DEMO ? demo.getResources : httpGetResources;
export const getVibeCheck = DEMO ? demo.getVibeCheck : httpGetVibeCheck;
export const createResource = DEMO ? demo.createResource : httpCreateResource;
export const deleteResource = DEMO ? demo.deleteResource : httpDeleteResource;
