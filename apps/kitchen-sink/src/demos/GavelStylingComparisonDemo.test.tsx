/** @vitest-environment jsdom */

import { cleanup, fireEvent, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { GavelStylingComparisonDemo } from "./GavelStylingComparisonDemo";

afterEach(cleanup);

describe("GavelStylingComparisonDemo", () => {
  it("keeps a visible associated search label after entering a query", () => {
    const { getByLabelText } = render(<GavelStylingComparisonDemo />);
    const input = getByLabelText("Search pull requests") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "feature/search" } });
    expect([input.value, input.labels?.[0]?.textContent]).toEqual([
      "feature/search",
      "Search pull requests",
    ]);
  });
});
