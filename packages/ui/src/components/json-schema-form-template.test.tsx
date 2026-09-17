import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { JsonSchemaForm } from "./JsonSchemaForm";
import { templateValuePre, type TemplateToken } from "./json-schema-form-template";
import { Modal } from "../overlay/Modal";
import type { JsonSchemaObject } from "./json-schema-form-types";

const stringSchema: JsonSchemaObject = {
  type: "object",
  properties: { subject: { type: "string", title: "Subject" } },
};

const enumAndStringSchema: JsonSchemaObject = {
  type: "object",
  properties: {
    role: { type: "string", title: "Role", enum: ["admin", "editor"] },
    subject: { type: "string", title: "Subject" },
  },
};

const TRIGGER = "Insert template value";
const openTemplateMenu = (index = 0) =>
  fireEvent.click(screen.getAllByRole("button", { name: TRIGGER })[index]!);

describe("templateValuePre prefix wiring", () => {
  it("adds the prefix trigger inside the control wrapper of a string field", () => {
    render(
      <JsonSchemaForm
        schema={stringSchema}
        value={{ subject: "" }}
        onChange={vi.fn()}
        pre={[templateValuePre({ tokens: ["{{x}}"] })]}
      />,
    );
    const trigger = screen.getByRole("button", { name: TRIGGER });
    const wrapper = trigger.closest("[data-jsf-control]");
    expect(wrapper).not.toBeNull();
    expect(wrapper?.querySelector("input[data-jsf-input]")).not.toBeNull();
  });

  it("decorates both string and enum fields by default, but only `keys` when given", () => {
    const both = render(
      <JsonSchemaForm
        schema={enumAndStringSchema}
        value={{ role: "admin", subject: "" }}
        onChange={vi.fn()}
        pre={[templateValuePre({ tokens: ["{{x}}"] })]}
      />,
    );
    expect(screen.getAllByRole("button", { name: TRIGGER })).toHaveLength(2);
    both.unmount();

    render(
      <JsonSchemaForm
        schema={enumAndStringSchema}
        value={{ role: "admin", subject: "" }}
        onChange={vi.fn()}
        pre={[templateValuePre({ tokens: ["{{x}}"], keys: ["subject"] })]}
      />,
    );
    expect(screen.getAllByRole("button", { name: TRIGGER })).toHaveLength(1);
  });

  it("leaves non string/enum fields (e.g. boolean) untouched", () => {
    render(
      <JsonSchemaForm
        schema={{ type: "object", properties: { active: { type: "boolean", title: "Active" } } }}
        value={{ active: true }}
        onChange={vi.fn()}
        pre={[templateValuePre({ tokens: ["{{x}}"] })]}
      />,
    );
    expect(screen.queryByRole("button", { name: TRIGGER })).not.toBeInTheDocument();
  });

  it("keeps schema-derived enum, number, date and boolean controls for selected template fields", () => {
    const onChange = vi.fn();
    render(
      <JsonSchemaForm
        schema={{ type: "object", properties: {
          role: { anyOf: [{ type: "string", enum: ["insured", "owner"] }, { type: "string", pattern: ".*\\{\\{.*" }], "x-source": true },
          percent: { anyOf: [{ type: "number", multipleOf: 0.1 }, { type: "string", pattern: ".*\\{\\{.*" }], "x-source": true },
          start: { anyOf: [{ type: "string", format: "date" }, { type: "string", pattern: ".*\\{\\{.*" }], "x-source": true },
          active: { anyOf: [{ type: "boolean" }, { type: "string", pattern: ".*\\{\\{.*" }], "x-source": true },
          unrelated: { type: "string" },
        } }}
        value={{ role: "insured", percent: 0.5, start: "2026-09-16", active: true }}
        onChange={onChange}
        pre={[templateValuePre({
          tokens: ["{{source.Value}}"],
          kinds: ["string", "enum", "number", "date", "boolean"],
          when: (_field, { prop }) => prop["x-source"] === true,
        })]}
      />,
    );
    expect(screen.getAllByRole("button", { name: TRIGGER })).toHaveLength(4);
    expect(screen.getByRole("combobox", { name: "role" })).toBeInTheDocument();
    expect(screen.getByRole("spinbutton", { name: "percent" })).toBeInTheDocument();
    expect(screen.getByLabelText("start")).toHaveAttribute("type", "date");
    expect(screen.getByRole("checkbox", { name: "active" })).toBeChecked();
    openTemplateMenu(3);
    fireEvent.click(screen.getByRole("menuitem", { name: "{{source.Value}}" }));
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ active: "{{source.Value}}" }));
  });
});

