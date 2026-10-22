import "@testing-library/jest-dom";

// Global ResizeObserver mock for jsdom / chart testing
global.ResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Global matchMedia mock
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

// Global scrollTo mock
window.scrollTo = () => {};
