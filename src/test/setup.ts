import '@testing-library/jest-dom';

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false, media: query, onchange: null,
    addListener: () => {}, removeListener: () => {},
    addEventListener: () => {}, removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
});

class MockIntersectionObserver {
  observe = () => {}; unobserve = () => {}; disconnect = () => {};
  root = null; rootMargin = ''; thresholds = [] as number[];
  takeRecords = () => [] as IntersectionObserverEntry[];
}
Object.defineProperty(window, 'IntersectionObserver', { writable: true, value: MockIntersectionObserver });

class MockResizeObserver {
  observe = () => {}; unobserve = () => {}; disconnect = () => {};
}
Object.defineProperty(window, 'ResizeObserver', { writable: true, value: MockResizeObserver });
