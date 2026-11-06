import { createHash } from "node:crypto";
import { describe, expect, it } from "vitest";
import { verifyForkFiles } from "../scripts/fork-integrity.js";

const license = "MIT License\nCopyright (c) 2025 Aiden Bai\n";
const sourcePath = "src/picker.ts";
const source = "export const picker = true;\n";
const changedSource = "// Attribution\n" + source;
const hash = (text: string) => createHash("sha256").update(text).digest("hex");

function fixture() {
  const upstream = new Map([["LICENSE", license], [sourcePath, source]]);
  return { upstream, local: new Map(upstream), changes: new Map<string, string>() };
}

describe("verifyForkFiles", () => {
  it("accepts identical upstream files", () => {
    expect(verifyForkFiles(fixture())).toBe(2);
  });

  it("accepts a change documented with the exact local SHA256", () => {
    const files = fixture();
    files.local.set(sourcePath, changedSource);
    files.changes.set(sourcePath, hash(changedSource));
    expect(verifyForkFiles(files)).toBe(2);
  });

  it.each([undefined, hash(source)])("rejects undocumented or stale changes (%s)", (digest) => {
    const files = fixture();
    files.local.set(sourcePath, changedSource);
    if (digest) files.changes.set(sourcePath, digest);
    expect(() => verifyForkFiles(files)).toThrow(sourcePath);
  });

  it("rejects license edits even when documented", () => {
    const files = fixture();
    files.local.set("LICENSE", changedSource);
    files.changes.set("LICENSE", hash(changedSource));
    expect(() => verifyForkFiles(files)).toThrow("LICENSE must match upstream verbatim");
  });

  it("rejects a missing imported file", () => {
    const files = fixture();
    files.local.delete(sourcePath);
    expect(() => verifyForkFiles(files)).toThrow(sourcePath);
  });

  it("rejects new undocumented source files", () => {
    const files = fixture();
    files.local.set("src/new.ts", source);
    expect(() => verifyForkFiles(files)).toThrow("src/new.ts");
  });
});
