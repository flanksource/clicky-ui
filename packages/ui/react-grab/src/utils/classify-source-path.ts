// Derived from react-grab (MIT, Copyright (c) 2025 Aiden Bai): packages/react-grab/src/utils/classify-source-path.ts
import { isSourceFile } from "bippy/source";
import { resolvePackageName } from "./parse-package-name.js";

export interface SourcePathClassification {
  origin: "app" | "package" | "unknown";
  packageName: string | null;
}

export const classifySourcePath = (
  fileName: string | null | undefined,
): SourcePathClassification => {
  if (!fileName) return { origin: "unknown", packageName: null };

  const packageName = resolvePackageName(fileName);
  if (packageName) return { origin: "package", packageName };

  if (!isSourceFile(fileName)) return { origin: "unknown", packageName: null };

  return { origin: "app", packageName: null };
};
