import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { CodeBlockActions } from "./code-block-actions";

describe("CodeBlockActions", () => {
  it("renders nothing when no control is enabled", () => {
    const { container } = render(<CodeBlockActions source="x" />);
    expect(container.firstChild).toBeNull();
  });

  describe("copy button", () => {
    const writeText = vi.fn().mockResolvedValue(undefined);

    beforeEach(() => {
      writeText.mockClear();
      Object.defineProperty(navigator, "clipboard", { value: { writeText }, configurable: true });
    });

    it("writes the source to the clipboard and reflects the copied state", async () => {
      render(<CodeBlockActions source="timeout: 300" copyable />);
      fireEvent.click(screen.getByLabelText("Copy code"));
      expect(writeText).toHaveBeenCalledWith("timeout: 300");
      expect(await screen.findByLabelText("Copied")).toBeInTheDocument();
    });
  });

  describe("download button", () => {
    let downloadName = "";
    // jsdom does not implement URL.createObjectURL, so define it rather than spy.
    const createObjectURL = vi.fn(() => "blob:mock");
    const revokeObjectURL = vi.fn();

    beforeEach(() => {
      downloadName = "";
      createObjectURL.mockClear();
      Object.defineProperty(URL, "createObjectURL", { value: createObjectURL, configurable: true });
      Object.defineProperty(URL, "revokeObjectURL", { value: revokeObjectURL, configurable: true });
      vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(function (
        this: HTMLAnchorElement,
      ) {
        downloadName = this.download;
      });
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it("names the downloaded file from the language extension", () => {
      render(<CodeBlockActions source="a: 1" language="yaml" downloadable />);
      fireEvent.click(screen.getByLabelText("Download code"));
      expect(createObjectURL).toHaveBeenCalledOnce();
      expect(downloadName).toBe("snippet.yaml");
    });

    it("falls back to a .txt extension for an unknown language", () => {
      render(<CodeBlockActions source="plain" downloadable />);
      fireEvent.click(screen.getByLabelText("Download code"));
      expect(downloadName).toBe("snippet.txt");
    });
  });

  describe("theme toggle", () => {
    it("labels the control with the target theme and fires the callback", () => {
      const onToggleTheme = vi.fn();
      const { rerender } = render(
        <CodeBlockActions source="x" theme="light" onToggleTheme={onToggleTheme} />,
      );
      fireEvent.click(screen.getByLabelText("Switch to dark theme"));
      expect(onToggleTheme).toHaveBeenCalledOnce();

      rerender(<CodeBlockActions source="x" theme="dark" onToggleTheme={onToggleTheme} />);
      expect(screen.getByLabelText("Switch to light theme")).toBeInTheDocument();
    });
  });
});
