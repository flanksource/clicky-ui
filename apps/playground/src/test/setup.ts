// jsdom implements no media queries, and clicky-ui's Modal asks for two on
// open (the mobile sheet breakpoint and reduced motion). Without this stub any
// test that opens a dialog dies on `window.matchMedia is not a function`.
if (typeof window !== "undefined" && !window.matchMedia) {
  window.matchMedia = (query: string) =>
    ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    }) as MediaQueryList;
}
