// In-browser stand-in for the Express backend, used only by the static GitHub
// Pages demo (built with VITE_DEMO=true). It runs the same mock-AI logic
// client-side, so the hosted demo is fully interactive without a server.
// State lives in memory and resets on reload — same as the real in-memory store.

import type { CreateResourceInput, Resource, VibeCheck } from './api';
import { analyzeVibe, summarizeVibe } from './vibe';

const resources = new Map<string, Resource>();

function add(name: string, description: string): Resource {
  const { sentiment, priority } = analyzeVibe(description);
  const resource: Resource = {
    id: crypto.randomUUID(),
    name,
    description,
    sentiment,
    priority,
    createdAt: new Date().toISOString(),
  };
  resources.set(resource.id, resource);
  return resource;
}

// Seed a few resources so the demo lands on a populated, meaningful vibe check.
// Guarded by the demo flag so this side effect never runs in dev or under tests.
if (import.meta.env.VITE_DEMO === 'true') {
  add('Landing page redesign', 'Shipped the new hero section — looks clean and the whole team loves it.');
  add(
    'Checkout payment bug',
    'Critical blocker: checkout crashes on Safari, customers are stuck — needs a fix urgently.',
  );
  add(
    'User onboarding flow',
    'Working on the new onboarding; making steady progress, just a few rough edges left to polish.',
  );
}

// A touch of artificial latency so the UI's loading states are visible in the demo.
const tick = (): Promise<void> => new Promise((resolve) => setTimeout(resolve, 120));

export async function getResources(): Promise<Resource[]> {
  await tick();
  return [...resources.values()];
}

export async function getVibeCheck(): Promise<VibeCheck> {
  await tick();
  return summarizeVibe([...resources.values()]);
}

export async function createResource(input: CreateResourceInput): Promise<Resource> {
  await tick();
  const name = input.name.trim();
  const description = input.description.trim();
  if (!name || !description) {
    throw new Error('Name and description are required.');
  }
  return add(name, description);
}

export async function deleteResource(id: string): Promise<void> {
  await tick();
  if (!resources.delete(id)) {
    throw new Error('Resource not found.');
  }
}