describe("templateValuePre insertion", () => {
  it("splices the token into a string field at the caret", () => {
    const onChange = vi.fn();
    render(
      <JsonSchemaForm
        schema={stringSchema}
        value={{ subject: "ab" }}
        onChange={onChange}
        pre={[templateValuePre({ tokens: ["{{x}}"] })]}
      />,
    );
    const input = document.querySelector<HTMLInputElement>("input[data-jsf-input]")!;
    input.setSelectionRange(1, 1);
    openTemplateMenu();
    fireEvent.click(screen.getByRole("menuitem", { name: "{{x}}" }));
    expect(onChange).toHaveBeenCalledWith({ subject: "a{{x}}b" });
  });

  it("inserts a token's value while displaying its ReactNode label", () => {
    const onChange = vi.fn();
    const tokens: TemplateToken[] = [{ value: "{{mock.email}}", label: <span>Email</span> }];
    render(
      <JsonSchemaForm
        schema={stringSchema}
        value={{ subject: "" }}
        onChange={onChange}
        pre={[templateValuePre({ tokens })]}
      />,
    );
    openTemplateMenu();
    fireEvent.click(screen.getByRole("menuitem", { name: "Email" }));
    expect(onChange).toHaveBeenCalledWith({ subject: "{{mock.email}}" });
  });

  it("replaces an enum field's value (no input to splice into)", () => {
    const onChange = vi.fn();
    render(
      <JsonSchemaForm
        schema={{ type: "object", properties: { role: { type: "string", enum: ["admin", "editor"] } } }}
        value={{ role: "admin" }}
        onChange={onChange}
        pre={[templateValuePre({ tokens: ["{{x}}"] })]}
      />,
    );
    openTemplateMenu();
    fireEvent.click(screen.getByRole("menuitem", { name: "{{x}}" }));
    expect(onChange).toHaveBeenCalledWith({ role: "{{x}}" });
  });
});

describe("templateValuePre value loaders", () => {
  it("shows items immediately for a synchronous loader function", async () => {
    render(
      <JsonSchemaForm
        schema={stringSchema}
        value={{ subject: "" }}
        onChange={vi.fn()}
        pre={[templateValuePre({ tokens: () => ["{{sync}}"] })]}
      />,
    );
    openTemplateMenu();
    expect(await screen.findByRole("menuitem", { name: "{{sync}}" })).toBeInTheDocument();
    expect(screen.queryByRole("menuitem", { name: /Loading/ })).not.toBeInTheDocument();
  });

  it("shows a Loading row for an async loader until it resolves, then the tokens", async () => {
    let resolveTokens!: (v: readonly TemplateToken[]) => void;
    const tokens = () => new Promise<readonly TemplateToken[]>((r) => (resolveTokens = r));
    render(
      <JsonSchemaForm
        schema={stringSchema}
        value={{ subject: "" }}
        onChange={vi.fn()}
        pre={[templateValuePre({ tokens })]}
      />,
    );
    openTemplateMenu();
    expect(screen.getByRole("menuitem", { name: /Loading/ })).toBeInTheDocument();
    await act(async () => {
      resolveTokens(["{{async}}"]);
    });
    expect(screen.getByRole("menuitem", { name: "{{async}}" })).toBeInTheDocument();
    expect(screen.queryByRole("menuitem", { name: /Loading/ })).not.toBeInTheDocument();
  });
});

describe("templateValuePre menu header / footer", () => {
  it("renders header and footer nodes inside the menu and fires the footer action", () => {
    const onMore = vi.fn();
    render(
      <JsonSchemaForm
        schema={stringSchema}
        value={{ subject: "" }}
        onChange={vi.fn()}
        pre={[
          templateValuePre({
            tokens: ["{{x}}"],
            header: <span>Variables</span>,
            footer: (
              <button type="button" onClick={onMore}>
                Show more
              </button>
            ),
          }),
        ]}
      />,
    );
    openTemplateMenu();
    const menu = screen.getByRole("menu");
    expect(within(menu).getByText("Variables")).toBeInTheDocument();
    fireEvent.click(within(menu).getByRole("button", { name: "Show more" }));
    expect(onMore).toHaveBeenCalledTimes(1);
  });
});

describe("templateValuePre inside a dialog", () => {
  it("opens the template menu stacked above the dialog it lives inside", () => {
    render(
      <Modal open onClose={() => {}} title="Edit">
        <JsonSchemaForm
          schema={stringSchema}
          value={{ subject: "" }}
          onChange={vi.fn()}
          pre={[templateValuePre({ tokens: ["{{x}}"] })]}
        />
      </Modal>,
    );
    openTemplateMenu();
    const menuZ = Number(screen.getByRole("menu").style.zIndex);
    // The modal's z lives on its presentation backdrop, not the dialog panel.
    const backdrop = screen.getByRole("dialog").closest("[role='presentation']") as HTMLElement;
    const modalZ = Number(backdrop.style.zIndex);
    expect(modalZ).toBeGreaterThan(0);
    expect(menuZ).toBeGreaterThan(modalZ);
  });

  it("Escape closes the template menu first, then the dialog", () => {
    function Harness() {
      const [open, setOpen] = useState(true);
      return (
        <Modal open={open} onClose={() => setOpen(false)} title="Edit">
          <JsonSchemaForm
            schema={stringSchema}
            value={{ subject: "" }}
            onChange={vi.fn()}
            pre={[templateValuePre({ tokens: ["{{x}}"] })]}
          />
        </Modal>
      );
    }
    render(<Harness />);
    openTemplateMenu();
    expect(screen.getByRole("menu")).toBeInTheDocument();

    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    expect(screen.getByRole("dialog", { name: "Edit" })).toBeInTheDocument();

    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByRole("dialog", { name: "Edit" })).not.toBeInTheDocument();
  });
});
