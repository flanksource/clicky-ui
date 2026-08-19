import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { useState } from "react";
import { describe, expect, it } from "vitest";

import { SpecRuntimeEditor } from "./SpecRuntimeEditor";
import type { AISpecRuntimeValue } from "./SpecRuntimeEditor.model";
import type { SpecRuntimeSandboxCatalog } from "./SpecRuntimeEditor/types";

const CATALOG: SpecRuntimeSandboxCatalog = {
  default: "none",
  kinds: [
    {
      kind: "none",
      description: "Run the agent directly on the host, unconfined",
      capabilities: [],
      modes: ["api", "cli", "agent", "cmux"],
    },
    {
      kind: "srt",
      description: "Confine the agent with sandbox-runtime",
      capabilities: ["wrap-command"],
      modes: ["cli"],
    },
    {
      kind: "git-agent",
      description: "Relocate the run onto an enrolled remote agent over git",
      capabilities: ["remote-exec", "isolate-workspace", "egress-proxy"],
      modes: ["cli", "agent", "cmux"],
      backends: [
        {
          name: "prod-pool",
          agents: [
            { name: "worker-01", status: "enrolled", dispatchable: true },
            {
              name: "worker-02",
              status: "enrolled",
              dispatchable: false,
              dispatchIssue: "missing host key",
            },
            {
              name: "worker-03",
              status: "pending until 2026-08-02T00:00:00Z",
              dispatchable: false,
            },
          ],
        },
      ],
    },
  ],
};

// captain's own config names a backend after the kind it selects
// (`sandbox.backends.git-agent: {kind: git-agent}`), and SandboxDefaults.Resolve
// looks in backends before adapter kinds — so that selector means the backend,
// and the bare kind is unreachable.
const SHADOWED_CATALOG: SpecRuntimeSandboxCatalog = {
  kinds: [
    {
      kind: "git-agent",
      description: "Relocate the run onto an enrolled remote agent over git",
      capabilities: ["remote-exec", "isolate-workspace"],
      modes: ["cli", "agent", "cmux"],
      backends: [
        {
          name: "git-agent",
          agents: [{ name: "w03", status: "enrolled", dispatchable: true }],
        },
      ],
    },
  ],
};

// `withCatalog` rather than an optional `catalog`: a default parameter is
// applied for an explicitly-passed undefined, which would silently re-supply
// the catalog in the "no catalog" case and make that test vacuous.
function Harness({
  initial = {},
  catalog = CATALOG,
  withCatalog = true,
  withCreator = false,
}: {
  initial?: AISpecRuntimeValue;
  catalog?: SpecRuntimeSandboxCatalog;
  withCatalog?: boolean;
  withCreator?: boolean;
}) {
  const [value, setValue] = useState<AISpecRuntimeValue>(initial);
  return (
    <>
      <SpecRuntimeEditor
        value={value}
        onChange={setValue}
        sections={["sandbox", "workspace"]}
        {...(withCatalog ? { sandboxCatalog: catalog } : {})}
        {...(withCreator
          ? {
              sandboxCreate: {
                onCreate: async (input) => ({
                  name: input.name,
                  kind: input.kind,
                }),
              },
            }
          : {})}
      />
      <output aria-label="Runtime value">{JSON.stringify(value)}</output>
    </>
  );
}

// Queried by role: SectionCard labels the whole <section> "Sandbox" too, so a
// bare label lookup is ambiguous.
const sandboxSelect = () => screen.getByRole("combobox", { name: "Sandbox" });
const agentSelect = () =>
  screen.queryByRole("combobox", { name: "Pinned agent" });

function chooseCombobox(combobox: HTMLElement, optionName: string | RegExp) {
  fireEvent.focus(combobox);
  fireEvent.mouseDown(screen.getByRole("option", { name: optionName }));
}

// Warning copy interleaves <code> elements, so getByText cannot see it whole.
const warningText = (warnings: HTMLElement[]) =>
  warnings.map((warning) => warning.textContent ?? "").join("\n");

