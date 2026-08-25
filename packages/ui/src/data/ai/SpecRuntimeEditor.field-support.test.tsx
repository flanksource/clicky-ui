import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { SpecRuntimeFamily } from "../runtime/runtime-mode";
import { SpecRuntimeEditor } from "./SpecRuntimeEditor";

const FAMILIES: SpecRuntimeFamily[] = [
  {
    id: "claude",
    label: "Claude",
    provider: "claude-agent",
    modes: [
      {
        id: "agent",
        label: "Agent",
        backend: "claude-agent",
        arguments: [
          { name: "model", source: "model", implementation: "mapped" },
          {
            name: "system",
            source: "prompt.system",
            implementation: "mapped",
          },
          { name: "cwd", source: "setup.cwd", implementation: "mapped" },
          {
            name: "skipMemory",
            source: "memory.skipMemory",
            implementation: "mapped",
          },
        ],
      },
      {
        id: "cli",
        label: "CLI",
        backend: "claude-cli",
        arguments: [
          { name: "model", source: "model", implementation: "mapped" },
          { name: "effort", source: "effort", implementation: "mapped" },
          {
            name: "appendSystem",
            source: "prompt.appendSystem",
            implementation: "mapped",
          },
          {
            name: "resume",
            source: "sessionId",
            implementation: "mapped",
          },
          { name: "bare", source: "memory.bare", implementation: "mapped" },
          {
            name: "profile",
            source: "cliArgs.profile",
            implementation: "mapped",
          },
        ],
      },
    ],
  },
];

describe("SpecRuntimeEditor field support", () => {
  it("uses the default runtime catalog while the server catalog is loading", () => {
    render(
      <SpecRuntimeEditor
        value={{ backend: "claude-agent" }}
        onChange={() => {}}
        families={[]}
        sections={["model"]}
      />,
    );

    expect(screen.getByRole("group", { name: "Runtime" })).toBeInTheDocument();
  });

  it("projects provider argument support onto the existing field editors", () => {
    render(
      <SpecRuntimeEditor
        value={{ backend: "claude-agent" }}
        onChange={() => {}}
        families={FAMILIES}
        sections={["model", "prompt", "workspace", "permissions"]}
      />,
    );

    expect(screen.getByText("System")).toBeInTheDocument();
    expect(screen.queryByText("Append system")).not.toBeInTheDocument();
    expect(screen.getByText("Directory")).toBeInTheDocument();

    fireEvent.click(
      within(screen.getByRole("region", { name: "Model" })).getByRole(
        "button",
        { name: /Advanced/ },
      ),
    );
    expect(screen.queryByPlaceholderText("session UUID")).not.toBeInTheDocument();
    expect(screen.getByText("Disable prompt caching")).toBeInTheDocument();

    fireEvent.click(
      within(screen.getByLabelText("Permissions")).getByRole("button", {
        name: /Advanced/,
      }),
    );
    expect(screen.getByText("Skip memory")).toBeInTheDocument();
    expect(screen.queryByText("Bare")).not.toBeInTheDocument();
  });

  it("hides CLI fields when the selected mode does not publish them", () => {
    render(
      <SpecRuntimeEditor
        value={{ backend: "claude-agent" }}
        onChange={() => {}}
        families={FAMILIES}
        sections={["cli"]}
        cliOptions={{
          schema: {
            type: "object",
            properties: {
              profile: { type: "string", title: "Profile" },
            },
          },
        }}
      />,
    );

    expect(
      screen.queryByRole("region", { name: "CLI flags" }),
    ).not.toBeInTheDocument();
  });
});
