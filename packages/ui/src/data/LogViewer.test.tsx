import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { LogViewer } from "./LogViewer";

const BOLD = "\u001b[1m";
const RESET = "\u001b[0m";

describe("LogViewer", () => {
  it("styles ANSI escapes instead of printing them", () => {
    const { container } = render(<LogViewer logs={`${BOLD}Title:${RESET} Buy milk`} />);
    const pre = container.querySelector("pre");
    expect(pre?.textContent).toBe("Title: Buy milk");
    expect(pre?.querySelector("span[style]")?.textContent).toBe("Title:");
  });
});
