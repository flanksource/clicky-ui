import "@testing-library/jest-dom/vitest";

if (typeof window !== "undefined") {
  installStorageShimIfNeeded();
}

// jsdom ships no IntersectionObserver, and every scroll-driven surface — the
// DataTable's reveal window and its server-driven infinite sentinel — attaches
// one the moment it has more rows to offer. The stub never fires: a test that
// wants the next page drives the load-more handle directly, which is the seam
// the observer would have called anyway.
if (typeof window !== "undefined" && !("IntersectionObserver" in window)) {
  class NoopIntersectionObserver implements IntersectionObserver {
    readonly root = null;
    readonly rootMargin = "";
    readonly thresholds: ReadonlyArray<number> = [];
    disconnect() {}
    observe() {}
    unobserve() {}
    takeRecords(): IntersectionObserverEntry[] {
      return [];
    }
  }
  window.IntersectionObserver = NoopIntersectionObserver;
  globalThis.IntersectionObserver = NoopIntersectionObserver;
}

if (typeof window !== "undefined" && !window.matchMedia) {
  window.matchMedia = (query: string) =>
    ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    }) as MediaQueryList;
}

function installStorageShimIfNeeded() {
  const storage = getUsableStorage();
  if (storage) {
    defineStorage(storage);
    return;
  }
  defineStorage(createMemoryStorage());
}

function getUsableStorage(): Storage | undefined {
  try {
    const storage = window.localStorage;
    if (
      typeof storage?.getItem === "function" &&
      typeof storage.setItem === "function" &&
      typeof storage.removeItem === "function" &&
      typeof storage.clear === "function"
    ) {
      return storage;
    }
  } catch {
    return undefined;
  }
  return undefined;
}

function defineStorage(storage: Storage) {
  Object.defineProperty(window, "localStorage", {
    configurable: true,
    value: storage,
  });
  Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    value: storage,
  });
}

function createMemoryStorage(): Storage {
  const values = new Map<string, string>();
  return {
    get length() {
      return values.size;
    },
    clear: () => values.clear(),
    getItem: (key) => values.get(key) ?? null,
    key: (index) => Array.from(values.keys())[index] ?? null,
    removeItem: (key) => {
      values.delete(key);
    },
    setItem: (key, value) => values.set(key, value),
  };
}
