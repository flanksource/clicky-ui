import { describe, expect, it, vi } from "vitest";
import { createVocabularyPreviews } from "./previews";
import type { VocabularySnapshot } from "./types";

const catalog = { alias: "shapes", slug: "vocabularies/shapes", file: "shapes/index.tsx", page: "/shapes/index.tsx", instructions: "Read shapes as geometry.", previewRevision: "one" };
const item = { catalog: "shapes", type: "shape", id: "shape/decision", label: "Decision", description: "A decision", references: ["shapes/index.tsx"] };
const image = { id: item.id, image: "data:image/webp;base64,YQ==", width: 180, height: 90 };
const snapshot: VocabularySnapshot = { revision: "one", catalogs: [catalog], items: [item] };
const key = "clicky-playground.vocabulary-previews.shapes";

function setup(cached?: unknown) {
  const storage = { getItem: vi.fn(() => cached === undefined ? null : JSON.stringify(cached)), setItem: vi.fn(), removeItem: vi.fn() };
  const generate = vi.fn(async () => [image]);
  const store = createVocabularyPreviews({ storage: () => storage, generate });
  store.configure(snapshot);
  return { store, storage, generate };
}

describe("vocabulary preview cache", () => {
  it("uses a cache hit without generating", async () => {
    const { store, generate } = setup({ previewRevision: "one", images: { [item.id]: image } });
    await store.ensure("shapes");
    expect({ preview: store.preview(item), runs: generate.mock.calls.length }).toEqual({ preview: { status: "ready", image }, runs: 0 });
  });
  it("replaces a stale revision as a whole", async () => {
    const { store, storage, generate } = setup({ previewRevision: "old", images: { removed: image } });
    await store.ensure("shapes");
    expect(generate).toHaveBeenCalledTimes(1);
    expect(JSON.parse(storage.setItem.mock.calls[0]![1])).toEqual({ previewRevision: "one", images: { [item.id]: { image: image.image, width: 180, height: 90 } } });
  });
  it("shares one run across concurrent requests", async () => {
    const { store, generate } = setup();
    await Promise.all([store.ensure("shapes"), store.ensure("shapes"), store.ensure("shapes")]);
    expect(generate).toHaveBeenCalledTimes(1);
  });
  it("reports quota failure and retains images in memory", async () => {
    const { store, storage, generate } = setup();
    storage.setItem.mockImplementation(() => { throw new DOMException("Storage full", "QuotaExceededError"); });
    await store.ensure("shapes");
    await store.ensure("shapes");
    expect({ preview: store.preview(item), failures: store.failures(), runs: generate.mock.calls.length }).toEqual({ preview: { status: "ready", image }, failures: [{ alias: "shapes", message: "Preview cache unavailable: Storage full" }], runs: 1 });
  });
  it("reports a read error and still generates", async () => {
    const { store, storage } = setup();
    storage.getItem.mockImplementation(() => { throw new Error("Storage denied"); });
    await store.ensure("shapes");
    expect(store.failures()).toEqual([{ alias: "shapes", message: "Preview cache unavailable: Storage denied" }]);
    expect(storage.getItem).toHaveBeenCalledWith(key);
    expect(store.preview(item).status).toBe("ready");
  });
  it.each([
    { images: [], message: "shapes:shape/decision has no VocabularyPreview marker on shapes/index.tsx" },
    { images: [image, { ...image, id: "shape/extra" }], message: "shapes/index.tsx has undeclared VocabularyPreview markers: shape/extra" },
  ])("fails on marker mismatch: $message", async ({ images, message }) => {
    const { store, generate } = setup();
    generate.mockResolvedValue(images);
    await store.ensure("shapes");
    expect(store.preview(item)).toEqual({ status: "failed", error: message });
    expect(store.failures()).toEqual([{ alias: "shapes", message }]);
  });
  it("regenerates explicitly even after a cache hit", async () => {
    const { store, generate, storage } = setup({ previewRevision: "one", images: { [item.id]: image } });
    await store.ensure("shapes");
    await store.regenerate("shapes");
    expect(storage.removeItem).toHaveBeenCalledWith(key);
    expect(generate).toHaveBeenCalledTimes(1);
  });
  it("shares concurrent regeneration requests", async () => {
    const { store, generate } = setup();
    await store.ensure("shapes");
    await Promise.all([store.regenerate("shapes"), store.regenerate("shapes")]);
    expect(generate).toHaveBeenCalledTimes(2);
  });
  it("reports each missing marker by its own id while retaining captured items", async () => {
    const { store } = setup();
    const missing = ["shape/start", "shape/end"].map(id => ({ ...item, id }));
    store.configure({ ...snapshot, revision: "two", catalogs: [{ ...catalog, previewRevision: "two" }], items: [item, ...missing] });
    await store.ensure("shapes");
    expect(store.preview(item)).toEqual({ status: "ready", image });
    expect(missing.map(value => store.preview(value))).toEqual(missing.map(value => ({ status: "failed", error: `shapes:${value.id} has no VocabularyPreview marker on shapes/index.tsx` })));
    expect(store.failures()).toHaveLength(2);
  });
  it("waits for an older revision before generating a newer one", async () => {
    const { store, generate } = setup();
    let finish!: (images: typeof image[]) => void;
    generate.mockImplementationOnce(() => new Promise(resolve => { finish = resolve; }));
    const old = store.ensure("shapes");
    store.configure({ ...snapshot, revision: "two", catalogs: [{ ...catalog, previewRevision: "two" }] });
    const current = store.ensure("shapes");
    expect(generate).toHaveBeenCalledTimes(1);
    finish([image]);
    await Promise.all([old, current]);
    expect(generate).toHaveBeenCalledTimes(2);
    expect(store.preview(item)).toEqual({ status: "ready", image });
  });
});
