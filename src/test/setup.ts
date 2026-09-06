import "@testing-library/jest-dom";
import { vi } from "vitest";

// Mock window.matchMedia for next-themes
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock ResizeObserver — stores the callback and fires it when observe is called
class ResizeObserverMock {
  private callback: ResizeObserverCallback;
  private observed: Element[] = [];
  constructor(callback: ResizeObserverCallback) {
    this.callback = callback;
  }
  observe = vi.fn((target: Element) => {
    this.observed.push(target);
    // Fire callback immediately with mock dimensions
    const entry = [{ contentRect: { width: 1200, height: 800, top: 0, left: 0, bottom: 800, right: 1200 } }] as unknown as ResizeObserverEntry[];
    this.callback(entry, this as unknown as ResizeObserver);
  });
  unobserve = vi.fn();
  disconnect = vi.fn();
}
window.ResizeObserver = ResizeObserverMock as unknown as typeof ResizeObserver;

// Mock getBoundingClientRect to return reasonable dimensions
const originalGetBCR = Element.prototype.getBoundingClientRect;
Element.prototype.getBoundingClientRect = function () {
  const result = originalGetBCR.call(this);
  if (result.width === 0 && result.height === 0) {
    return { ...result, width: 1200, height: 800, top: 0, left: 0, bottom: 800, right: 1200 };
  }
  return result;
};

// Mock crypto.randomUUID with a typed return
let counter = 0;
if (!globalThis.crypto?.randomUUID) {
  Object.defineProperty(globalThis, "crypto", {
    value: {
      randomUUID: (): `${string}-${string}-${string}-${string}-${string}` => {
        counter += 1;
        return `00000000-0000-4000-8000-00000000000${counter}` as `${string}-${string}-${string}-${string}-${string}`;
      },
    },
  });
}
