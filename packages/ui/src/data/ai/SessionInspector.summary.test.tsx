import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SessionInspectorSidebar } from "./SessionInspector.summary";

describe("SessionInspectorSidebar permission mode", () => {
  it.each([
    ["claude", "auto", "Auto"],
    ["codex", "bypassPermissions", "Full access"],
  ])(
    "shows a %s session's recorded %s posture in that family's vocabulary",
    (source, permissionMode, label) => {
      render(
        <SessionInspectorSidebar
          session={{ id: "session-1", source, permissionMode }}
        />,
      );

      expect(screen.getByTestId("session-permission-mode")).toHaveTextContent(
        `Permission mode${label}`,
      );
    },
  );

  it("shows the raw value for a posture it does not recognise", () => {
    render(
      <SessionInspectorSidebar
        session={{ id: "session-1", source: "claude", permissionMode: "manual" }}
      />,
    );

    expect(screen.getByTestId("session-permission-mode")).toHaveTextContent(
      "Permission modemanual",
    );
  });

  it("omits the row when the session recorded no posture", () => {
    render(
      <SessionInspectorSidebar session={{ id: "session-1", source: "claude" }} />,
    );

    expect(screen.queryByTestId("session-permission-mode")).toBeNull();
  });
});
