// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { afterEach, describe, expect, it } from "vitest";
import type { PermissionPolicy, ToolMeta } from "@flanksource/clicky-ui/ai";
import { PermissionStrategiesEditor } from "./PermissionStrategiesEditor";

const TOOLS: ToolMeta[] = [
  {
    name: "projects_list",
    label: "List projects",
    group: "projects.read",
    parent: "Projects",
    entity: "project",
    verb: "list",
    scope: "collection",
    method: "GET",
    annotations: { readOnlyHint: true, idempotentHint: true },
  },
  {
    name: "projects_delete",
    label: "Delete project",
    group: "projects.write",
    parent: "Projects",
    entity: "project",
    verb: "delete",
    scope: "entity",
    method: "DELETE",
    annotations: { destructiveHint: true, idempotentHint: true },
  },
];

function EditorHarness({ initial }: { initial: PermissionPolicy }) {
  const [value, setValue] = useState(initial);
  return (
    <>
      <PermissionStrategiesEditor
        value={value}
        tools={TOOLS}
        onChange={setValue}
      />
      <output data-testid="policy-json">{JSON.stringify(value)}</output>
    </>
  );
}

describe("PermissionStrategiesEditor", () => {
  afterEach(cleanup);

  it("applies common match presets while preserving the selected policy", () => {
    render(
      <EditorHarness initial={[{ group: "billing.write", policy: "ask" }]} />,
    );

    expect(
      screen.getByRole("button", { name: "0 matching operations" }).closest(
        "[data-accordion-row]",
      ),
    ).not.toBeNull();
    fireEvent.click(
      screen.getByRole("button", { name: /Custom conditions.*Policy: Ask/i }),
    );
    expect(
      (screen.getByRole("combobox", {
        name: "Match preset",
      }) as HTMLInputElement).value,
    ).toBe("Custom conditions");

    fireEvent.click(screen.getByRole("combobox", { name: "Match preset" }));
    expect(
      screen.getByText("Match tools explicitly marked read-only."),
    ).toBeTruthy();
    fireEvent.mouseDown(
      screen.getByRole("option", { name: /Read-only tools/ }),
    );

    expect(screen.getByTestId("policy-json").textContent).toBe(
      JSON.stringify([{ readOnly: true, policy: "ask" }]),
    );
    expect(
      screen.queryByRole("button", { name: /Read-only tools Policy: Ask/i }),
    ).not.toBeNull();
  });

  it("uses a segmented policy control and metadata-aware custom conditions", () => {
    render(
      <EditorHarness
        initial={[
          {
            group: "projects.write",
            destructive: true,
            policy: "deny",
          },
        ]}
      />,
    );

    fireEvent.click(
      screen.getByRole("button", { name: /Custom conditions.*Policy: Off/i }),
    );
    expect(
      screen.getByRole("radio", { name: "Off" }).getAttribute("aria-checked"),
    ).toBe("true");
    expect(
      screen
        .getByTestId("permission-policy-control")
        .getAttribute("data-policy"),
    ).toBe("deny");
    expect(
      screen
        .getAllByLabelText(/Match field/)
        .map((field) => (field as HTMLSelectElement).value),
    ).toEqual(["group", "destructive"]);
    expect(
      (screen.getByLabelText("Match value 1") as HTMLInputElement).value,
    ).toBe("projects.write");
    expect(
      (screen.getByLabelText("Match value 2") as HTMLSelectElement).value,
    ).toBe("true");

    fireEvent.click(screen.getByLabelText("Match value 1"));
    expect(
      screen.getByRole("option", { name: "projects.write" }),
    ).toBeTruthy();
    fireEvent.keyDown(screen.getByLabelText("Match value 1"), {
      key: "Escape",
    });
    const matchBadge = screen.getByRole("button", {
      name: "1 matching operation",
    });
    expect(matchBadge.closest("[data-accordion-row]")).not.toBeNull();
    expect(screen.queryByText("projects_delete")).toBeNull();

    fireEvent.mouseEnter(matchBadge);
    expect(screen.getByRole("tooltip")).toBeTruthy();
    expect(screen.getByText("projects_delete")).toBeTruthy();

    fireEvent.click(screen.getByRole("radio", { name: "On" }));
    expect(screen.getByTestId("policy-json").textContent).toBe(
      JSON.stringify([
        { group: "projects.write", destructive: true, policy: "allow" },
      ]),
    );
  });

  it("keeps custom mode after its accordion is closed and reopened", () => {
    render(<EditorHarness initial={[{ name: "*", policy: "ask" }]} />);

    const header = screen.getByRole("button", {
      name: /All tools Policy: Ask/i,
    });
    fireEvent.click(header);
    fireEvent.click(screen.getByRole("combobox", { name: "Match preset" }));
    fireEvent.mouseDown(
      screen.getByRole("option", { name: /Custom conditions/ }),
    );

    expect(screen.getByTestId("policy-json").textContent).toBe(
      JSON.stringify([{ group: "*", policy: "ask" }]),
    );
    const customHeader = screen.getByRole("button", {
      name: /Custom conditions.*Policy: Ask/i,
    });
    fireEvent.click(customHeader);
    fireEvent.click(customHeader);
    expect(
      (screen.getByRole("combobox", {
        name: "Match preset",
      }) as HTMLInputElement).value,
    ).toBe("Custom conditions");
  });

  it("groups individually selected tools with the in operator", () => {
    render(
      <EditorHarness initial={[{ name: "projects_list", policy: "ask" }]} />,
    );

    fireEvent.click(
      screen.getByRole("button", { name: /Tool name projects_list.*Ask/i }),
    );
    fireEvent.change(screen.getByLabelText("Match operator 1"), {
      target: { value: "in" },
    });
    expect(screen.getByTestId("policy-json").textContent).toBe(
      JSON.stringify([{ name: ["projects_list"], policy: "ask" }]),
    );

    fireEvent.click(screen.getByRole("combobox", { name: "Match values 1" }));
    fireEvent.mouseDown(
      screen.getByRole("option", { name: "projects_delete" }),
    );
    expect(screen.getByTestId("policy-json").textContent).toBe(
      JSON.stringify([
        {
          name: ["projects_list", "projects_delete"],
          policy: "ask",
        },
      ]),
    );
  });
});
