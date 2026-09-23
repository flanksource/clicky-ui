import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { JsonSchemaForm } from "./JsonSchemaForm";
import type { ExpressionEvaluator, JsonSchemaObject } from "./json-schema-form-types";

// The same member-class screen as the Conditionals story, written as field
// listeners instead of `allOf` branches: each picker says what it does to its
// siblings. Nothing starts `x-hidden` — the `else` actions derive the initial
// shape from the value, exactly as they would for a reloaded record.
const listenersSchema: JsonSchemaObject = {
  type: "object",
  required: ["MemberClassGroupOption"],
  properties: {
    MemberClassGroupOption: {
      type: "string",
      title: "Member class group",
      enum: ["01", "02"],
      "x-enum-labels": { "01": "Add", "02": "Update" },
      "x-enum-display": "segmented",
      "x-on-change": [
        {
          when: { const: "01" },
          show: ["NewMemberClassGroup"],
          require: ["NewMemberClassGroup"],
          hide: ["CurrentMemberClassGroup", "ChangeReason"],
          reset: ["CurrentMemberClassGroup", "ChangeReason"],
          else: {
            hide: ["NewMemberClassGroup"],
            show: ["CurrentMemberClassGroup", "ChangeReason"],
            require: ["CurrentMemberClassGroup"],
            reset: ["NewMemberClassGroup"],
            set: { ChangeReason: "Amendment" },
          },
        },
      ],
    },
    NewMemberClassGroup: { type: "string", title: "New member class group" },
    CurrentMemberClassGroup: { type: "string", title: "Current member class group" },
    ChangeReason: { type: "string", title: "Change reason" },
    LoanOverride: {
      type: "string",
      title: "Loan override",
      enum: ["00", "01"],
      "x-enum-labels": { "00": "No", "01": "Yes" },
      "x-enum-display": "segmented",
      "x-on-change": [
        {
          when: { const: "01" },
          show: ["LoanAmount"],
          require: ["LoanAmount"],
          enable: ["LoanRate"],
          set: { LoanAmount: 1000 },
          else: { hide: ["LoanAmount"], disable: ["LoanRate"], reset: ["LoanAmount", "LoanRate"] },
        },
      ],
    },
    LoanAmount: {
      type: "number",
      title: "Loan amount",
      // `expr` goes to the host's evaluator; the form has no language of its own.
      "x-on-change": [
        {
          when: { expr: "value > 100000" },
          show: ["ApprovalCode"],
          require: ["ApprovalCode"],
          else: { hide: ["ApprovalCode"], reset: ["ApprovalCode"] },
        },
      ],
    },
    LoanRate: { type: "number", title: "Loan rate", default: 3.5 },
    ApprovalCode: { type: "string", title: "Approval code" },
  },
};

// A stand-in runtime: a host would plug in a real expression language here.
// Unknown expressions throw, as a real evaluator's parse error would.
const demoExpressions: Record<string, (value: unknown) => boolean> = {
  "value > 100000": (value) => Number(value) > 100000,
};
const demoEvaluator: ExpressionEvaluator = ({ expr, value }) => {
  const run = demoExpressions[expr];
  if (!run) throw new Error(`demo evaluator: unsupported expression "${expr}"`);
  return run(value);
};

function ListenersDemo({ schema }: { schema: JsonSchemaObject }) {
  const [value, setValue] = useState<Record<string, unknown>>({
    MemberClassGroupOption: "01",
    LoanOverride: "00",
  });
  return (
    <div className="max-w-2xl space-y-4 p-4">
      <JsonSchemaForm
        schema={schema}
        value={value}
        onChange={setValue}
        expressionEvaluator={demoEvaluator}
        showPreferencesMenu={false}
      />
      <pre data-testid="form-value" className="overflow-auto rounded-md border border-border bg-muted/30 p-3 font-mono text-xs">
        {JSON.stringify(value, null, 2)}
      </pre>
    </div>
  );
}

