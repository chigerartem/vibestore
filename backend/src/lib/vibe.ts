/**
 * Mock-AI "vibe" logic — the backend's stand-in for an AI summary service.
 *
 * Sentiment is derived automatically from the description (the "mock AI" tag).
 * Priority is chosen by the user on the form, so it is not computed here — it
 * just flows through onto the stored resource and into the aggregate counts.
 */

export type Sentiment = 'positive' | 'neutral' | 'negative';
export type Priority = 'low' | 'medium' | 'high';

export interface VibeAnalysis {
  sentiment: Sentiment;
  priority: Priority;
}

export interface VibeCheck {
  total: number;
  sentimentCounts: Record<Sentiment, number>;
  priorityCounts: Record<Priority, number>;
  status: 'Quiet' | 'Buzzing' | 'Steady' | 'Needs attention';
  headline: string;
}

const POSITIVE = new Set([
  'done', 'shipped', 'ship', 'launch', 'launched', 'great', 'love', 'win', 'wins',
  'success', 'improve', 'improved', 'fast', 'ready', 'complete', 'completed', 'smooth',
  'clean', 'solid', 'working', 'works', 'fixed', 'resolved', 'good', 'nice', 'excellent',
  'stable', 'polished', 'happy', 'progress', 'ahead', 'easy',
]);
const NEGATIVE = new Set([
  'bug', 'bugs', 'broken', 'blocked', 'blocker', 'fail', 'failed', 'crash', 'crashed',
  'error', 'errors', 'issue', 'issues', 'delay', 'delayed', 'risk', 'risky', 'stuck',
  'slow', 'messy', 'hard', 'problem', 'problems', 'urgent', 'critical', 'late', 'behind',
  'missing', 'confusing', 'unstable', 'regression', 'down',
]);

/** Tokenize into lowercase words so keyword matching is whole-word, not substring. */
function tokenize(text: string): string[] {
  return text.toLowerCase().match(/[a-z]+/g) ?? [];
}

/** Derive sentiment for a single resource description (the mock-AI tag). */
export function analyzeVibe(description: string): Sentiment {
  const words = tokenize(description);
  const positive = words.filter((w) => POSITIVE.has(w)).length;
  const negative = words.filter((w) => NEGATIVE.has(w)).length;

  return positive > negative ? 'positive' : negative > positive ? 'negative' : 'neutral';
}

/** Aggregate per-resource analyses into an overall project "vibe check". */
export function summarizeVibe(resources: readonly VibeAnalysis[]): VibeCheck {
  const sentimentCounts: Record<Sentiment, number> = { positive: 0, neutral: 0, negative: 0 };
  const priorityCounts: Record<Priority, number> = { low: 0, medium: 0, high: 0 };

  for (const r of resources) {
    sentimentCounts[r.sentiment] += 1;
    priorityCounts[r.priority] += 1;
  }

  const total = resources.length;
  const { positive, negative } = sentimentCounts;

  let status: VibeCheck['status'];
  if (total === 0) status = 'Quiet';
  else if (negative > positive) status = 'Needs attention';
  else if (positive > negative) status = 'Buzzing';
  else status = 'Steady';

  const headline =
    total === 0
      ? 'No resources logged yet — add one to get a vibe check.'
      : `${total} resource${total === 1 ? '' : 's'} logged · ` +
        `${positive} positive, ${negative} negative · ${priorityCounts.high} high-priority.`;

  return { total, sentimentCounts, priorityCounts, status, headline };
}
