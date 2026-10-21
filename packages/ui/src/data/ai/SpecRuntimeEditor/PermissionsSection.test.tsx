import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { PermissionsSection } from "./PermissionsSection";

describe("PermissionsSection", () => {
  it("keeps permission policies editable without a posture selector", () => {
    render(
      <PermissionsSection
        entries={[]}
        onApplyEntries={vi.fn()}
        onAddEntry={vi.fn()}
      />,
    );

    expect(
      screen.queryByRole("radiogroup", { name: "Permission posture" }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByText("No tools, MCP servers, or plugins configured"),
    ).toBeInTheDocument();
  });
});
