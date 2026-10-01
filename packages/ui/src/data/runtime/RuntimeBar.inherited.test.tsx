import { fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { describe, expect, it } from "vitest";
import { RuntimeBar, type RuntimeBarValue } from "./RuntimeBar";
import type { SpecRuntimeFamily } from "./runtime-mode";

const families: SpecRuntimeFamily[] = [
  {
    id: "first",
    label: "First family",
    provider: "openai",
    modes: [{ id: "api", label: "API" }],
  },
  {
    id: "second",
    label: "Second family",
    provider: "anthropic",
    modes: [{ id: "api", label: "API" }],
  },
];
const models = [
  {
    id: "first-model",
    label: "First model",
    provider: "openai",
    reasoning: false,
  },
  {
    id: "second-model",
    label: "Second model",
    provider: "anthropic",
    reasoning: false,
  },
];

function Harness({ effectiveModel }: { effectiveModel: string }) {
  const [value, setValue] = useState<RuntimeBarValue>({});
  return (
    <>
      <RuntimeBar
        value={value}
        onChange={setValue}
        models={models}
        families={families}
        effectiveModel={effectiveModel}
        effectiveMode="api"
      />
      <output data-testid="value">{JSON.stringify(value)}</output>
    </>
  );
}

describe("RuntimeBar inherited identity", () => {
  it("selects another provider directly from the combined model picker", () => {
    render(<Harness effectiveModel="first-model" />);
    expect(screen.getByTestId("value")).toHaveTextContent("{}");
    fireEvent.click(screen.getByTitle("Model — unspecified"));
    fireEvent.mouseDown(screen.getByRole("option", { name: /^Second model/ }));
    expect(JSON.parse(screen.getByTestId("value").textContent ?? "{}")).toEqual(
      { mode: "api", model: "second-model" },
    );
  });

  it("refreshes inherited provider captions without persisting profile defaults", () => {
    const view = render(<Harness effectiveModel="second-model" />);
    expect(screen.getByTitle("Model — unspecified")).toHaveTextContent(
      "Second family",
    );
    view.rerender(<Harness effectiveModel="first-model" />);
    expect(screen.getByTitle("Model — unspecified")).toHaveTextContent(
      "First family",
    );
    view.rerender(<Harness effectiveModel="second-model" />);
    expect(screen.getByTitle("Model — unspecified")).toHaveTextContent(
      "Second family",
    );
    expect(screen.getByTestId("value")).toHaveTextContent("{}");
  });
});
