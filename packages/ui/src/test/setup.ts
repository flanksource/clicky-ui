import "@testing-library/jest-dom/vitest";

if (typeof window !== "undefined") {
  installStorageShimIfNeeded();
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
