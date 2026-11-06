// Derived from react-grab (MIT, Copyright (c) 2025 Aiden Bai): packages/react-grab/src/utils/strip-internal-attributes.ts
export const isInternalAttribute = (name: string): boolean => name.startsWith("data-react-grab-");
