import '@testing-library/jest-dom';

global.ResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
};

const localStorageMock = (() => {
  let store = {};
  return {
    getItem: (key) => (key in store ? store[key] : null),
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
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

if (typeof global.localStorage === 'undefined') {
  global.localStorage = localStorageMock;
}
