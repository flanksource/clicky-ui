import { browserProject } from "./browser-store";
import type { SourceProvider } from "./types";
import { STARTER } from "../starter";

export function bufferProvider(): SourceProvider {
  const key = "host-buffers";
  return {
    id: key, label: "Host buffers", saveLabel: "Save browser copy",
    read: async () => (await browserProject({ key })) ?? structuredClone(STARTER),
    save: async (project) => { await browserProject({ key, project }); },
    saveLocks: async (locks) => {
      const saved = (await browserProject({ key })) ?? structuredClone(STARTER);
      await browserProject({ key, project: { ...saved, locks } });
    },
  };
}
