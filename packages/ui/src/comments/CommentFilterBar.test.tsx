import { useState } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CommentFilterBar } from "./CommentFilterBar";
import { emptyCommentFilters } from "./comment-utils";
import {
  DEFAULT_COMMENT_STATUSES,
  type CommentConfig,
  type CommentFilters,
} from "./comment-types";

const config: CommentConfig = {
  statuses: DEFAULT_COMMENT_STATUSES,
  facets: [
    { key: "area", label: "Area", options: [{ value: "ui", label: "UI" }] },
  ],
};

function Harness({ onState }: { onState: (f: CommentFilters) => void }) {
  const [filters, setFilters] = useState<CommentFilters>(emptyCommentFilters());
  return (
    <CommentFilterBar
      config={config}
      filters={filters}
      onChange={(f) => {
        setFilters(f);
        onState(f);
      }}
    />
  );
}

describe("CommentFilterBar", () => {
  it("toggles a status into the filter set", () => {
    let latest: CommentFilters | null = null;
    render(<Harness onState={(f) => (latest = f)} />);
    fireEvent.click(screen.getByRole("button", { name: /Open/ }));
    expect(latest!.statuses.has("open")).toBe(true);
  });

  it("clears all filters via the clear action", () => {
    let latest: CommentFilters | null = null;
    render(<Harness onState={(f) => (latest = f)} />);
    fireEvent.click(screen.getByRole("button", { name: /Open/ }));
    fireEvent.click(screen.getByRole("button", { name: /Clear/ }));
    expect(latest!.statuses.size).toBe(0);
  });
});
