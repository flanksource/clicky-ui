// Derived from react-grab (MIT, Copyright (c) 2025 Aiden Bai): packages/react-grab/src/utils/generate-snippet.ts
import { formatElementInfo, type StackContextOptions } from "../core/context.js";

export const generateSnippet = async (
  elements: Element[],
  options: StackContextOptions = {},
): Promise<string[]> => {
  const elementSnippetResults = await Promise.allSettled(
    elements.map((element) => formatElementInfo(element, options)),
  );
  return elementSnippetResults.map((result) => (result.status === "fulfilled" ? result.value : ""));
};
