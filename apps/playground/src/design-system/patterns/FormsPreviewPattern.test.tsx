/** @vitest-environment jsdom */

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { FormsPreviewPattern } from "./FormsPreviewPattern";

afterEach(cleanup);

describe("FormsPreviewPattern", () => {
  it("keeps the preview synchronized with valid form values", () => {
    render(<FormsPreviewPattern />);

    fireEvent.change(screen.getByLabelText("Configuration name"), {
      target: { value: "Audit production" },
    });

    expect(screen.getByLabelText("Configuration preview").textContent).toContain(
      "Audit production",
    );
  });

  it("surfaces required-field errors and blocks saving invalid state", () => {
    render(<FormsPreviewPattern />);

    fireEvent.change(screen.getByLabelText("Configuration name"), {
      target: { value: "" },
    });

    expect(screen.getByRole("alert").textContent).toContain("Enter a configuration name");
    expect(
      (screen.getByRole("button", { name: "Save configuration" }) as HTMLButtonElement).disabled,
    ).toBe(true);
  });
});
