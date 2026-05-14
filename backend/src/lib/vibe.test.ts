import { describe, it, expect } from 'vitest';
import { analyzeVibe, summarizeVibe, type VibeAnalysis } from './vibe';

describe('analyzeVibe', () => {
  describe('sentiment', () => {
    it('is positive when positive keywords dominate', () => {
      expect(analyzeVibe('We shipped a clean, solid launch').sentiment).toBe('positive');
    });

    it('is negative when negative keywords dominate', () => {
      expect(analyzeVibe('The build is broken and crashed with errors').sentiment).toBe('negative');
    });

    it('is neutral when there are no sentiment keywords', () => {
      expect(analyzeVibe('A standard internal planning note').sentiment).toBe('neutral');
    });

    it('is neutral when positive and negative keywords balance out', () => {
      expect(analyzeVibe('one win but also one bug').sentiment).toBe('neutral');
    });

    it('matches keywords whole-word, not as substrings', () => {
      // "winner" contains "win" — it should not count as a positive keyword.
      expect(analyzeVibe('knowledge shared by a winner').sentiment).toBe('neutral');
    });
  });

  describe('priority', () => {
    it('is low for a short description with no urgency', () => {
      expect(analyzeVibe('quick note').priority).toBe('low');
    });

    it('is medium for a moderately long description (>80 chars)', () => {
      expect(analyzeVibe('a'.repeat(120)).priority).toBe('medium');
    });

    it('is high for a very long description (>200 chars)', () => {
      expect(analyzeVibe('a'.repeat(240)).priority).toBe('high');
    });

    it('is high when an urgency keyword is present, regardless of length', () => {
      expect(analyzeVibe('urgent').priority).toBe('high');
    });
  });

  it('handles a description with no letters at all', () => {
    expect(analyzeVibe('12345 !!! ---')).toEqual({ sentiment: 'neutral', priority: 'low' });
  });
});

describe('summarizeVibe', () => {
  it('reports Quiet status and an empty headline for no resources', () => {
    const result = summarizeVibe([]);
    expect(result.total).toBe(0);
    expect(result.status).toBe('Quiet');
    expect(result.sentimentCounts).toEqual({ positive: 0, neutral: 0, negative: 0 });
    expect(result.priorityCounts).toEqual({ low: 0, medium: 0, high: 0 });
    expect(result.headline).toMatch(/no resources/i);
  });

  it('reports Buzzing when positive resources dominate, with correct counts', () => {
    const resources: VibeAnalysis[] = [
      { sentiment: 'positive', priority: 'low' },
      { sentiment: 'positive', priority: 'high' },
      { sentiment: 'negative', priority: 'medium' },
    ];
    const result = summarizeVibe(resources);
    expect(result.status).toBe('Buzzing');
    expect(result.sentimentCounts).toEqual({ positive: 2, neutral: 0, negative: 1 });
    expect(result.priorityCounts).toEqual({ low: 1, medium: 1, high: 1 });
  });

  it('reports Needs attention when negative resources dominate', () => {
    const resources: VibeAnalysis[] = [
      { sentiment: 'negative', priority: 'high' },
      { sentiment: 'negative', priority: 'high' },
      { sentiment: 'positive', priority: 'low' },
    ];
    expect(summarizeVibe(resources).status).toBe('Needs attention');
  });

  it('reports Steady when positive and negative are tied', () => {
    const resources: VibeAnalysis[] = [
      { sentiment: 'positive', priority: 'low' },
      { sentiment: 'negative', priority: 'low' },
      { sentiment: 'neutral', priority: 'low' },
    ];
    expect(summarizeVibe(resources).status).toBe('Steady');
  });

  it('counts the total and surfaces it in the headline', () => {
    const result = summarizeVibe([
      { sentiment: 'neutral', priority: 'low' },
      { sentiment: 'neutral', priority: 'low' },
    ]);
    expect(result.total).toBe(2);
    expect(result.headline).toContain('2 resources');
  });
});
