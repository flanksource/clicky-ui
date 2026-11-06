// Derived from react-grab (MIT, Copyright (c) 2025 Aiden Bai): packages/react-grab/src/utils/is-numeric-draft-query.ts
const NUMERIC_DRAFT_QUERY_PATTERN = /^-?(?:\d+\.?|\d*\.\d*)?$/;

export const isNumericDraftQuery = (query: string): boolean =>
  NUMERIC_DRAFT_QUERY_PATTERN.test(query);
