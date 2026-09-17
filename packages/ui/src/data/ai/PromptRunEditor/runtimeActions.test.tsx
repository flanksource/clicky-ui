import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { DropdownMenuItem } from "../../../overlay/DropdownMenu";
import { UNSPECIFIED_HINT, UNSPECIFIED_LABEL } from "../../runtime/unspecified";
import type { SpecRuntimeFamily } from "../../runtime/runtime-mode";
import type { RuntimePreset } from "../runtime-profile";
import type { AISpecRuntimeValue } from "../SpecRuntimeEditor.model";
import { permissionField, presetsField } from "./runtimeActions";

const PLAN_AND_DEFAULT = {
  type: "object",
  properties: {
    permissions: {
      type: "object",
      properties: { mode: { type: "string", enum: ["default", "plan"] } },
    },
  },
} as const;

const NO_POSTURES = {
  type: "object",
  properties: { permissions: { type: "object", properties: {} } },
} as const;

function families(
  schema: unknown,
  extra: Partial<SpecRuntimeFamily["modes"][number]> = {},
): SpecRuntimeFamily[] {
  return [
    {
      id: "claude",
      label: "Claude",
      provider: "anthropic",
      modes: [
        {
          id: "cli",
          label: "CLI",
          ...(schema ? { schema: schema as never } : {}),
          ...extra,
        },
      ],
    },
  ];
}

/** Item labels as rendered text, which is where SegmentItemLabel puts them. */
function labels(items: DropdownMenuItem[]): string[] {
  return items.map((item, index) => {
    render(<div data-testid={`item-${index}`}>{item.label}</div>);
    return screen.getByTestId(`item-${index}`).textContent ?? "";
  });
}

describe("permissionField", () => {
  it("offers only the postures the runtime's schema publishes, led by Unspecified", () => {
    const field = permissionField({
      spec: { mode: "cli" },
      families: families(PLAN_AND_DEFAULT),
      onChange: vi.fn(),
    });

    expect(labels(field!.items)).toEqual([
      `-${UNSPECIFIED_HINT}`,
      "Manual",
      "Plan",
    ]);
    expect(field!.title).toBe("Permission posture — Unspecified");
  });

  it("is omitted when the runtime publishes no postures and the spec holds none", () => {
    expect(
      permissionField({
        spec: { mode: "cli" },
        families: families(NO_POSTURES),
        onChange: vi.fn(),
      }),
    ).toBeUndefined();
  });

  it("offers every posture while no runtime narrows them", () => {
    const field = permissionField({
      spec: {},
      families: families(undefined),
      onChange: vi.fn(),
    });

    expect(labels(field!.items)).toEqual([
      `-${UNSPECIFIED_HINT}`,
      "Manual",
      "Accept edits",
      "Auto",
      "Bypass permissions",
      "Don't ask",
      "Plan",
    ]);
  });

  it("collapses gemini's aliased postures to one entry", () => {
    const schema = {
      type: "object",
      properties: {
        permissions: {
          type: "object",
          properties: {
            mode: {
              type: "string",
              enum: ["default", "acceptEdits", "auto", "plan"],
            },
          },
        },
      },
    };
    const field = permissionField({
      spec: { mode: "cli" },
      families: [
        {
          id: "gemini",
          label: "Gemini",
          provider: "google",
          modes: [
            {
              id: "cli",
              label: "CLI",
              schema: schema as never,
              permissions: {
                modes: {
                  acceptEdits: { kind: "native", effects: { flag: "--yolo" } },
                  auto: { kind: "native", effects: { flag: "--yolo" } },
                },
              },
            },
          ],
        },
      ],
      onChange: vi.fn(),
    });

    expect(labels(field!.items)).toEqual([
      `-${UNSPECIFIED_HINT}`,
      "Manual",
      "Auto edit",
      "Plan",
    ]);
  });

  it("keeps an unpublished current posture visible and flags it as unavailable", () => {
    const field = permissionField({
      spec: { mode: "cli", permissions: { mode: "bypassPermissions" } },
      families: families(PLAN_AND_DEFAULT),
      onChange: vi.fn(),
    });

    expect(field!.title).toBe(
      "Permission posture — Bypass permissions is not available for Claude CLI",
    );
    expect(labels(field!.items).at(-1)).toContain(
      "not available for Claude CLI",
    );
    expect(field!.items.at(-1)?.disabled).toBe(true);
  });

  it("writes the chosen posture into the spec and clears it to Unspecified", () => {
    const onChange = vi.fn();
    const spec: AISpecRuntimeValue = {
      mode: "cli",
      permissions: { mode: "plan" },
    };
    const field = permissionField({
      spec,
      families: families(PLAN_AND_DEFAULT),
      onChange,
    })!;

    field.items[1]!.onSelect();
    expect(onChange).toHaveBeenLastCalledWith({
      mode: "cli",
      permissions: { mode: "default" },
    });

    field.items[0]!.onSelect();
    expect(onChange).toHaveBeenLastCalledWith({ mode: "cli" });
  });

  it("resolves the runtime from the inherited mode when the spec names none", () => {
    const field = permissionField({
      spec: {},
      families: families(PLAN_AND_DEFAULT),
      effectiveMode: "cli",
      onChange: vi.fn(),
    });

    expect(labels(field!.items)).toEqual([
      `-${UNSPECIFIED_HINT}`,
      "Manual",
      "Plan",
    ]);
  });
});

