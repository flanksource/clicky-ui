import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Panel } from "./Panel";

describe("Panel", () => {
  it("renders the title, count pill, header actions, body and footer", () => {
    render(
      <Panel title="Checks" count={3} actions={<button>copy</button>} footer={<span>foot</span>}>
        <p>body</p>
      </Panel>,
    );
    expect(screen.getByText("Checks")).toBeTruthy();
    expect(screen.getByText("3")).toBeTruthy();
    expect(screen.getByRole("button", { name: "copy" })).toBeTruthy();
    expect(screen.getByText("body")).toBeTruthy();
    expect(screen.getByText("foot")).toBeTruthy();
  });

  it("renders a headerless card when no title/icon/actions are given", () => {
    render(
      <Panel>
        <p>body</p>
      </Panel>,
    );
    // The count is a header adornment, so with no header it must not appear.
    expect(screen.getByText("body")).toBeTruthy();
    expect(screen.queryByText("Checks")).toBeNull();
  });
});
