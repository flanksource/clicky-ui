import { cleanup, render } from "@testing-library/react";
import { afterEach, expect, it } from "vitest";
import Page, { vocabulary } from "./index";

afterEach(cleanup);
it("renders exactly one anchored marker per declared Git item", () => {
  const { container } = render(<Page />);
  expect([...container.querySelectorAll("[data-vocabulary-preview]")].map(element => [element.getAttribute("data-vocabulary-preview"), element.getAttribute("data-comment-anchor")])).toEqual(vocabulary.items.map(item => [item.id, `vocabulary:${item.id}`]));
});
