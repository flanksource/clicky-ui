import { describe, expect, it } from "vitest";
import { RECENT_RUNTIME_LIMIT, recordRecentRuntimes, type AISpecRuntimeModel } from "./model";

const SONNET: AISpecRuntimeModel = { model: "claude-sonnet-4-6", mode: "agent", effort: "medium" };
const GPT: AISpecRuntimeModel = { model: "gpt-5.5", mode: "api" };
const GEMINI: AISpecRuntimeModel = { model: "gemini-3-pro", mode: "cli" };

describe("recordRecentRuntimes", () => {
  it.each([
    { name: "prepends newly used runtimes in run order", recent: [GEMINI], used: [SONNET, GPT], expected: [SONNET, GPT, GEMINI] },
    { name: "moves a reused runtime to the front instead of repeating it", recent: [GPT, SONNET], used: [{ ...SONNET }], expected: [SONNET, GPT] },
    { name: "treats a different effort as a different runtime", recent: [SONNET], used: [{ ...SONNET, effort: "high" }], expected: [{ ...SONNET, effort: "high" }, SONNET] },
    { name: "ignores rows that inherit both model and mode", recent: [GPT], used: [{}, { effort: "high" }], expected: [GPT] },
  ])("$name", ({ recent, used, expected }) => {
    expect(recordRecentRuntimes(recent, used)).toEqual(expected);
  });

  it(`keeps only the ${RECENT_RUNTIME_LIMIT} most recent runtimes`, () => {
    const older = Array.from({ length: RECENT_RUNTIME_LIMIT }, (_, index) => ({ model: `model-${index}` }));

    expect(recordRecentRuntimes(older, [GPT])).toEqual([GPT, ...older.slice(0, RECENT_RUNTIME_LIMIT - 1)]);
  });
});
