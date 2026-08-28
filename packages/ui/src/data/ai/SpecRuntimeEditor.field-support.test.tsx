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
        schema: {
          type: "object",
          properties: {
            model: { type: "string" },
            noCache: { type: "boolean" },
            prompt: {
              type: "object",
              properties: { system: { type: "string" } },
            },
            setup: {
              type: "object",
              properties: { cwd: { type: "string" } },
            },
            memory: {
              type: "object",
              properties: {
                skipMemory: {
                  type: "boolean",
                  "x-clicky-section": "model",
                },
                skipSkills: {
                  type: "boolean",
                  "x-clicky-section": "model",
                },
              },
            },
            permissions: {
              type: "object",
              properties: {
                skills: {
                  type: "object",
                  additionalProperties: { type: "string" },
                  "x-clicky-section": "model",
                },
              },
            },
          },
        },
      },
      {
        id: "cli",
        label: "CLI",
        backend: "claude-cli",
        schema: {
          type: "object",
          properties: {
            model: { type: "string" },
            noCache: { type: "boolean" },
            effort: { type: "string" },
            prompt: {
              type: "object",
              properties: { appendSystem: { type: "string" } },
            },
            sessionId: { type: "string" },
            memory: {
              type: "object",
              properties: { bare: { type: "boolean" } },
            },
            cliArgs: {
              type: "object",
              properties: { profile: { type: "string" } },
            },
          },
        },
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

  it("projects the runtime schema onto the existing field editors", () => {
    render(
      <SpecRuntimeEditor
        value={{ backend: "claude-agent" }}
        onChange={() => {}}
        families={FAMILIES}
        permissionCatalog={{
          tools: [{ id: "Read", label: "Read", group: "Agent tools" }],
          skills: [{ id: "review", label: "Review", group: "Model skills" }],
        }}
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
    expect(
      screen.queryByPlaceholderText("session UUID"),
    ).not.toBeInTheDocument();
    expect(screen.getByText("Disable prompt caching")).toBeInTheDocument();
    expect(
      within(screen.getByRole("region", { name: "Model" })).getByText(
        "Skip memory",
      ),
    ).toBeInTheDocument();
    expect(
      within(screen.getByRole("region", { name: "Model" })).getByText(
        "Skip skills",
      ),
    ).toBeInTheDocument();
    expect(
      within(screen.getByRole("region", { name: "Model" })).getByText("Review"),
    ).toBeInTheDocument();
    expect(screen.queryByText("Bare")).not.toBeInTheDocument();
    expect(screen.queryByText("Read")).not.toBeInTheDocument();
    expect(
      screen.queryByRole("region", { name: "Permissions" }),
    ).not.toBeInTheDocument();
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

  it("places skills in the section selected by the runtime schema", () => {
    const families: SpecRuntimeFamily[] = [
      {
        id: "claude",
        label: "Claude",
        provider: "claude-agent",
        modes: [
          {
            id: "agent",
            label: "Agent",
            backend: "claude-agent",
            schema: {
              type: "object",
              properties: {
                model: { type: "string" },
                permissions: {
                  type: "object",
                  properties: {
                    skills: {
                      type: "object",
                      "x-clicky-section": "permissions",
                    },
                  },
                },
              },
            },
          },
        ],
      },
    ];

    render(
      <SpecRuntimeEditor
        value={{ backend: "claude-agent" }}
        onChange={() => {}}
        families={families}
        permissionCatalog={{
          skills: [{ id: "review", label: "Review", group: "Model skills" }],
        }}
        sections={["model", "permissions"]}
      />,
    );

    fireEvent.click(
      within(screen.getByRole("region", { name: "Model" })).getByRole(
        "button",
        { name: /Advanced/ },
      ),
    );
    expect(
      within(screen.getByRole("region", { name: "Model" })).queryByText(
        "Review",
      ),
    ).not.toBeInTheDocument();

    fireEvent.click(
      within(screen.getByRole("region", { name: "Permissions" })).getByRole(
        "button",
        { name: /Advanced/ },
      ),
    );
    expect(
      within(screen.getByRole("region", { name: "Permissions" })).getByText(
        "Review",
      ),
    ).toBeInTheDocument();
  });
});
