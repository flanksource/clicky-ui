// @vitest-environment jsdom

import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  DEFAULT_PAGE_SLUG,
  applyPageCreated,
  applyPageMoved,
  findPage,
} from "../registry";
import { PageApiError, movePage } from "./page-api";
import { usePageMoveDrag } from "./usePageMoveDrag";

vi.mock("./page-api", async (importOriginal) => ({
  ...(await importOriginal<typeof import("./page-api")>()),
  movePage: vi.fn(),
}));

const page = { key: DEFAULT_PAGE_SLUG, kind: "item" } as const;
const folder = { key: "trust", kind: "group" } as const;

function setup(activeSlug?: string) {
  const onNavigate = vi.fn();
  const view = renderHook(() =>
    usePageMoveDrag({
      disabled: false,
      ...(activeSlug !== undefined ? { activeSlug } : { activeSlug: undefined }),
      onNavigate,
    }),
  );
  return { ...view, onNavigate };
}

async function drop(view: ReturnType<typeof setup>) {
  await act(async () => {
    view.result.current.drag.onDrop(page, folder);
    await Promise.resolve();
  });
}

describe("dragging a page onto a folder", () => {
  beforeEach(() => vi.clearAllMocks());
  // The registry overlay is module state shared with the real nav, so each
  // test has to put the page back where it found it.
  afterEach(() => {
    applyPageCreated(DEFAULT_PAGE_SLUG);
    if (findPage(`trust/${DEFAULT_PAGE_SLUG}`)) {
      applyPageMoved(`trust/${DEFAULT_PAGE_SLUG}`, DEFAULT_PAGE_SLUG);
    }
  });

  it("moves the page and follows it when it is the one being read", async () => {
    vi.mocked(movePage).mockResolvedValue({
      slug: `trust/${DEFAULT_PAGE_SLUG}`,
      movedComments: 0,
      updatedReferences: 0,
      updatedFiles: 1,
    });
    const view = setup(DEFAULT_PAGE_SLUG);

    await drop(view);

    expect(movePage).toHaveBeenCalledWith({
      slug: DEFAULT_PAGE_SLUG,
      nextSlug: `trust/${DEFAULT_PAGE_SLUG}`,
    });
    expect(view.result.current.error).toBeNull();
    expect(findPage(`trust/${DEFAULT_PAGE_SLUG}`)).toBeDefined();
    expect(view.onNavigate).toHaveBeenCalledWith(`trust/${DEFAULT_PAGE_SLUG}`);
  });

  // Agents and editors write src/pages/ directly, and the dev server can still
  // be serving a glob that lists a file which is already gone. Leaving that row
  // in the nav means every later drag of it fails the same way.
  it("drops a row whose file is already gone rather than only complaining", async () => {
    vi.mocked(movePage).mockRejectedValue(
      new PageApiError(`page "${DEFAULT_PAGE_SLUG}" does not exist`, 404),
    );
    const view = setup(DEFAULT_PAGE_SLUG);

    await drop(view);

    expect(findPage(DEFAULT_PAGE_SLUG)).toBeUndefined();
    expect(view.result.current.error).toContain("no longer on disk");
    expect(view.onNavigate).toHaveBeenCalledWith(undefined);
  });

  it("keeps the row and reports a failure that is not a missing page", async () => {
    vi.mocked(movePage).mockRejectedValue(
      new PageApiError("destination already exists", 409),
    );
    const view = setup();

    await drop(view);

    expect(findPage(DEFAULT_PAGE_SLUG)).toBeDefined();
    expect(view.result.current.error).toBe("destination already exists");
  });

  it("refuses to pick up a row while filesystem actions are unavailable", () => {
    const { result } = renderHook(() =>
      usePageMoveDrag({
        disabled: true,
        activeSlug: undefined,
        onNavigate: vi.fn(),
      }),
    );

    expect(result.current.drag.canDrag?.(page)).toBe(false);
  });
});
