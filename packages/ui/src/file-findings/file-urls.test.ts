import { describe, expect, it } from "vitest";
import { isImagePath, isRasterImagePath, relativeUrlPath, resolveRelativeFile } from "./file-urls";

describe("isImagePath", () => {
  it.each(["a.png", "dir/a.JPG", "a.jpeg", "a.gif", "a.webp", "logo.svg", "a.avif", "a.bmp", "favicon.ico"])("accepts %s", (path) => {
    expect(isImagePath(path)).toBe(true);
  });

  it.each(["a.md", "png", "a.png.txt", "a.svgz", "dir.png/readme"])("rejects %s", (path) => {
    expect(isImagePath(path)).toBe(false);
  });
});

describe("isRasterImagePath", () => {
  it("is an image that is not svg, since svg has a text source", () => {
    expect(isRasterImagePath("a.png")).toBe(true);
    expect(isRasterImagePath("a.SVG")).toBe(false);
    expect(isRasterImagePath("a.md")).toBe(false);
  });
});

describe("relativeUrlPath", () => {
  it.each([
    ["img/a.png", "img/a.png"],
    ["./img/a.png", "./img/a.png"],
    ["../img/a.png", "../img/a.png"],
    ["img/a.png?v=2#top", "img/a.png"],
    ["img/my%20pic.png", "img/my pic.png"],
  ])("returns the decoded path of %s", (url, expected) => {
    expect(relativeUrlPath(url)).toBe(expected);
  });

  it.each(["", "   ", "https://x.test/a.png", "http:a.png", "data:image/png;base64,AAAA", "blob:abc", "mailto:a@b.c", "//cdn.test/a.png", "/abs/a.png", "#frag", "?q=1"])(
    "is null for %j, which is not document-relative",
    (url) => {
      expect(relativeUrlPath(url)).toBeNull();
    },
  );
});

describe("resolveRelativeFile", () => {
  const from = { workDir: "/repo", file: "docs/guide.md" };

  it("joins the url onto the directory of the referencing file, keeping workDir", () => {
    expect(resolveRelativeFile(from, "img/a.png")).toEqual({ workDir: "/repo", file: "docs/img/a.png" });
    expect(resolveRelativeFile(from, "./img/a.png?x=1")).toEqual({ workDir: "/repo", file: "docs/img/a.png" });
  });

  it("normalizes .. segments without clamping an escape", () => {
    expect(resolveRelativeFile(from, "../assets/a.png")).toEqual({ workDir: "/repo", file: "assets/a.png" });
    expect(resolveRelativeFile(from, "../../a.png")).toEqual({ workDir: "/repo", file: "../a.png" });
  });

  it("resolves against the root for a top-level file", () => {
    expect(resolveRelativeFile({ workDir: "/repo", file: "README.md" }, "a.png")).toEqual({ workDir: "/repo", file: "a.png" });
  });

  it("omits workDir when the referencing file has none", () => {
    expect(resolveRelativeFile({ file: "docs/guide.md" }, "a.png")).toEqual({ file: "docs/a.png" });
  });

  it("is null for urls that are not document-relative", () => {
    expect(resolveRelativeFile(from, "https://x.test/a.png")).toBeNull();
    expect(resolveRelativeFile(from, "/abs.png")).toBeNull();
  });
});
