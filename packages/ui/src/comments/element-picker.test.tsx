import { fireEvent, render, screen } from "@testing-library/react";
import { useRef } from "react";
import { describe, expect, it, vi } from "vitest";
import { elementLabel, useElementPicker } from "./element-picker";

function Harness({ onPick, accepts }: { onPick: (element: Element) => void; accepts?: (element: Element) => boolean }) {
  const root = useRef<HTMLDivElement>(null);
  const picker = useElementPicker({ root, onPick, ...(accepts ? { accepts } : {}) });
  return (
    <>
      <button type="button" onClick={() => picker.setPicking(!picker.picking)}>
        pick
      </button>
      <div ref={root} className="relative" {...picker.rootProps}>
        <button type="button">target</button>
        <a href="#elsewhere">outside</a>
        {picker.outline}
      </div>
    </>
  );
}

describe("useElementPicker", () => {
  it("lets clicks through until picking starts", () => {
    const onPick = vi.fn();
    const action = vi.fn();
    render(<Harness onPick={onPick} />);
    screen.getByRole("button", { name: "target" }).addEventListener("click", action);
    fireEvent.click(screen.getByRole("button", { name: "target" }));
    expect({ picked: onPick.mock.calls.length, acted: action.mock.calls.length }).toEqual({ picked: 0, acted: 1 });
  });

  it("outlines the hovered element and picks the next click instead of acting on it, then stops", () => {
    const onPick = vi.fn();
    const action = vi.fn();
    const { container } = render(<Harness onPick={onPick} />);
    const target = screen.getByRole("button", { name: "target" });
    target.addEventListener("click", action);
    fireEvent.click(screen.getByRole("button", { name: "pick" }));
    fireEvent.pointerOver(target);
    const outlined = container.querySelector("[data-element-outline]") !== null;
    fireEvent.click(target);
    fireEvent.click(target);
    expect({ outlined, picked: onPick.mock.calls, acted: action.mock.calls.length, outlineAfter: container.querySelector("[data-element-outline]") }).toEqual({
      outlined: true,
      picked: [[target]],
      acted: 1,
      outlineAfter: null,
    });
  });

  it("leaves clicks on elements it does not accept alone", () => {
    const onPick = vi.fn();
    render(<Harness onPick={onPick} accepts={(element) => element.localName === "button"} />);
    fireEvent.click(screen.getByRole("button", { name: "pick" }));
    fireEvent.click(screen.getByRole("link", { name: "outside" }));
    expect(onPick).not.toHaveBeenCalled();
  });

  it("names an element by its aria-label, else its text, else its tag", () => {
    const labelled = Object.assign(document.createElement("div"), { textContent: "ignored" });
    labelled.setAttribute("aria-label", "Save");
    const text = Object.assign(document.createElement("p"), { textContent: "  Hello  " });
    expect([elementLabel(labelled), elementLabel(text), elementLabel(document.createElement("hr"))]).toEqual(["Save", "Hello", "hr"]);
  });
});
