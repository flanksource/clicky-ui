// Derived from react-grab (MIT, Copyright (c) 2025 Aiden Bai): packages/react-grab/src/utils/is-keyboard-event-composing.ts
import { IME_COMPOSING_KEY_CODE } from "../constants.js";

export const isKeyboardEventComposing = (event: KeyboardEvent): boolean =>
  event.isComposing || event.keyCode === IME_COMPOSING_KEY_CODE;
