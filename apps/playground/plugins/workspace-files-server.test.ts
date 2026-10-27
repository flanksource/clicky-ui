import { describe, expect, it } from "vitest";

import { parseStatus } from "./workspace-files-server";

describe("parseStatus", () => {
  it("maps each changed path to its status, skipping a rename's original path", () => {
    const output = [" M src/edited.tsx", "R  src/renamed.tsx", "src/original.tsx", "?? src/new.tsx", ""].join("\0");
    expect(Object.fromEntries(parseStatus(output))).toEqual({
      "src/edited.tsx": "M",
      "src/renamed.tsx": "R",
      "src/new.tsx": "??",
    });
  });
});
