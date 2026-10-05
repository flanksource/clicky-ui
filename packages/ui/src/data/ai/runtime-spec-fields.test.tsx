import { useState } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { UiPauseCircle } from "../../icons";
import { RuntimeBar } from "../runtime/RuntimeBar";
import { SPEC_RUNTIME_FAMILIES } from "../runtime/runtime-mode";
import type { AISpecRuntimeValue } from "./SpecRuntimeEditor.model";
import { runtimeSpecFields } from "./runtime-spec-fields";

function Harness({ initial }: { initial: AISpecRuntimeValue }) {
  const [value, setValue] = useState(initial);
  return (
    <>
      <RuntimeBar
        value={value}
        onChange={setValue}
        actions={{
          fields: runtimeSpecFields({
            value,
            onChange: setValue,
            families: SPEC_RUNTIME_FAMILIES,
          }),
        }}
      />
      <output>{JSON.stringify(value)}</output>
    </>
  );
}

describe("runtime spec fields", () => {
  it.each(["New worktree", "Existing worktree"])(
    "shows the default commit timing after selecting %s",
    (source) => {
      render(<Harness initial={{ mode: "cli" }} />);
      fireEvent.click(screen.getByTitle("Runtime options"));
      fireEvent.click(screen.getByRole("menuitem", { name: "Source" }));
      fireEvent.click(screen.getByRole("menuitem", { name: source }));
      expect(screen.getByTitle("Commit — Every turn")).toBeInTheDocument();
      expect(
        JSON.parse(screen.getByRole("status").textContent!).workflow,
      ).toEqual({ commits: [{ on: "turn" }] });
    },
  );
  it("keeps permission-mode colors in dropdown choices", () => {
    const field = runtimeSpecFields({
      value: { mode: "cli", permissions: { mode: "plan" } },
      onChange: vi.fn(),
      families: SPEC_RUNTIME_FAMILIES,
    }).find((entry) => entry.id === "permissions.mode");
    expect(field?.icon).toBe(UiPauseCircle);
    expect(field?.iconClassName).toBe(
      "text-teal-700 [[data-theme=dark]_&]:text-teal-400",
    );
    render(
      <Harness initial={{ mode: "cli", permissions: { mode: "plan" } }} />,
    );
    expect(
      screen.getByTitle("Permission posture — Plan").querySelector("svg"),
    ).toHaveClass("text-teal-700");
    fireEvent.click(screen.getByTitle("Runtime options"));
    expect(
      screen
        .getByRole("menuitem", { name: "Permission mode" })
        .querySelector("svg")?.parentElement,
    ).toHaveClass("text-teal-700");
    fireEvent.click(screen.getByRole("menuitem", { name: "Permission mode" }));
    expect(
      screen.getByRole("menuitem", { name: "Plan" }).querySelector("svg")
        ?.parentElement,
    ).toHaveClass("text-teal-700");
  });
  it("renders explicitly supplied HEAD and Never choices inline", () => {
    render(
      <Harness
        initial={{
          mode: "cli",
          setup: { checkout: { worktree: { mode: "none" } } },
          workflow: { commits: [] },
        }}
      />,
    );
    expect(screen.getByTitle("Source — HEAD")).toBeInTheDocument();
    expect(screen.getByTitle("Commit — Never")).toBeInTheDocument();
  });

  it("edits commit timing from a Commit submenu and preserves existing policy detail", () => {
    render(
      <Harness
        initial={{
          mode: "cli",
          workflow: {
            commits: [
              { on: "run", message: "Update configuration", when: "always" },
            ],
          },
        }}
      />,
    );
    fireEvent.click(screen.getByTitle("Runtime options"));
    fireEvent.click(screen.getByRole("menuitem", { name: "Commit" }));
    fireEvent.click(screen.getByRole("menuitem", { name: "Every turn" }));
    expect(JSON.parse(screen.getByRole("status").textContent!)).toEqual({
      mode: "cli",
      workflow: {
        commits: [
          { on: "turn", message: "Update configuration", when: "always" },
        ],
      },
    });
  });

  it("exposes source choices and an editable existing worktree path", () => {
    render(
      <Harness
        initial={{
          mode: "cli",
          setup: {
            checkout: {
              worktree: { mode: "existing", path: "/workspace/example" },
            },
          },
        }}
      />,
    );
    fireEvent.click(screen.getByTitle("Source — Existing worktree"));
    expect(screen.getByRole("textbox", { name: "Worktree path" })).toHaveValue(
      "/workspace/example",
    );
    fireEvent.change(screen.getByRole("textbox", { name: "Worktree path" }), {
      target: { value: "/workspace/review" },
    });
    expect(JSON.parse(screen.getByRole("status").textContent!)).toEqual({
      mode: "cli",
      setup: {
        checkout: { worktree: { mode: "existing", path: "/workspace/review" } },
      },
    });
    fireEvent.click(screen.getByRole("menuitem", { name: "HEAD" }));
    expect(screen.getByTitle("Source — HEAD")).toBeInTheDocument();
  });
});
