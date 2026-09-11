import { fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { beforeAll, describe, expect, it } from "vitest";
import { configureProfiles } from "../profileApi";
import type { ProfileWizardDraft } from "../wizard/profileWizardModel";
import {
  ProfileParameterDetail,
  ProfileParameterSidebar,
} from "./profileParameterEditor";
import { testProfileSchema } from "./testSchema";

beforeAll(() =>
  configureProfiles({
    schema: testProfileSchema,
    formExtensions: {
      pre: [
        (field, context) =>
          field.schema["x-clicky-component"] !== "test-params"
            ? field
            : {
                ...field,
                onChange: (params) =>
                  context.onRootChange?.({
                    ...context.rootValue,
                    params,
                    collectionExtensionRan: true,
                  }),
              },
      ],
      post: [
        (field, nodes, context) =>
          field.schema["x-clicky-component"] !== "test-param"
            ? nodes
            : {
                ...nodes,
                value: (
                  <>
                    {nodes.value}
                    <button
                      type="button"
                      onClick={() =>
                        context?.onRootChange?.({
                          ...context.rootValue,
                          itemExtensionRan: true,
                        })
                      }
                    >
                      Host parameter action
                    </button>
                  </>
                ),
              },
      ],
    },
  }),
);

const initialDraft = {
  profile: "logs",
  params: [
    { name: "namespace", label: "Namespace", type: "string" },
    { name: "pod", label: "Pod prefix", type: "list" },
  ],
} satisfies ProfileWizardDraft;

function Harness() {
  const [draft, setDraft] = useState<ProfileWizardDraft>(initialDraft);
  const [activeIndex, setActiveIndex] = useState(0);
  return (
    <>
      <ProfileParameterSidebar
        draft={draft}
        activeIndex={activeIndex}
        onActiveIndexChange={setActiveIndex}
        onChange={setDraft}
      />
      <ProfileParameterDetail
        draft={draft}
        activeIndex={activeIndex}
        onChange={setDraft}
      />
      <output>{JSON.stringify(draft)}</output>
    </>
  );
}

describe("profile parameter split editor", () => {
  it("renders parameter names as tree items", () => {
    render(<Harness />);

    expect(
      screen
        .getByRole("button", { name: "Namespace" })
        .closest("[data-profile-tree-item]"),
    ).not.toBeNull();
  });

  it("caps stacked parameter controls at a readable width", () => {
    render(<Harness />);

    expect(
      screen.getByRole("textbox", { name: "Name" }).closest("[style]"),
    ).toHaveStyle({ maxWidth: "40rem" });
  });

  it("selects parameter names in the sidebar and edits through host extensions", () => {
    render(<Harness />);

    fireEvent.click(screen.getByRole("button", { name: "Pod prefix" }));
    expect(screen.getByRole("textbox", { name: "Name" })).toHaveValue("pod");

    fireEvent.change(screen.getByRole("textbox", { name: "Name" }), {
      target: { value: "pod_name" },
    });
    expect(screen.getByText(/collectionExtensionRan/)).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", { name: "Host parameter action" }),
    );
    expect(screen.getByText(/itemExtensionRan/)).toBeInTheDocument();
  });
});
