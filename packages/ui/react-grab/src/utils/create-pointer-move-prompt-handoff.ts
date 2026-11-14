// Derived from react-grab (MIT, Copyright (c) 2025 Aiden Bai): packages/react-grab/src/utils/create-pointer-move-prompt-handoff.ts
interface PointerMovePromptHandoff {
  arm: () => void;
  clear: () => void;
  consume: () => boolean;
}

export const createPointerMovePromptHandoff = (): PointerMovePromptHandoff => {
  let isArmed = false;

  const consume = (): boolean => {
    if (!isArmed) return false;
    isArmed = false;
    return true;
  };

  return {
    arm: () => {
      isArmed = true;
    },
    clear: () => {
      isArmed = false;
    },
    consume,
  };
};
