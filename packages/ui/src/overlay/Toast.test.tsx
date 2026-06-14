import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ToastProvider } from "./Toast";
import { useToast } from "./toast-context";

function Trigger({ durationMs }: { durationMs?: number }) {
  const { toast } = useToast();
  return (
    <button type="button" onClick={() => toast({ message: "Approved", tone: "success", durationMs })}>
      fire
    </button>
  );
}

afterEach(() => {
  vi.useRealTimers();
});

describe("Toast", () => {
  it("shows a toast when toast() is called", () => {
    render(
      <ToastProvider>
        <Trigger />
      </ToastProvider>,
    );
    fireEvent.click(screen.getByRole("button", { name: "fire" }));
    expect(screen.getByText("Approved")).toBeInTheDocument();
  });

  it("auto-dismisses after the duration elapses", () => {
    vi.useFakeTimers();
    render(
      <ToastProvider durationMs={1000}>
        <Trigger />
      </ToastProvider>,
    );
    fireEvent.click(screen.getByRole("button", { name: "fire" }));
    expect(screen.getByText("Approved")).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(1100);
    });
    expect(screen.queryByText("Approved")).not.toBeInTheDocument();
  });

  it("keeps a sticky toast (durationMs=0) until dismissed", () => {
    vi.useFakeTimers();
    render(
      <ToastProvider>
        <Trigger durationMs={0} />
      </ToastProvider>,
    );
    fireEvent.click(screen.getByRole("button", { name: "fire" }));

    act(() => {
      vi.advanceTimersByTime(10_000);
    });
    expect(screen.getByText("Approved")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Dismiss" }));
    expect(screen.queryByText("Approved")).not.toBeInTheDocument();
  });

  it("throws when useToast is used outside a provider", () => {
    function Orphan() {
      useToast();
      return null;
    }
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<Orphan />)).toThrow(/ToastProvider/);
    spy.mockRestore();
  });
});
