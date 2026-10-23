import { describe, expect, it, vi } from "vitest";
import { registerFindingsLanguages, type FindingsLanguages } from "./findings-languages";

vi.mock("monaco-editor", async () => (await import("../test/monaco-core.test-utils")).monacoCoreStub);
import { FINDINGS_LANGUAGE_IDS } from "./monaco-language";

function fakeLanguages() {
  const registered: string[] = [];
  const languages = {
    getLanguages: vi.fn(() => registered.map((id) => ({ id }))),
    register: vi.fn((language: { id: string }) => void registered.push(language.id)),
    setMonarchTokensProvider: vi.fn(),
    setLanguageConfiguration: vi.fn(),
  };
  return { languages: languages as unknown as FindingsLanguages, spies: languages, registered };
}

describe("registerFindingsLanguages", () => {
  it("registers every highlight-only language with a Monarch tokenizer and a language configuration", () => {
    const { languages, spies, registered } = fakeLanguages();

    registerFindingsLanguages(languages);

    expect(registered).toEqual([...FINDINGS_LANGUAGE_IDS]);
    expect(spies.setMonarchTokensProvider.mock.calls.map(([id]) => id)).toEqual([...FINDINGS_LANGUAGE_IDS]);
    expect(spies.setLanguageConfiguration.mock.calls.map(([id]) => id)).toEqual([...FINDINGS_LANGUAGE_IDS]);
    for (const [, tokenizer] of spies.setMonarchTokensProvider.mock.calls) {
      expect(tokenizer).toEqual(expect.objectContaining({ tokenizer: expect.any(Object) }));
    }
  });

  it("registers nothing a second time, even for a new call with the same Monaco", () => {
    const { languages, spies } = fakeLanguages();

    registerFindingsLanguages(languages);
    registerFindingsLanguages(languages);

    expect(spies.register).toHaveBeenCalledTimes(FINDINGS_LANGUAGE_IDS.length);
    expect(spies.setMonarchTokensProvider).toHaveBeenCalledTimes(FINDINGS_LANGUAGE_IDS.length);
    expect(spies.setLanguageConfiguration).toHaveBeenCalledTimes(FINDINGS_LANGUAGE_IDS.length);
  });

  it("only fills in the languages a host has not already registered under those ids", () => {
    const { languages, spies, registered } = fakeLanguages();
    registered.push("findings-css");

    registerFindingsLanguages(languages);

    expect(spies.register).not.toHaveBeenCalledWith(expect.objectContaining({ id: "findings-css" }));
    expect(spies.register).toHaveBeenCalledTimes(FINDINGS_LANGUAGE_IDS.length - 1);
  });
});
