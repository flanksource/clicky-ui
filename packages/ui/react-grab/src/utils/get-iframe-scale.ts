// Derived from react-grab (MIT, Copyright (c) 2025 Aiden Bai): packages/react-grab/src/utils/get-iframe-scale.ts
export const getIframeScale = (renderedSize: number, layoutSize: number): number =>
  layoutSize > 0 ? renderedSize / layoutSize : 1;
