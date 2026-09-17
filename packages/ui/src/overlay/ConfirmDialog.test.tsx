import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, fireEvent, render, renderHook, screen } from "@testing-library/react";
import { useState } from "react";
import { ConfirmDialog, type ConfirmOptions } from "./ConfirmDialog";
import { useConfirm, useConfirmMemory } from "./useConfirm";
import { forgetConfirm, isConfirmRemembered } from "./confirmMemory";

const REMEMBER_KEY = "template-run:dev";
const STORAGE_KEY = `clicky-ui:confirm:${REMEMBER_KEY}`;

const OPTIONS: ConfirmOptions = {
  title: "Run template against dev?",
  warning: "Custom SQL functions may change data.",
  confirmLabel: "Run",
  remember: { key: REMEMBER_KEY, label: "Remember my choice for dev" },
};

function Harness({ options, onResult }: { options: ConfirmOptions; onResult: (ok: boolean) => void }) {
  const { confirm, dialog } = useConfirm();
  return (
    <>
      <button type="button" onClick={() => void confirm(options).then(onResult)}>
        ask
      </button>
      {dialog}
    </>
  );
}

function ask(options: ConfirmOptions = OPTIONS) {
  const onResult = vi.fn();
  const view = render(<Harness options={options} onResult={onResult} />);
  fireEvent.click(screen.getByRole("button", { name: "ask" }));
  return { onResult, view };
}

beforeEach(() => window.localStorage.clear());
afterEach(() => vi.restoreAllMocks());

describe("useConfirm", () => {
  it("resolves true and remembers the key when Run is confirmed with the box checked", async () => {
    const { onResult } = ask();
    expect(screen.getByText("Custom SQL functions may change data.")).toBeTruthy();
    fireEvent.click(screen.getByRole("checkbox", { name: "Remember my choice for dev" }));
    await act(async () => fireEvent.click(screen.getByRole("button", { name: "Run" })));
    expect({ result: onResult.mock.calls, stored: window.localStorage.getItem(STORAGE_KEY) }).toEqual({
      result: [[true]],
      stored: "confirmed",
    });
  });

  it("resolves true without remembering when the box is left unchecked", async () => {
    const { onResult } = ask();
    await act(async () => fireEvent.click(screen.getByRole("button", { name: "Run" })));
    expect({ result: onResult.mock.calls, stored: window.localStorage.getItem(STORAGE_KEY) }).toEqual({
      result: [[true]],
      stored: null,
    });
  });

  it("never remembers a cancelled prompt, even with the box checked", async () => {
    const { onResult } = ask();
    fireEvent.click(screen.getByRole("checkbox", { name: "Remember my choice for dev" }));
    await act(async () => fireEvent.click(screen.getByRole("button", { name: "Cancel" })));
    expect({ result: onResult.mock.calls, stored: window.localStorage.getItem(STORAGE_KEY) }).toEqual({
      result: [[false]],
      stored: null,
    });
  });

  it("resolves true without showing the dialog once the key is remembered", async () => {
    window.localStorage.setItem(STORAGE_KEY, "confirmed");
    const { onResult } = ask();
    await act(async () => undefined);
    expect({ result: onResult.mock.calls, dialog: screen.queryByRole("dialog") }).toEqual({
      result: [[true]],
      dialog: null,
    });
  });

  it("resolves false when the owner unmounts while the prompt is open", async () => {
    const { onResult, view } = ask();
    await act(async () => view.unmount());
    expect(onResult.mock.calls).toEqual([[false]]);
  });

  it("still prompts, without a remember box, when localStorage is unavailable", async () => {
    vi.spyOn(window, "localStorage", "get").mockImplementation(() => {
      throw new DOMException("blocked", "SecurityError");
    });
    const { onResult } = ask();
    expect(screen.queryByRole("checkbox")).toBeNull();
    await act(async () => fireEvent.click(screen.getByRole("button", { name: "Run" })));
    expect(onResult.mock.calls).toEqual([[true]]);
  });
});

describe("useConfirmMemory", () => {
  it("re-renders when a confirm remembers the key and when it is forgotten", async () => {
    const { result } = renderHook(() => useConfirmMemory(REMEMBER_KEY));
    expect(result.current.remembered).toBe(false);

    ask();
    fireEvent.click(screen.getByRole("checkbox", { name: "Remember my choice for dev" }));
    await act(async () => fireEvent.click(screen.getByRole("button", { name: "Run" })));
    expect(result.current.remembered).toBe(true);

    act(() => result.current.forget());
    expect({ remembered: result.current.remembered, stored: isConfirmRemembered(REMEMBER_KEY) }).toEqual({
      remembered: false,
      stored: false,
    });
  });

  it("reports nothing remembered for an undefined key", () => {
    window.localStorage.setItem("clicky-ui:confirm:undefined", "confirmed");
    const { result } = renderHook(() => useConfirmMemory(undefined));
    expect(result.current.remembered).toBe(false);
  });
});

describe("ConfirmDialog", () => {
  it("resets the remember box each time it reopens", () => {
    function Toggle() {
      const [open, setOpen] = useState(true);
      return (
        <>
          <button type="button" onClick={() => setOpen((current) => !current)}>
            toggle
          </button>
          <ConfirmDialog {...OPTIONS} open={open} onConfirm={() => undefined} onCancel={() => setOpen(false)} />
        </>
      );
    }
    render(<Toggle />);
    fireEvent.click(screen.getByRole("checkbox", { name: "Remember my choice for dev" }));
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    fireEvent.click(screen.getByRole("button", { name: "toggle" }));
    expect((screen.getByRole("checkbox", { name: "Remember my choice for dev" }) as HTMLInputElement).checked).toBe(false);
    forgetConfirm(REMEMBER_KEY);
  });
});
