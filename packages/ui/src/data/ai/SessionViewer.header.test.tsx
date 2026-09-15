import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SessionMetadataBadges } from "./SessionViewer.header";
import type { SessionMetadataSummary } from "./SessionViewer.model";

describe("SessionMetadataBadges context meter", () => {
  it.each([
    ["session id", { sessionId: "session-01JZQX7TXAXQM0RHD7XCGBF8F0" }],
    ["model", { model: "claude-sonnet-5" }],
  ] satisfies Array<[string, SessionMetadataSummary]>)(
    "renders before context usage when the %s is resolved",
    (_label, metadata) => {
      render(<SessionMetadataBadges metadata={metadata} showContextMeter />);

      expect(screen.getByLabelText("Context 0% used")).toBeInTheDocument();
    },
  );

  it("passes the resolved provider and runtime identity into the context bar", () => {
    render(
      <SessionMetadataBadges
        metadata={{
          provider: "anthropic",
          executionMode: "agent",
          model: "claude-opus-5",
          reasoningEffort: "high",
        }}
        showContextMeter
      />,
    );

    const meter = screen.getByLabelText("Context 0% used");
    expect(
      meter.querySelector('[data-context-provider="anthropic"]'),
    ).not.toBeNull();
    expect(meter.querySelector('[data-context-mode="agent"]')).not.toBeNull();
  });
});

describe("SessionMetadataBadges permission mode badge", () => {
  it("renders a badge with the mode's label and an accessible title", () => {
    render(
      <SessionMetadataBadges
        metadata={{ permissionMode: "acceptEdits" }}
        showContextMeter={false}
      />,
    );

    const badge = screen.getByTitle("Permission mode: Accept edits");
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveTextContent("Accept edits");
  });

  it("renders the raw value for an unrecognized mode instead of crashing", () => {
    render(
      <SessionMetadataBadges
        metadata={{ permissionMode: "some-future-mode" }}
        showContextMeter={false}
      />,
    );

    expect(
      screen.getByTitle("Permission mode: some-future-mode"),
    ).toHaveTextContent("some-future-mode");
  });

  it("renders no permission-mode badge when the metadata carries none", () => {
    render(
      <SessionMetadataBadges metadata={{}} showContextMeter={false} />,
    );

    expect(screen.queryByTitle(/^Permission mode:/)).not.toBeInTheDocument();
  });
});
