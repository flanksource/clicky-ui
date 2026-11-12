// Derived from react-grab (MIT, Copyright (c) 2025 Aiden Bai): packages/react-grab/src/utils/format-color-label.ts
import { EDIT_TRANSPARENT_COLOR_HEX, EDIT_TRANSPARENT_COLOR_LABEL } from "../constants.js";

export const formatColorLabel = (colorValue: string): string =>
  colorValue.toLowerCase() === EDIT_TRANSPARENT_COLOR_HEX
    ? EDIT_TRANSPARENT_COLOR_LABEL
    : colorValue.toUpperCase();
