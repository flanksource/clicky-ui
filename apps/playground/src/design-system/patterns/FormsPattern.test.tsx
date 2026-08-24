/** @vitest-environment jsdom */

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { FormsPattern } from "./FormsPattern";

afterEach(cleanup);

describe("FormsPattern", () => {
  it("surfaces required-field errors and blocks the commit action", () => {
    render(<FormsPattern />);

    fireEvent.change(screen.getByLabelText(/^Collector name/), { target: { value: "" } });

    expect(screen.getByRole("alert").textContent).toContain("Enter a collector name");
    expect(
      (screen.getByRole("button", { name: "Create collector" }) as HTMLButtonElement).disabled,
    ).toBe(true);
  });

  it("swaps the scope field for the one the chosen source actually needs", () => {
    render(<FormsPattern />);

    expect(screen.getByLabelText("Namespace")).toBeTruthy();

    fireEvent.click(screen.getByRole("radio", { name: "Database" }));

    expect(screen.queryByLabelText("Namespace")).toBeNull();
    expect(screen.getByLabelText("Connection")).toBeTruthy();
  });

  it("keeps optional settings folded away until they are asked for", () => {
    render(<FormsPattern />);

    expect(screen.queryByLabelText("Timeout")).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: /Advanced/ }));

    expect(screen.getByLabelText("Timeout")).toBeTruthy();
    expect(screen.getByRole("button", { name: /Advanced/ }).getAttribute("aria-expanded")).toBe("true");
  });
});
