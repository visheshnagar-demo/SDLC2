import "@testing-library/jest-dom";

// Global mock for ResizeObserver (not implemented in jsdom)
global.ResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
};
