// Derived from react-grab (MIT, Copyright (c) 2025 Aiden Bai): packages/react-grab/src/utils/is-numeric-query.ts
const NUMERIC_QUERY_PATTERN = /^-?\d*\.?\d+$/;

export const isNumericQuery = (query: string): boolean => NUMERIC_QUERY_PATTERN.test(query);
