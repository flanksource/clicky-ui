import { afterEach, describe, expect, it, vi } from "vitest";

import {
  createFolder,
  deletePage,
  fetchFolders,
  movePage,
} from "./page-api";

function mockJson(payload: unknown, status = 200) {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue(
      new Response(JSON.stringify(payload), {
        status,
        headers: { "Content-Type": "application/json" },
      }),
    ),
  );
}

describe("playground page API", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("loads the visible folder list", async () => {
    mockJson({ folders: ["designs", "designs/drafts"] });

    await expect(fetchFolders()).resolves.toEqual(["designs", "designs/drafts"]);
    expect(fetch).toHaveBeenCalledWith("/__playground/sources", undefined);
  });

  it("creates a folder through the folder endpoint", async () => {
    mockJson({ folder: "designs/drafts" }, 201);

    await expect(createFolder("designs/drafts")).resolves.toEqual({
      folder: "designs/drafts",
    });
    expect(fetch).toHaveBeenCalledWith(
      "/__playground/sources/folders",
      expect.objectContaining({ method: "POST", body: '{"folder":"designs/drafts"}' }),
    );
  });

  it("moves and optionally retitles a page", async () => {
    const result = {
      slug: "designs/review",
      movedComments: 2,
      updatedReferences: 5,
      updatedFiles: 3,
    };
    mockJson(result);

    await expect(
      movePage({ slug: "review", nextSlug: "designs/review", title: "Design review" }),
    ).resolves.toEqual(result);
    expect(fetch).toHaveBeenCalledWith(
      "/__playground/sources",
      expect.objectContaining({
        method: "PATCH",
        body: '{"slug":"review","nextSlug":"designs/review","title":"Design review"}',
      }),
    );
  });

  it("deletes a page and reports its deleted feedback", async () => {
    mockJson({ slug: "review", deletedComments: 3 });

    await expect(deletePage("review")).resolves.toEqual({
      slug: "review",
      deletedComments: 3,
    });
    expect(fetch).toHaveBeenCalledWith(
      "/__playground/sources?slug=review",
      expect.objectContaining({ method: "DELETE" }),
    );
  });

  it("surfaces backend errors", async () => {
    mockJson({ error: 'page "review" already exists' }, 409);

    await expect(createFolder("review")).rejects.toThrow('page "review" already exists');
  });
});
