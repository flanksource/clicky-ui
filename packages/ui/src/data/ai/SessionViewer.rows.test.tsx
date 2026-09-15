import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SessionRow } from "./SessionViewer.rows";
import { normalizeSession, type SessionEvent } from "./SessionViewer.model";
import { UiSealCheck, UiSparkles } from "../../icons";
import type { StaticIconComponent } from "../Icon";

/** Render an icon component in isolation and return its glyph's path data, so
 *  a row's rendered icon can be compared against the real component it should
 *  use instead of a hardcoded SVG path string. */
function renderedIconPath(Icon: StaticIconComponent): string | null {
  const { container } = render(<Icon />);
  return container.querySelector("path")?.getAttribute("d") ?? null;
}

function renderRow(event: SessionEvent) {
  return render(
    <ul>
      <SessionRow event={event} last defaultExpanded={false} />
    </ul>,
  );
}

function firstEvent(text: string, role: "verified" | "verify_failed" | "system") {
  const events = normalizeSession({
    messages: [{ id: "e1", role, parts: [{ type: "text", text }] }],
  });
  const event = events[0];
  if (!event) throw new Error("expected normalizeSession to produce one event");
  return event;
}

describe("eventVisual for system-kind session rows", () => {
  it("renders a verified event with the verify icon and the emerald tone", () => {
    const { container } = renderRow(firstEvent("All checks passed", "verified"));

    expect(container.querySelector(".bg-emerald-100")).not.toBeNull();
    expect(container.querySelector("path")?.getAttribute("d")).toBe(
      renderedIconPath(UiSealCheck),
    );
  });

  it("renders a verify_failed event with the verify icon and the rose tone", () => {
    const { container } = renderRow(firstEvent("2 checks failed", "verify_failed"));

    expect(container.querySelector(".bg-rose-100")).not.toBeNull();
    expect(container.querySelector("path")?.getAttribute("d")).toBe(
      renderedIconPath(UiSealCheck),
    );
  });

  it("leaves an ordinary system event unchanged: sparkles icon, slate tone", () => {
    const { container } = renderRow(firstEvent("# AGENTS.md instructions", "system"));

    expect(container.querySelector(".bg-muted")).not.toBeNull();
    expect(container.querySelector("path")?.getAttribute("d")).toBe(
      renderedIconPath(UiSparkles),
    );
  });
});

describe("file session rows", () => {
  it("renders an attached user image with its filename", () => {
    const event = normalizeSession({
      messages: [
        {
          id: "image",
          role: "user",
          parts: [
            {
              type: "file",
              mediaType: "image/png",
              url: "/api/attachments/sha256:image",
              filename: "scorecard.png",
            },
          ],
        },
      ],
    })[0];
    if (!event) throw new Error("expected a file event");

    renderRow(event);

    expect(screen.getByRole("img", { name: "scorecard.png" })).toHaveAttribute(
      "src",
      "/api/attachments/sha256:image",
    );
  });
});
