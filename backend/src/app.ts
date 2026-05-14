import express, { type Express, type Request, type Response, type NextFunction } from 'express';
import cors from 'cors';
import { healthRouter } from './routes/health';
import { resourcesRouter } from './routes/resources';

/**
 * Builds the Express app without starting a listener.
 * Tests import this directly so supertest can run against the app in-process.
 */
export function createApp(): Express {
  const app = express();

  app.use(cors());
  app.use(express.json());

  app.use('/api', healthRouter);
  app.use('/api', resourcesRouter);

  // 404 — no route matched
  app.use((_req: Request, res: Response) => {
    res.status(404).json({ error: 'Not found' });
  });

  // Error handler — Express 5 forwards thrown/async errors here automatically
  app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  });

  return app;
}
