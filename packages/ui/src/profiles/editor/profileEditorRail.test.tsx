import { fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { describe, expect, it } from "vitest";
import { ProfileEditorRail } from "./profileEditorRail";
import {
  profileEditorSections,
  type ProfileEditorSection,
  type ProfileSectionStatus,
} from "./profileEditorModel";

const status = Object.fromEntries(
  profileEditorSections.map((section) => [
    section.id,
    { badge: "", attention: false } satisfies ProfileSectionStatus,
  ]),
) as Record<ProfileEditorSection, ProfileSectionStatus>;

function RailHarness() {
  const [section, setSection] = useState<ProfileEditorSection>("general");
  return (
    <ProfileEditorRail
      value={section}
      status={status}
      collections={{
        columns: <button type="button">timestamp</button>,
        parameters: <button type="button">namespace</button>,
        processors: <button type="button">Parse JSON logs</button>,
      }}
      onChange={setSection}
    />
  );
}

describe("ProfileEditorRail", () => {
  it("starts collection groups collapsed and expands them independently", () => {
    render(<RailHarness />);

    expect(
      screen.queryByRole("button", { name: "timestamp" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "namespace" }),
    ).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Columns/ }));
    const timestamp = screen.getByRole("button", { name: "timestamp" });
    expect(timestamp).toBeInTheDocument();
    expect(timestamp.closest("[data-profile-tree-group]")).toHaveAttribute(
      "data-profile-tree-group",
      "columns",
    );
    expect(screen.getByRole("button", { name: /Columns/ })).toHaveAttribute(
      "aria-expanded",
      "true",
    );

    fireEvent.click(screen.getByRole("button", { name: /Parameters/ }));
    expect(
      screen.getByRole("button", { name: "timestamp" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "namespace" }),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Columns/ }));
    expect(
      screen.queryByRole("button", { name: "timestamp" }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "namespace" }),
    ).toBeInTheDocument();
  });
});
