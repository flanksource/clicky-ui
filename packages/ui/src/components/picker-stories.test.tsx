import { describe, expect, it } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { composeStories } from "@storybook/react-vite";
import * as comboboxStories from "./Combobox.stories";
import * as countryStories from "./CountryPicker.stories";
import * as workloadStories from "./WorkloadPicker.stories";
import * as namespaceStories from "./NamespacePicker.stories";
import * as secretStories from "./SecretKeySelector.stories";
import * as endpointStories from "./EndpointSelector.stories";

// Smoke-renders every story so a broken story (bad prop, missing arg, runtime
// throw) fails CI rather than only surfacing in a manual Storybook session.
// composeStories applies the story's args/decorators just as Storybook would.

describe.each([
  ["Combobox", comboboxStories],
  ["CountryPicker", countryStories],
  ["WorkloadPicker", workloadStories],
  ["NamespacePicker", namespaceStories],
  ["SecretKeySelector", secretStories],
  ["EndpointSelector", endpointStories],
] as const)("%s stories render", (_name, mod) => {
  const composed = composeStories(mod);
  it.each(Object.entries(composed))("renders the %s story", (_storyName, Story) => {
    const { unmount } = render(<Story />);
    expect(document.body.firstChild).not.toBeNull();
    unmount();
  });
});

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
