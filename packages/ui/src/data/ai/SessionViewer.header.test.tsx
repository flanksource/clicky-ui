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
});
