import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { composeStories } from "@storybook/react-vite";
import * as comboboxStories from "./Combobox.stories";
import * as workloadStories from "./WorkloadPicker.stories";
import * as secretStories from "./SecretKeySelector.stories";

// Smoke-renders every story so a broken story (bad prop, missing arg, runtime
// throw) fails CI rather than only surfacing in a manual Storybook session.
// composeStories applies the story's args/decorators just as Storybook would.

describe.each([
  ["Combobox", comboboxStories],
  ["WorkloadPicker", workloadStories],
  ["SecretKeySelector", secretStories],
] as const)("%s stories render", (_name, mod) => {
  const composed = composeStories(mod);
  it.each(Object.entries(composed))("renders the %s story", (_storyName, Story) => {
    const { unmount } = render(<Story />);
    expect(document.body.firstChild).not.toBeNull();
    unmount();
  });
});
