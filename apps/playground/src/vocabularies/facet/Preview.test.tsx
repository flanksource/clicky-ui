// @vitest-environment jsdom
import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import Preview from "./Preview";
import { FACET_VOCABULARY } from "./catalog";
afterEach(cleanup);
describe("Facet vocabulary previews", () => {
  it.each(FACET_VOCABULARY)("renders the selected specimen for $id", item => {
    const { container } = render(<Preview item={item} />);
    const selected = ["slot", "order", "link"].includes(item.type)
      ? container.querySelector(`[aria-label="${item.id}"]`)
      : container.querySelector(`[data-vocabulary-name="${item.id}"]`);
    expect(selected).not.toBeNull();
    expect(container.querySelectorAll("[data-vocabulary-name]").length).toBeLessThanOrEqual(1);
  });
});
