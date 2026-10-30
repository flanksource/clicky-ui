// jsdom has no CSS namespace; browsers all ship CSS.escape, which comment
// anchors and @medv/finder use to quote ids and attribute values. This is
// Mathias Bynens' spec-conformant polyfill, installed only when missing.
import "css.escape";

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

// jsdom under the vmThreads pool exposes no web streams, and anything importing
// `@flanksource/clicky-ui/ai` loads the AI SDK, whose eventsource-parser builds a
// TransformStream at module load. Node ships the same WHATWG implementation.
if (typeof globalThis.TransformStream === "undefined") {
  const streams = await import("node:stream/web");
  Object.assign(globalThis, {
    TransformStream: streams.TransformStream,
    ReadableStream: streams.ReadableStream,
    WritableStream: streams.WritableStream,
    TextDecoderStream: streams.TextDecoderStream,
    TextEncoderStream: streams.TextEncoderStream,
  });
}
