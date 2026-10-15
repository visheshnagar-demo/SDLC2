import "@testing-library/jest-dom";

global.ResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Polyfill localStorage if needed
if (typeof window !== "undefined" && !window.localStorage) {
  let store = {};
  const mockStorage = {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => {
      store[key] = String(value);
    },
    removeItem: (key) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
  Object.defineProperty(window, "localStorage", { value: mockStorage });
  Object.defineProperty(global, "localStorage", { value: mockStorage });
}

// Mock window.matchMedia if needed in jsdom
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {},
  }),
});