const PRESETS: RuntimePreset[] = [
  { id: "defaults", name: "Defaults", scope: "global", spec: {} },
  { id: "guardrails", name: "Guardrails", scope: "surface", spec: {} },
];

describe("presetsField", () => {
  it("appends a newly selected preset so it resolves last", () => {
    const onChange = vi.fn();
    const field = presetsField({
      presets: PRESETS,
      value: ["defaults"],
      onChange,
      onReorder: vi.fn(),
    });

    field.items[1]!.onSelect();

    expect(onChange).toHaveBeenCalledWith(["defaults", "guardrails"]);
  });

  it("removes a deselected preset in place, preserving the surviving order", () => {
    const onChange = vi.fn();
    const field = presetsField({
      presets: PRESETS,
      value: ["guardrails", "defaults"],
      onChange,
      onReorder: vi.fn(),
    });

    field.items[1]!.onSelect();

    expect(onChange).toHaveBeenCalledWith(["defaults"]);
  });

  it.each([
    { value: [], reorder: false, caption: UNSPECIFIED_LABEL },
    { value: ["defaults"], reorder: false, caption: "1" },
    { value: ["defaults", "guardrails"], reorder: true, caption: "2" },
    // A reference the catalog cannot resolve is only removable in the modal,
    // so it must be reachable even from a single selection.
    { value: ["nope"], reorder: true, caption: "1" },
  ])(
    "offers reorder=$reorder for $value",
    ({ value, reorder, caption }) => {
      const onReorder = vi.fn();
      const field = presetsField({
        presets: PRESETS,
        value,
        onChange: vi.fn(),
        onReorder,
      });

      const last = field.items.at(-1);
      expect(last?.label === "Reorder presets…").toBe(reorder);
      render(<div data-testid="caption">{field.caption}</div>);
      expect(screen.getByTestId("caption")).toHaveTextContent(
        `Presets${caption}`,
      );
      if (reorder) {
        last!.onSelect();
        expect(onReorder).toHaveBeenCalled();
      }
    },
  );

  it("titles the field with the resolved preset names in resolution order", () => {
    expect(
      presetsField({
        presets: PRESETS,
        value: ["guardrails", "nope"],
        onChange: vi.fn(),
        onReorder: vi.fn(),
      }).title,
    ).toBe("Presets — Guardrails, nope");
  });
});
