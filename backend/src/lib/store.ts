import { randomUUID } from 'node:crypto';
import type { Priority, Sentiment } from './vibe';

/**
 * In-memory store — per the task spec. Zero setup, resets on restart.
 * `clear()` exists so tests can isolate state between cases.
 */

export interface Resource {
  id: string;
  name: string;
  description: string;
  sentiment: Sentiment;
  priority: Priority;
  createdAt: string;
}

const resources = new Map<string, Resource>();

export const store = {
  list(): Resource[] {
    return [...resources.values()];
  },

  create(data: {
    name: string;
    description: string;
    sentiment: Sentiment;
    priority: Priority;
  }): Resource {
    const resource: Resource = {
      id: randomUUID(),
      name: data.name,
      description: data.description,
      sentiment: data.sentiment,
      priority: data.priority,
      createdAt: new Date().toISOString(),
    };
    resources.set(resource.id, resource);
    return resource;
  },

  clear(): void {
    resources.clear();
  },
};
