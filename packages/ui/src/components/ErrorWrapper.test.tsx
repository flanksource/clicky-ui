import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ErrorWrapper } from "./ErrorWrapper";

function BrokenPage(): never {
  throw new Error("Unable to load the account dashboard", {
    cause: "upstream request returned HTTP 502",
  });
}

describe("ErrorWrapper", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders a full-page diagnostic fallback and copies a support-ready report", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText },
      configurable: true,
    });

    render(
      <ErrorWrapper>
        <BrokenPage />
      </ErrorWrapper>,
    );

    const fallback = screen.getByRole("alert");
    expect(fallback).toHaveClass("min-h-dvh");
    expect(
      screen.getByRole("heading", { name: "Something went wrong" }),
    ).toBeInTheDocument();
    expect(fallback).toHaveTextContent("Unable to load the account dashboard");

    fireEvent.click(screen.getByRole("button", { name: "Copy error report" }));

    await waitFor(() => expect(writeText).toHaveBeenCalledOnce());
    const report = writeText.mock.calls[0]?.[0];
    expect(report).toEqual(
      expect.stringContaining("Error: Unable to load the account dashboard"),
    );
    expect(report).toEqual(
      expect.stringContaining("Cause: upstream request returned HTTP 502"),
    );
    expect(report).toEqual(expect.stringContaining("Page: http://localhost"));
    expect(report).toEqual(expect.stringContaining("React component stack:"));
    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: "Copied" }),
      ).toBeInTheDocument();
      expect(liveRegion(fallback)).toHaveTextContent(
        "Error details copied to clipboard.",
      );
    });
  });

  it("announces a clipboard failure in the live region", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const writeText = vi.fn().mockRejectedValue(new Error("denied"));
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText },
      configurable: true,
    });

    render(
      <ErrorWrapper>
        <BrokenPage />
      </ErrorWrapper>,
    );

    const fallback = screen.getByRole("alert");
    expect(liveRegion(fallback)).toHaveTextContent("");

    fireEvent.click(screen.getByRole("button", { name: "Copy error report" }));

    await waitFor(() =>
      expect(liveRegion(fallback)).toHaveTextContent(
        "Clipboard access failed. Expand the error details to copy individual values.",
      ),
    );
  });

  it("keeps the query string and fragment out of the copied report", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText },
      configurable: true,
    });
    const original = `${window.location.pathname}${window.location.search}${window.location.hash}`;
    window.history.replaceState(
      {},
      "",
      "/accounts/42?access_token=sk-live-secret&q=invoice#billing",
    );

    try {
      render(
        <ErrorWrapper>
          <BrokenPage />
        </ErrorWrapper>,
      );
      fireEvent.click(
        screen.getByRole("button", { name: "Copy error report" }),
      );
      await waitFor(() => expect(writeText).toHaveBeenCalledOnce());

      const report = writeText.mock.calls[0]?.[0];
      expect(
        report
          ?.split("\n")
          .find((line: string) => line.startsWith("Page: ")),
      ).toBe(`Page: ${window.location.origin}/accounts/42`);
      expect(report).not.toEqual(expect.stringContaining("sk-live-secret"));
      expect(report).not.toEqual(expect.stringContaining("q=invoice"));
      expect(report).not.toEqual(expect.stringContaining("#billing"));
    } finally {
      window.history.replaceState({}, "", original);
    }
  });
});

function liveRegion(fallback: HTMLElement): HTMLElement {
  const region = fallback.querySelector<HTMLElement>('[aria-live="polite"]');
  if (!region) throw new Error("ErrorWrapper is missing its live region");
  return region;
}
