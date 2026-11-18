import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { DiffStat } from "./DiffStat";

const bars = (container: HTMLElement, tone: string) =>
  container.querySelectorAll(`[data-diff-bar="${tone}"]`).length;

describe("DiffStat", () => {
  it("renders added and removed line counts with a proportional bar", () => {
    const { container } = render(<DiffStat additions={30} deletions={10} />);
    expect(screen.getByText("+30")).toBeTruthy();
    expect(screen.getByText("-10")).toBeTruthy();
    expect([bars(container, "add"), bars(container, "del")]).toEqual([4, 1]);
  });

  it("describes the change for assistive technology", () => {
    render(<DiffStat additions={2} deletions={1} files={3} />);
    expect(
      screen.getByLabelText("3 changed files, 2 additions, 1 deletion"),
    ).toBeTruthy();
  });

  it("omits the bar when bars is false", () => {
    const { container } = render(
      <DiffStat additions={5} deletions={0} bars={false} />,
    );
    expect(container.querySelector("[data-diff-bar]")).toBeNull();
  });
});
