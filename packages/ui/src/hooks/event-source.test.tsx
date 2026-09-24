import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useEventSourceFactory, type EventSourceFactory, type EventSourceLike } from "./event-source";
import { EventSourceProvider } from "./event-source-provider";

// A stand-in for the DOM EventSource, used only to observe what the default
// factory constructs — real network behavior is exercised by the SSE hooks'
// own tests.
class StubEventSource {
  static instances: StubEventSource[] = [];
  constructor(public url: string) {
    StubEventSource.instances.push(this);
  }
}

function FactoryProbe({ url }: { url: string }) {
  const factory = useEventSourceFactory();
  const source = factory(url);
  return <span data-testid="source-url">{source.url}</span>;
}

describe("useEventSourceFactory", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    StubEventSource.instances = [];
  });

  it("without a provider, constructs the global EventSource with the given URL", () => {
    vi.stubGlobal("EventSource", StubEventSource as unknown as typeof EventSource);

    render(<FactoryProbe url="https://example.test/stream" />);

    expect(StubEventSource.instances).toHaveLength(1);
    expect(StubEventSource.instances[0]?.url).toBe("https://example.test/stream");
    expect(screen.getByTestId("source-url")).toHaveTextContent("https://example.test/stream");
  });

  it("under a provider, calls the injected factory instead of the global EventSource", () => {
    vi.stubGlobal("EventSource", StubEventSource as unknown as typeof EventSource);
    const calls: string[] = [];
    const customFactory: EventSourceFactory = (url) => {
      calls.push(url);
      const stub: EventSourceLike = {
        url,
        readyState: 1,
        onopen: null,
        onmessage: null,
        onerror: null,
        addEventListener: () => {},
        removeEventListener: () => {},
        close: () => {},
      };
      return stub;
    };

    render(
      <EventSourceProvider value={customFactory}>
        <FactoryProbe url="https://example.test/custom" />
      </EventSourceProvider>,
    );

    expect(calls).toEqual(["https://example.test/custom"]);
    expect(StubEventSource.instances).toHaveLength(0);
  });

  it("scopes the override to the provider's subtree, leaving siblings on the default", () => {
    vi.stubGlobal("EventSource", StubEventSource as unknown as typeof EventSource);
    const customFactory: EventSourceFactory = (url) => ({
      url,
      readyState: 1,
      onopen: null,
      onmessage: null,
      onerror: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      close: () => {},
    });

    render(
      <>
        <EventSourceProvider value={customFactory}>
          <FactoryProbe url="https://example.test/inside" />
        </EventSourceProvider>
        <FactoryProbe url="https://example.test/outside" />
      </>,
    );

    // The sibling outside the provider still went through the global
    // EventSource — the override never leaked past the provider's subtree.
    expect(StubEventSource.instances.map((i) => i.url)).toEqual(["https://example.test/outside"]);
  });
});
