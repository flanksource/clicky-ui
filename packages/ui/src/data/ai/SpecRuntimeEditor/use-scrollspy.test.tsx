import { fireEvent, render, screen, act } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useScrollSpy } from "./use-scrollspy";

function Harness({ ids }: { ids: string[] }) {
  const { activeId, sectionRef, onNavClick } = useScrollSpy(ids);
  return (
    <div>
      {ids.map((id) => (
        <button key={id} type="button" onClick={() => onNavClick(id)}>
          {`nav-${id}`}
        </button>
      ))}
      <output>{activeId}</output>
      {ids.map((id) => (
        <section key={id} id={id} ref={sectionRef(id)} />
      ))}
    </div>
  );
}

type IOCallback = (entries: Array<Partial<IntersectionObserverEntry>>) => void;

class MockIntersectionObserver {
  static callback: IOCallback | undefined;
  static observed: Element[] = [];
  constructor(callback: IOCallback) {
    MockIntersectionObserver.callback = callback;
  }
  observe(element: Element) {
    MockIntersectionObserver.observed.push(element);
  }
  unobserve() {}
  disconnect() {}
}

afterEach(() => {
  vi.unstubAllGlobals();
  MockIntersectionObserver.callback = undefined;
  MockIntersectionObserver.observed = [];
});

describe("useScrollSpy", () => {
  it("tracks the intersecting section via IntersectionObserver", () => {
    vi.stubGlobal("IntersectionObserver", MockIntersectionObserver);
    render(<Harness ids={["one", "two"]} />);

    expect(screen.getByRole("status")).toHaveTextContent("one");
    expect(MockIntersectionObserver.observed).toHaveLength(2);

    act(() => {
      MockIntersectionObserver.callback?.([
        { isIntersecting: true, target: document.getElementById("two")! },
      ]);
    });
    expect(screen.getByRole("status")).toHaveTextContent("two");
  });

  it("suppresses observer flicker right after a nav click", () => {
    vi.stubGlobal("IntersectionObserver", MockIntersectionObserver);
    render(<Harness ids={["one", "two", "three"]} />);

    fireEvent.click(screen.getByRole("button", { name: "nav-three" }));
    expect(screen.getByRole("status")).toHaveTextContent("three");

    act(() => {
      MockIntersectionObserver.callback?.([
        { isIntersecting: true, target: document.getElementById("two")! },
      ]);
    });
    expect(screen.getByRole("status")).toHaveTextContent("three");
  });

  it("falls back to click-driven state without IntersectionObserver", () => {
    vi.stubGlobal("IntersectionObserver", undefined);
    render(<Harness ids={["one", "two"]} />);

    expect(screen.getByRole("status")).toHaveTextContent("one");
    fireEvent.click(screen.getByRole("button", { name: "nav-two" }));
    expect(screen.getByRole("status")).toHaveTextContent("two");
  });
});
