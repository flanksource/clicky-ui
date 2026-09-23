import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { JsonSchemaForm } from "./JsonSchemaForm";
import type { JsonSchemaObject } from "./json-schema-form-types";

// A screen whose whole behaviour is a state machine: two pickers decide which
// of the remaining fields exist. Every branch is expressed in plain JSON Schema
// — `if`/`then`/`else` over `const`, `enum` and `not` guards — and the fields
// they govern carry `x-hidden`, which a matching branch re-declares to reveal.
//
// `then` is the JSON Schema 2020-12 conditional keyword, not a Promise
// thenable, so unicorn/no-thenable is a false positive on these schema literals.
/* eslint-disable unicorn/no-thenable */
const memberClassSchema: JsonSchemaObject = {
  type: "object",
  required: ["MemberClassGroupOption"],
  properties: {
    MemberClassGroupOption: {
      type: "string",
      title: "Member class group",
      enum: ["01", "02"],
      "x-enum-labels": { "01": "Add", "02": "Update" },
      "x-enum-display": "segmented",
    },
    // Which of these two exists is decided below by the then/else pair: adding
    // asks for a new group name, updating picks the existing one.
    NewMemberClassGroup: { type: "string", title: "New member class group", "x-hidden": true },
    CurrentMemberClassGroup: { type: "string", title: "Current member class group", "x-hidden": true },
    // Only asked for when you are NOT adding — a `not` guard, the shape a
    // `<>` condition takes in JSON Schema.
    ChangeReason: { type: "string", title: "Change reason", "x-hidden": true },
    LoanOverride: {
      type: "string",
      title: "Loan override",
      enum: ["00", "01"],
      "x-enum-labels": { "00": "No", "01": "Yes" },
      "x-enum-display": "segmented",
    },
    LoanAmount: { type: "number", title: "Loan amount", "x-hidden": true },
    LoanRate: { type: "number", title: "Loan rate", "x-hidden": true },
  },
  allOf: [
    {
      if: { properties: { MemberClassGroupOption: { const: "01" } }, required: ["MemberClassGroupOption"] },
      then: {
        properties: { NewMemberClassGroup: { type: "string", title: "New member class group" } },
        required: ["NewMemberClassGroup"],
      },
      else: {
        properties: { CurrentMemberClassGroup: { type: "string", title: "Current member class group" } },
        required: ["CurrentMemberClassGroup"],
      },
    },
    {
      if: {
        properties: { MemberClassGroupOption: { not: { const: "01" } } },
        required: ["MemberClassGroupOption"],
      },
      then: { properties: { ChangeReason: { type: "string", title: "Change reason" } } },
    },
    {
      if: { properties: { LoanOverride: { const: "01" } }, required: ["LoanOverride"] },
      then: {
        properties: {
          LoanAmount: { type: "number", title: "Loan amount" },
          LoanRate: { type: "number", title: "Loan rate" },
        },
      },
    },
  ],
};
/* eslint-enable unicorn/no-thenable */

function ConditionalsDemo({ schema }: { schema: JsonSchemaObject }) {
  const [value, setValue] = useState<Record<string, unknown>>({
    MemberClassGroupOption: "01",
    LoanOverride: "00",
  });
  return (
    <div className="max-w-2xl space-y-4 p-4">
      <JsonSchemaForm schema={schema} value={value} onChange={setValue} showPreferencesMenu={false} />
      <pre className="overflow-auto rounded-md border border-border bg-muted/30 p-3 font-mono text-xs">
        {JSON.stringify(value, null, 2)}
      </pre>
    </div>
  );
}

const meta = {
  title: "JsonSchemaForm/Conditionals",
  component: ConditionalsDemo,
  args: { schema: memberClassSchema },
  parameters: {
    docs: {
      description: {
        component: [
          "`allOf: [{ if, then, else }]` is re-evaluated against the live value on every render,",
          "so the form reshapes itself as the user answers.",
          "",
          "- **Guards**: `const`, `enum` membership, and `not` (how a `!=` condition is written).",
          "  A predicate the form cannot evaluate — a bare `type`, a `pattern`, a numeric bound —",
          "  makes the `if` **false**, never true, so an unverifiable branch is never merged.",
          "- **`else`** contributes when the `if` does not hold, including when it failed closed.",
          "- **`x-hidden`** renders nothing for a property. A branch replaces a property wholesale,",
          "  so re-declaring the field without the flag is what reveals it.",
        ].join("\n"),
      },
    },
  },
} satisfies Meta<typeof ConditionalsDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const StateMachine: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("Adding shows the new-group field and no change reason", async () => {
      expect(canvas.getByText("New member class group")).toBeInTheDocument();
      expect(canvas.queryByText("Current member class group")).not.toBeInTheDocument();
      expect(canvas.queryByText("Change reason")).not.toBeInTheDocument();
    });

    await step("Updating swaps to the else branch and adds the not-guarded field", async () => {
      await userEvent.click(canvas.getByRole("radio", { name: "Update (02)" }));
      await waitFor(() => expect(canvas.getByText("Current member class group")).toBeInTheDocument());
      expect(canvas.queryByText("New member class group")).not.toBeInTheDocument();
      expect(canvas.getByText("Change reason")).toBeInTheDocument();
    });

    await step("Loan override reveals the hidden loan fields", async () => {
      expect(canvas.queryByText("Loan amount")).not.toBeInTheDocument();
      await userEvent.click(canvas.getByRole("radio", { name: "Yes (01)" }));
      await waitFor(() => expect(canvas.getByText("Loan amount")).toBeInTheDocument());
      expect(canvas.getByText("Loan rate")).toBeInTheDocument();
    });
  },
};
