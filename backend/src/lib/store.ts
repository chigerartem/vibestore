import { randomUUID } from 'node:crypto';

/**
 * In-memory store — the default for the test task: zero setup, resets on restart.
 * `Item` is a placeholder shape — replace `name` with the real fields from the task.
 *
 * Need persistence across restarts? Install better-sqlite3
 * (`npm install better-sqlite3 @types/better-sqlite3 -w backend` — installs in
 * seconds via a prebuilt binary) and back these methods with SQL; the interface stays the same.
 */

export interface Item {
  id: string;
  name: string;
  createdAt: string;
}

const items = new Map<string, Item>();

export const store = {
  list(): Item[] {
    return [...items.values()];
  },

  get(id: string): Item | undefined {
    return items.get(id);
  },

  create(data: { name: string }): Item {
    const item: Item = {
      id: randomUUID(),
      name: data.name,
      createdAt: new Date().toISOString(),
    };
    items.set(item.id, item);
    return item;
  },

  delete(id: string): boolean {
    return items.delete(id);
  },

  clear(): void {
    items.clear();
  },
};
