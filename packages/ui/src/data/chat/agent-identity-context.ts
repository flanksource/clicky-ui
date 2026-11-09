import { createContext } from "react";
export type AgentIdentityMetadata = { model?: string; provider?: string; effort?: string };
export const AgentIdentityContext = createContext<Record<string, AgentIdentityMetadata>>({});
