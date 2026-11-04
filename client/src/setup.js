import '@testing-library/jest-dom';

// jsdom does not implement ResizeObserver (used by chart libs like Recharts).
global.ResizeObserver = class { observe() {} unobserve() {} disconnect() {} };

// jsdom does not implement matchMedia (used by some responsive UI libs).
if (typeof window !== 'undefined' && !window.matchMedia) {
  window.matchMedia = (query) => ({
    matches: false, media: query, onchange: null,
    addListener() {}, removeListener() {},
    addEventListener() {}, removeEventListener() {}, dispatchEvent() { return false; },
  });
}
