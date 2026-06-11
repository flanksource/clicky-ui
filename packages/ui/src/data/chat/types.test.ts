import { describe, expect, it } from "vitest";
import {
  isFilePart,
  isReasoningPart,
  suggestionLabel,
  suggestionPrompt,
  type Suggestion,
} from "./types";

describe("suggestion helpers", () => {
  it("uses a bare string as both label and prompt", () => {
    const s: Suggestion = "List all pods";
    expect(suggestionLabel(s)).toBe("List all pods");
    expect(suggestionPrompt(s)).toBe("List all pods");
  });

  it("separates label from prompt for the object form", () => {
    const s: Suggestion = { label: "Restart api", prompt: "Restart the api service now" };
    expect(suggestionLabel(s)).toBe("Restart api");
    expect(suggestionPrompt(s)).toBe("Restart the api service now");
  });
});

describe("part type guards", () => {
  it("identifies reasoning parts only", () => {
    expect(isReasoningPart({ type: "reasoning" })).toBe(true);
    expect(isReasoningPart({ type: "text" })).toBe(false);
  });

  it("identifies file parts only", () => {
    expect(isFilePart({ type: "file" })).toBe(true);
    expect(isFilePart({ type: "dynamic-tool" })).toBe(false);
  });
});
