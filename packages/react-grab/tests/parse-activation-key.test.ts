// Derived from react-grab (MIT, Copyright (c) 2025 Aiden Bai): packages/react-grab/tests/parse-activation-key.test.ts
import { describe, expect, it } from "vitest";
import { parseActivationKey } from "../src/utils/parse-activation-key.js";

const createKeyboardEvent = (key = ""): KeyboardEvent =>
  Object.create(null, {
    key: {
      value: key,
    },
  });

describe("parseActivationKey", () => {
  it("treats exceptions from custom matchers as non-matches", () => {
    const matcher = parseActivationKey(() => {
      throw new Error("Malformed keyboard event");
    });

    expect(matcher(createKeyboardEvent())).toBe(false);
  });

  it("preserves custom matcher results", () => {
    const matcher = parseActivationKey((event) => event.key === "c");

    expect(matcher(createKeyboardEvent("c"))).toBe(true);
    expect(matcher(createKeyboardEvent("g"))).toBe(false);
  });
});
