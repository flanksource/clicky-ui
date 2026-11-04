import { createContext, useContext } from "react";
export const SampleContext = createContext<string | null>(null);
export function useVocabularySample(name: string) {
  const sample = useContext(SampleContext);
  return sample === null || sample === name;
}
