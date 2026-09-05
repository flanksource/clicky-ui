import { fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { describe, expect, it } from "vitest";
import { RuntimeBar, type RuntimeBarValue } from "./RuntimeBar";
import type { SpecRuntimeFamily } from "./runtime-mode";

const families: SpecRuntimeFamily[] = [
  { id: "first", label: "First family", provider: "openai", modes: [{ id: "api", label: "API" }] },
  { id: "second", label: "Second family", provider: "anthropic", modes: [{ id: "api", label: "API" }] },
];
const models = [
  { id: "first-model", label: "First model", provider: "openai", reasoning: false },
  { id: "second-model", label: "Second model", provider: "anthropic", reasoning: false },
];

function Harness({ effectiveModel }: { effectiveModel: string }) {
  const [value, setValue] = useState<RuntimeBarValue>({});
  return <>
    <RuntimeBar value={value} onChange={setValue} models={models} families={families} effectiveModel={effectiveModel} effectiveMode="api" />
    <output data-testid="value">{JSON.stringify(value)}</output>
  </>;
}

describe("RuntimeBar inherited identity", () => {
  it("lets an operator select a family before selecting an explicit model", () => {
    render(<Harness effectiveModel="first-model" />);
    fireEvent.click(screen.getByTitle("Family — First family"));
    fireEvent.click(screen.getByRole("menuitem", { name: /^Second family/ }));
    expect(screen.getByTitle("Family — Second family")).toBeInTheDocument();
    expect(screen.getByTestId("value")).toHaveTextContent('{"mode":"api"}');
    fireEvent.click(screen.getByTitle("Model — prompt default"));
    fireEvent.click(screen.getByRole("menuitem", { name: /^Second model/ }));
    expect(JSON.parse(screen.getByTestId("value").textContent ?? "{}")).toEqual({ mode: "api", model: "second-model", effort: "medium" });
  });

  it("uses a new inherited profile identity after a previous family selection", () => {
    const view = render(<Harness effectiveModel="second-model" />);
    fireEvent.click(screen.getByTitle("Family — Second family"));
    fireEvent.click(screen.getByRole("menuitem", { name: /^First family/ }));
    view.rerender(<Harness effectiveModel="first-model" />);
    expect(screen.getByTitle("Family — First family")).toBeInTheDocument();
    view.rerender(<Harness effectiveModel="second-model" />);
    expect(screen.getByTitle("Family — Second family")).toBeInTheDocument();
  });
});
