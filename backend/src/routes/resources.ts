import { Router, type Request, type Response } from 'express';
import { z } from 'zod';
import { store } from '../lib/store';
import { analyzeVibe, summarizeVibe } from '../lib/vibe';

export const resourcesRouter = Router();

const createResourceSchema = z.object({
  name: z.string().trim().min(1, 'name is required').max(100, 'name must be 100 characters or fewer'),
  description: z
    .string()
    .trim()
    .min(1, 'description is required')
    .max(500, 'description must be 500 characters or fewer'),
  priority: z.enum(['low', 'medium', 'high']),
});

// POST /api/resources — validate, auto-tag sentiment, store with the chosen priority.
resourcesRouter.post('/resources', (req: Request, res: Response) => {
  const parsed = createResourceSchema.safeParse(req.body);
  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? 'Invalid request body';
    res.status(400).json({ error: message });
    return;
  }

  const { name, description, priority } = parsed.data;
  const sentiment = analyzeVibe(description);
  const resource = store.create({ name, description, sentiment, priority });
  res.status(201).json(resource);
});

// GET /api/resources — list everything logged so far.
resourcesRouter.get('/resources', (_req: Request, res: Response) => {
  res.json(store.list());
});

// DELETE /api/resources/:id — remove a resource.
resourcesRouter.delete('/resources/:id', (req: Request<{ id: string }>, res: Response) => {
  const deleted = store.delete(req.params.id);
  if (!deleted) {
    res.status(404).json({ error: 'Resource not found' });
    return;
  }
  res.status(204).end();
});

// GET /api/vibe-check — aggregate health across all resources.
resourcesRouter.get('/vibe-check', (_req: Request, res: Response) => {
  res.json(summarizeVibe(store.list()));
});
