// Derived from react-grab (MIT, Copyright (c) 2025 Aiden Bai): packages/react-grab/src/utils/format-component-name-lines.ts
export const formatComponentNameLines = (componentNames: string[]): string =>
  componentNames.map((componentName) => `\n  in ${componentName}`).join("");
