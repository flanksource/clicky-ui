import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { PermissionsSection } from "./PermissionsSection";

describe("PermissionsSection", () => {
  it("renders the permission posture", () => {
    render(<PermissionsSection value={{ mode: "agent" }} onChange={vi.fn()} />);

    expect(
      screen.getByRole("radiogroup", { name: "Permission posture" }),
    ).toBeInTheDocument();
  });
});
