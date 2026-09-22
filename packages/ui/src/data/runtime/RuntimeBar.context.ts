import { createContext } from "react";

export const RuntimeBarVariantContext = createContext<"combo" | "segmented">(
  "segmented",
);