const meta = {
  title: "JsonSchemaForm/Listeners",
  component: ListenersDemo,
  args: { schema: listenersSchema },
  parameters: {
    docs: {
      description: {
        component: [
          "`x-on-change: [{ when, ...actions, else }]` on a property acts on its **sibling** fields.",
          "",
          "- **`when`** takes the same predicate grammar as an `if` (`const`, `enum`, `not`, nested `properties`),",
          "  applied to the source field's value, plus an optional **`expr`** evaluated by the",
          "  `expressionEvaluator` prop (sync: `({ expr, key, value, self, root }) => boolean`). Both must hold.",
          "  Omitted, the listener always applies.",
          "- **State actions** (`hide`/`show`, `enable`/`disable`, `require`/`optional`) are *derived*: they are",
          "  re-evaluated from the current value every render, so a loaded record gets the right shape.",
          "- **Value actions** (`reset` → schema `default` or removed, `set` → literal) are *transitional*: they fire",
          "  in the same commit as the edit, and cascade into the listeners of any field they change.",
          "- Unknown targets, contradictory actions, an unevaluable `when`, or an `expr` without an evaluator throw.",
        ].join("\n"),
      },
    },
  },
} satisfies Meta<typeof ListenersDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

function formValue(canvas: ReturnType<typeof within>): Record<string, unknown> {
  return JSON.parse(canvas.getByTestId("form-value").textContent ?? "{}") as Record<string, unknown>;
}

export const ChangeListeners: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    await step("Add shows and requires the new-group field", async () => {
      expect(canvas.getByLabelText(/^New member class group/)).toBeInTheDocument();
      expect(canvas.getByText("New member class group").closest("label")).toHaveTextContent("*");
      expect(canvas.queryByText("Current member class group")).not.toBeInTheDocument();
      expect(canvas.queryByText("Change reason")).not.toBeInTheDocument();
    });

    await step("Update swaps the fields and sets a change reason", async () => {
      await userEvent.click(canvas.getByRole("radio", { name: "Update (02)" }));
      await waitFor(() => expect(canvas.getByText("Current member class group")).toBeInTheDocument());
      expect(canvas.queryByText("New member class group")).not.toBeInTheDocument();
      expect(canvas.getByLabelText(/^Change reason/)).toHaveValue("Amendment");
    });

    await step("Loan override enables the rate and sets a starting amount", async () => {
      expect(canvas.getByLabelText(/^Loan rate/)).toBeDisabled();
      expect(canvas.queryByText("Loan amount")).not.toBeInTheDocument();
      await userEvent.click(canvas.getByRole("radio", { name: "Yes (01)" }));
      await waitFor(() => expect(canvas.getByLabelText(/^Loan amount/)).toHaveValue("1000"));
      expect(canvas.getByLabelText(/^Loan rate/)).not.toBeDisabled();
    });

    await step("An expr listener reveals the approval code above the threshold", async () => {
      expect(canvas.queryByText("Approval code")).not.toBeInTheDocument();
      const amount = canvas.getByLabelText(/^Loan amount/);
      await userEvent.clear(amount);
      await userEvent.type(amount, "250000");
      await waitFor(() => expect(canvas.getByText("Approval code")).toBeInTheDocument());
    });

    await step("Turning the override off hides and resets the loan fields", async () => {
      await userEvent.type(canvas.getByLabelText(/^Loan rate/), "{backspace}9");
      await userEvent.click(canvas.getByRole("radio", { name: "No (00)" }));
      await waitFor(() => expect(canvas.queryByText("Loan amount")).not.toBeInTheDocument());
      expect(canvas.queryByText("Approval code")).not.toBeInTheDocument();
      expect(formValue(canvas)).toMatchObject({ LoanOverride: "00", LoanRate: 3.5 });
      expect(formValue(canvas)).not.toHaveProperty("LoanAmount");
    });
  },
};
