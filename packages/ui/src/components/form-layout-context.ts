import { createContext } from "react";
import type { LayoutEngine } from "./json-schema-form-extension-api";

// FormLayoutEnginesContext carries the layout engines a form's extensions
// registered down to FieldsGrid, so the container every group of rows renders
// into can swap to the active engine's Grid at any depth without each call site
// threading it.
export const FormLayoutEnginesContext = createContext<ReadonlyMap<string, LayoutEngine>>(new Map());