describe("SpecRuntimeEditor sandbox section", () => {
  it("uses the searchable combobox control for sandbox selection", () => {
    render(<Harness />);

    expect(sandboxSelect()).toHaveAttribute("type", "text");
    expect(sandboxSelect().tagName).toBe("INPUT");
  });

  it("is omitted when the host supplies no catalog", () => {
    render(<Harness withCatalog={false} />);
    expect(screen.queryByRole("combobox", { name: "Sandbox" })).toBeNull();
  });

  it("offers every adapter kind and each configured backend", () => {
    render(<Harness />);
    fireEvent.focus(sandboxSelect());
    const listbox = screen.getByRole("listbox");
    expect(within(listbox).getAllByRole("option")).toHaveLength(5);
    for (const name of [
      /^Inherit \(none\)/,
      /^none/,
      /^Sandbox Runtime/,
      /^Git agent/,
      /^prod-pool \(Git agent\)/,
    ]) {
      expect(within(listbox).getByRole("option", { name })).toBeInTheDocument();
    }
  });

  it("lets a backend shadow the bare kind it is named after", () => {
    render(<Harness catalog={SHADOWED_CATALOG} />);
    fireEvent.focus(sandboxSelect());
    const listbox = screen.getByRole("listbox");

    // Inherit plus one row: both entries write the selector "git-agent", so
    // offering the kind as well would repeat the same choice.
    expect(within(listbox).getAllByRole("option")).toHaveLength(2);
    expect(
      within(listbox).queryByRole("option", { name: /^Git agent/ }),
    ).toBeNull();

    // And the surviving row is the backend, so its roster reaches the picker —
    // the bare kind carries none, and a lookup that found it first would report
    // an enrolled agent as "none dispatchable".
    chooseCombobox(sandboxSelect(), /^git-agent \(Git agent\)/);
    fireEvent.focus(agentSelect()!);
    expect(screen.getByRole("option", { name: "w03" })).toBeInTheDocument();
  });

  it("only offers the agent picker for an adapter that relocates the run", () => {
    render(<Harness />);
    // srt wraps a local command; there is no roster to pin against.
    chooseCombobox(sandboxSelect(), /^Sandbox Runtime/);
    expect(agentSelect()).toBeNull();

    chooseCombobox(sandboxSelect(), /^prod-pool \(Git agent\)/);
    fireEvent.focus(agentSelect()!);
    const agents = within(screen.getByRole("listbox")).getAllByRole("option");
    // Only agents that the backend can actually dispatch to reach this picker.
    expect(agents).toHaveLength(2);
    for (const name of ["Any dispatchable agent", "worker-01"]) {
      expect(screen.getByRole("option", { name })).toBeInTheDocument();
    }
    expect(screen.queryByRole("option", { name: "worker-02" })).toBeNull();
    expect(screen.queryByRole("option", { name: "worker-03" })).toBeNull();
  });

  it("writes a pinned dispatchable agent into the runtime sandbox payload", () => {
    render(<Harness catalog={SHADOWED_CATALOG} />);
    chooseCombobox(sandboxSelect(), /^git-agent \(Git agent\)/);
    chooseCombobox(agentSelect()!, "w03");

    expect(screen.getByLabelText("Runtime value")).toHaveTextContent(
      JSON.stringify({ sandbox: { backend: "git-agent", agent: "w03" } }),
    );
  });

  it("shows the adapter's declared capabilities", () => {
    render(<Harness />);
    chooseCombobox(sandboxSelect(), /^Git agent/);
    const chips = screen.getByLabelText("Sandbox capabilities");
    expect(chips.textContent).toContain("remote-exec");
    expect(chips.textContent).toContain("isolate-workspace");
  });

  it("warns when an isolating sandbox is combined with a worktree", () => {
    render(
      <Harness
        initial={{ setup: { checkout: { worktree: { mode: "new" } } } }}
      />,
    );
    const isolatorWarning = () => warningText(screen.queryAllByRole("status"));

    expect(isolatorWarning()).not.toMatch(/Register exactly one isolator/);

    chooseCombobox(sandboxSelect(), /^Git agent/);
    expect(isolatorWarning()).toMatch(/Register exactly one isolator/);

    // srt wraps the command in place, so it composes with a worktree fine.
    chooseCombobox(sandboxSelect(), /^Sandbox Runtime/);
    expect(isolatorWarning()).not.toMatch(/Register exactly one isolator/);
  });

  it("warns when the adapter cannot serve the selected runtime mode", () => {
    // git-agent's contract is that work returns as commits, so it deliberately
    // excludes api mode — the mode the anthropic backend runs in.
    const api = render(<Harness initial={{ backend: "anthropic" }} />);
    chooseCombobox(
      api.getByRole("combobox", { name: "Sandbox" }),
      /^Git agent/,
    );
    expect(warningText(api.getAllByRole("status"))).toMatch(
      /does not support runtime mode/,
    );
    api.unmount();

    // A cli-mode backend pairs fine, so no warning appears for it.
    const cli = render(<Harness initial={{ backend: "claude-code" }} />);
    chooseCombobox(
      cli.getByRole("combobox", { name: "Sandbox" }),
      /^Git agent/,
    );
    expect(warningText(cli.queryAllByRole("status"))).not.toMatch(
      /does not support runtime mode/,
    );
  });

  it("selects a backend created from the sandbox section", async () => {
    render(<Harness withCreator />);
    fireEvent.click(screen.getByRole("button", { name: "Create sandbox" }));
    fireEvent.change(screen.getByLabelText("Sandbox name"), {
      target: { value: "local-safe" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Next" }));
    fireEvent.click(screen.getByRole("button", { name: "Next" }));
    fireEvent.click(
      within(screen.getByRole("dialog")).getByRole("button", {
        name: "Create sandbox",
      }),
    );

    await waitFor(() =>
      expect(sandboxSelect()).toHaveValue("local-safe (Sandbox Runtime)"),
    );
  });
});
