import { createContext } from "react";
import type { PropertiesDensity } from "./Properties";

export const PropertiesContext = createContext<{
  depth: number;
  columns: string;
  density: PropertiesDensity;
} | null>(null);
