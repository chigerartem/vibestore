import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';
import type { Resource, VibeCheck } from './lib/api';

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

const emptyVibe: VibeCheck = {
  total: 0,
  sentimentCounts: { positive: 0, neutral: 0, negative: 0 },
  priorityCounts: { low: 0, medium: 0, high: 0 },
  status: 'Quiet',
  headline: 'No resources logged yet — add one to get a vibe check.',
};

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('App', () => {
  it('renders the form and the empty state on load', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn((input: string) => {
        if (String(input).endsWith('/api/vibe-check')) {
          return Promise.resolve(jsonResponse(emptyVibe));
        }
        return Promise.resolve(jsonResponse([]));
      }),
    );

    render(<App />);

    expect(screen.getByRole('heading', { name: /vibestore/i, level: 1 })).toBeInTheDocument();
    expect(screen.getByLabelText(/resource name/i)).toBeInTheDocument();
    expect(await screen.findByText(/no resources yet/i)).toBeInTheDocument();
  });

  it('submits the form and shows the created resource in the list', async () => {
    const created: Resource = {
      id: 'r1',
      name: 'Checkout service',
      description: 'shipped a clean launch',
      sentiment: 'positive',
      priority: 'low',
      createdAt: new Date().toISOString(),
    };

    // Mirror the backend: the list is empty until the POST lands, then it has the resource.
    let createdYet = false;
    const fetchMock = vi.fn((input: string, init?: RequestInit) => {
      const url = String(input);
      if (url.endsWith('/api/resources') && init?.method === 'POST') {
        createdYet = true;
        return Promise.resolve(jsonResponse(created, 201));
      }
      if (url.endsWith('/api/resources')) {
        return Promise.resolve(jsonResponse(createdYet ? [created] : []));
      }
      return Promise.resolve(
        jsonResponse(createdYet ? { ...emptyVibe, total: 1, status: 'Buzzing' } : emptyVibe),
      );
    });
    vi.stubGlobal('fetch', fetchMock);

    const user = userEvent.setup();
    render(<App />);

    await user.type(screen.getByLabelText(/resource name/i), 'Checkout service');
    await user.type(screen.getByLabelText(/description/i), 'shipped a clean launch');
    await user.click(screen.getByRole('button', { name: /add resource/i }));

    expect(await screen.findByText('Checkout service')).toBeInTheDocument();
    expect(screen.getByText('shipped a clean launch')).toBeInTheDocument();

    // POST carries exactly the typed values — the backend tags sentiment + priority itself.
    const postCall = fetchMock.mock.calls.find(([, init]) => init?.method === 'POST');
    expect(postCall).toBeTruthy();
    expect(JSON.parse(postCall![1]!.body as string)).toEqual({
      name: 'Checkout service',
      description: 'shipped a clean launch',
    });
  });

  it('deletes a resource when its delete button is clicked', async () => {
    const created: Resource = {
      id: 'r1',
      name: 'Old service',
      description: 'no longer needed',
      sentiment: 'neutral',
      priority: 'low',
      createdAt: new Date().toISOString(),
    };

    let deleted = false;
    const fetchMock = vi.fn((input: string, init?: RequestInit) => {
      const url = String(input);
      if (init?.method === 'DELETE') {
        deleted = true;
        return Promise.resolve(new Response(null, { status: 204 }));
      }
      if (url.endsWith('/api/resources')) {
        return Promise.resolve(jsonResponse(deleted ? [] : [created]));
      }
      return Promise.resolve(jsonResponse(emptyVibe));
    });
    vi.stubGlobal('fetch', fetchMock);

    const user = userEvent.setup();
    render(<App />);

    expect(await screen.findByText('Old service')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /delete old service/i }));

    await waitFor(() => {
      expect(screen.queryByText('Old service')).not.toBeInTheDocument();
    });
    expect(fetchMock.mock.calls.some(([, init]) => init?.method === 'DELETE')).toBe(true);
  });
});
