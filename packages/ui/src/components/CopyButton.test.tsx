import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { CopyButton } from "./CopyButton";

// jsdom implements neither navigator.clipboard nor document.execCommand, so
// both have to be defined rather than spied on.
function stubClipboard(writeText: ReturnType<typeof vi.fn> | undefined) {
  Object.defineProperty(navigator, "clipboard", {
    value: writeText ? { writeText } : undefined,
    configurable: true,
  });
}

function stubExecCommand(impl: (() => boolean) | undefined) {
  Object.defineProperty(document, "execCommand", { value: impl, configurable: true });
}

describe("CopyButton", () => {
  const writeText = vi.fn().mockResolvedValue(undefined);

  beforeEach(() => {
    writeText.mockClear().mockResolvedValue(undefined);
    stubClipboard(writeText);
    stubExecCommand(undefined);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("writes the value and flips its label to Copied", async () => {
    render(<CopyButton value="timeout: 300" label="Copy config" />);

    fireEvent.click(screen.getByLabelText("Copy config"));

    expect(writeText).toHaveBeenCalledWith("timeout: 300");
    expect(await screen.findByLabelText("Copied")).toBeInTheDocument();
  });

  it("builds the payload only on click when given a thunk", () => {
    const build = vi.fn(() => "built lazily");
    render(<CopyButton value={build} />);

    expect(build).not.toHaveBeenCalled();
    fireEvent.click(screen.getByLabelText("Copy"));

    expect(build).toHaveBeenCalledTimes(1);
    expect(writeText).toHaveBeenCalledWith("built lazily");
  });

  it("falls back to execCommand when the async clipboard rejects", async () => {
    writeText.mockRejectedValue(new Error("denied"));
    const exec = vi.fn(() => true);
    stubExecCommand(exec);

    render(<CopyButton value="fallback text" />);
    fireEvent.click(screen.getByLabelText("Copy"));

    expect(await screen.findByLabelText("Copied")).toBeInTheDocument();
    expect(exec).toHaveBeenCalledWith("copy");
  });

  it("reports a failure rather than silently claiming success", async () => {
    writeText.mockRejectedValue(new Error("denied"));
    stubExecCommand(() => false);

    render(<CopyButton value="nope" />);
    fireEvent.click(screen.getByLabelText("Copy"));

    expect(await screen.findByLabelText("Copy failed")).toBeInTheDocument();
  });

  it("reverts to its idle label after the flash window", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    render(<CopyButton value="x" label="Copy row" />);

    fireEvent.click(screen.getByLabelText("Copy row"));
    expect(await screen.findByLabelText("Copied")).toBeInTheDocument();

    await act(() => vi.advanceTimersByTimeAsync(1500));
    expect(screen.getByLabelText("Copy row")).toBeInTheDocument();
  });

  it("does not fire a click handler on an enclosing clickable surface", async () => {
    const onParentClick = vi.fn();
    render(
      // biome-ignore lint: the surrounding surface is intentionally clickable
      <div onClick={onParentClick}>
        <CopyButton value="x" />
      </div>,
    );

    fireEvent.click(screen.getByLabelText("Copy"));
    // Settle the copy before asserting, so the state update lands inside the test.
    expect(await screen.findByLabelText("Copied")).toBeInTheDocument();

    expect(writeText).toHaveBeenCalled();
    expect(onParentClick).not.toHaveBeenCalled();
  });
});
