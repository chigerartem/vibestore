import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from './App';

afterEach(() => {
  vi.unstubAllGlobals();
});

function mockFetchOk() {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ status: 'ok', timestamp: new Date().toISOString() }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    ),
  );
}

describe('App', () => {
  it('renders the heading', () => {
    mockFetchOk();
    render(<App />);
    expect(screen.getByRole('heading', { name: /anvi test task/i })).toBeInTheDocument();
  });

  it('shows backend status once the health check resolves', async () => {
    mockFetchOk();
    render(<App />);
    expect(await screen.findByText('ok')).toBeInTheDocument();
  });
});
