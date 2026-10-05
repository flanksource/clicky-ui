import { expect, it } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { composeStories } from "@storybook/react-vite";
import * as endpointStories from "./EndpointSelector.stories";

it("keeps the EndpointSelector story's namespaced workload valid", async () => {
  const { AllAccessModes } = composeStories(endpointStories);
  render(<AllAccessModes />);

  await waitFor(() =>
    expect(
      screen.getAllByRole("button", { name: "Toggle options" }),
    ).toHaveLength(2),
  );
  expect(screen.getAllByRole("combobox")[0]).not.toHaveAttribute(
    "aria-invalid",
    "true",
  );
});
