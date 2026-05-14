import '@testing-library/jest-dom/vitest';

// jsdom has no IntersectionObserver — provide a minimal stub so reveal-on-scroll
// components mount. Assigned directly (not via vi.stubGlobal) so it survives
// vi.unstubAllGlobals() between tests.
class MockIntersectionObserver {
  constructor(private readonly callback: IntersectionObserverCallback) {}

  observe(target: Element): void {
    this.callback(
      [{ isIntersecting: true, target } as IntersectionObserverEntry],
      this as unknown as IntersectionObserver,
    );
  }

  disconnect(): void {}
}

globalThis.IntersectionObserver = MockIntersectionObserver as unknown as typeof IntersectionObserver;
