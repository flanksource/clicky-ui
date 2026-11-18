// Derived from react-grab (MIT, Copyright (c) 2025 Aiden Bai): packages/react-grab/src/utils/is-next-project-runtime.ts
let cachedIsNextProject: boolean | undefined;

export const isNextProjectRuntime = (shouldRevalidate?: boolean): boolean => {
  if (shouldRevalidate) {
    cachedIsNextProject = undefined;
  }
  cachedIsNextProject ??=
    typeof document !== "undefined" &&
    Boolean(document.getElementById("__NEXT_DATA__") || document.querySelector("nextjs-portal"));
  return cachedIsNextProject;
};
