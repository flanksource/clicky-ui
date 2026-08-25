import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { SpecRuntimeFamily } from "../../runtime/runtime-mode";
import { ModelSection } from "./ModelSection";

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
        arguments: [
          {
            name: "model",
            source: "model",
            implementation: "mapped",
          },
          {
            name: "maxTurns",
            source: "budget.maxTurns",
            implementation: "mapped",
          },
        ],
      },
      {
        id: "cli",
        label: "CLI",
        backend: "claude-cli",
        arguments: [
          {
            name: "model",
            source: "model",
            implementation: "mapped",
          },
          {
            name: "effort",
            source: "effort",
            implementation: "mapped",
          },
          {
            name: "maxBudgetUsd",
            source: "budget.cost",
            implementation: "mapped",
          },
        ],
      },
    ],
  },
];

describe("ModelSection", () => {
  it("shows supported fields instead of an argument mapping table", () => {
    render(
      <ModelSection
        value={{ backend: "claude-agent" }}
        onChange={vi.fn()}
        models={[]}
        families={families}
      />,
    );

    expect(screen.getByTitle("Model — prompt default")).toBeInTheDocument();
    expect(screen.getByText("Max turns")).toBeInTheDocument();
    expect(screen.queryByText("Max cost (USD)")).not.toBeInTheDocument();
    expect(screen.queryByTitle("Reasoning effort")).not.toBeInTheDocument();
    expect(screen.queryByText(/arguments/i)).not.toBeInTheDocument();
  });
});
