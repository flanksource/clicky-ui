import { describe, expect, it } from "vitest";

import {
  folderCrumbs,
  folderEntries,
  joinFileValue,
  pickerOptions,
  searchFiles,
  splitFileValue,
} from "./file-picker-model";

const SEED = "apps/playground/src/prompt-runs/seed.ts";
const DIALOG = "apps/playground/src/prompt-runs/RunPromptDialog.tsx";
const README = "README.md";
const BUTTON = "packages/ui/src/components/button.tsx";
const FILES = [
  { path: SEED, status: "M" },
  { path: DIALOG, status: "??" },
  { path: README },
  { path: BUTTON },
];

describe("folderEntries", () => {
  it("lists a folder's subfolders with their file counts first, then its own files", () => {
    expect(folderEntries(FILES, "")).toEqual([
      { kind: "folder", path: "apps", name: "apps", count: 2 },
      { kind: "folder", path: "packages", name: "packages", count: 1 },
      { kind: "file", path: README, name: README },
    ]);
  });

  it("lists a nested folder's files with their git status", () => {
    expect(folderEntries(FILES, "apps/playground/src/prompt-runs")).toEqual([
      { kind: "file", path: DIALOG, name: "RunPromptDialog.tsx", status: "??" },
      { kind: "file", path: SEED, name: "seed.ts", status: "M" },
    ]);
  });
});

describe("folderCrumbs", () => {
  it.each([
    ["the root", "", [{ path: "", name: "All files" }]],
    [
      "a nested folder",
      "apps/playground",
      [
        { path: "", name: "All files" },
        { path: "apps", name: "apps" },
        { path: "apps/playground", name: "playground" },
      ],
    ],
  ])("walks from the root to %s", (_label, folder, expected) => {
    expect(folderCrumbs(folder)).toEqual(expected);
  });
});

describe("searchFiles", () => {
  it("needs every term somewhere in the path, case-insensitively", () => {
    expect(searchFiles(FILES, "PROMPT seed", 10)).toEqual({ matches: [FILES[0]], total: 1 });
  });

  it("ranks file-name hits first, then changed files, then shorter paths", () => {
    // Every name holds "ts"; the two changed files lead, shorter path first.
    expect(searchFiles(FILES, "ts", 10).matches.map((file) => file.path)).toEqual([SEED, DIALOG, BUTTON]);
    // "src" is only in folder names, so the name rule ties and git status decides.
    expect(searchFiles(FILES, "src", 10).matches.map((file) => file.path)).toEqual([SEED, DIALOG, BUTTON]);
    // "components" names a folder, "button" the file itself.
    expect(searchFiles(FILES, "button", 10).matches.map((file) => file.path)).toEqual([BUTTON]);
  });

  it("caps the matches but reports how many there were", () => {
    expect(searchFiles(FILES, "a", 2)).toEqual({ matches: expect.any(Array), total: 4 });
    expect(searchFiles(FILES, "a", 2).matches).toHaveLength(2);
  });

  it("matches nothing for a blank query", () => {
    expect(searchFiles(FILES, "  ", 10)).toEqual({ matches: [], total: 0 });
  });
});

describe("pickerOptions", () => {
  it("offers the element's own file, then git changes, before anything is typed", () => {
    expect(pickerOptions({ files: FILES, query: "", suggested: [SEED], selected: [], limit: 10 })).toEqual([
      { value: SEED, label: SEED, group: "This element" },
      { value: DIALOG, label: DIALOG, group: "Git changes", description: "??" },
    ]);
  });

  it("offers matches once something is typed, and keeps selected files so their chips have labels", () => {
    expect(pickerOptions({ files: FILES, query: "button", suggested: [], selected: [README], limit: 10 })).toEqual([
      { value: BUTTON, label: BUTTON, group: "Matches" },
      { value: README, label: README, group: "Selected" },
    ]);
  });
});

describe("file values", () => {
  it.each([
    ["a single path", SEED, [SEED]],
    ["space-separated paths", `${SEED}  ${README}`, [SEED, README]],
    ["an empty value", "", []],
  ])("splits %s", (_label, value, expected) => {
    expect(splitFileValue(value)).toEqual(expected);
  });

  it("joins paths with spaces, the way a CLI takes a file list", () => {
    expect(joinFileValue([SEED, README])).toBe(`${SEED} ${README}`);
  });
});
