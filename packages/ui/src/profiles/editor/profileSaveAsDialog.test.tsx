import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { ResolvedOperation } from "../../rpc/types";
import type { OperationsApiClient } from "../../rpc/useOperations";
import { ProfileSaveAsDialog } from "./profileSaveAsDialog";

const CREATE = { path: "/api/v1/profiles", method: "post" } as ResolvedOperation;
const DRAFT = { profile: "spans.opensearch", provider: { type: "opentelemetry" }, columns: [{ name: "service" }] };

function setup(response: { success: boolean; error?: string }) {
  const submitForm = vi.fn().mockResolvedValue(response);
  const onSaved = vi.fn();
  render(
    <ProfileSaveAsDialog
      client={{ submitForm } as unknown as OperationsApiClient}
      action={CREATE}
      draft={DRAFT}
      onCancel={vi.fn()}
      onSaved={onSaved}
    />,
  );
  return { submitForm, onSaved };
}

describe("ProfileSaveAsDialog", () => {
  it("creates the draft under the new name through the create operation, leaving the source profile's name out", async () => {
    const { submitForm, onSaved } = setup({ success: true });
    const name = screen.getByLabelText("New profile name");
    const suggested = (name as HTMLInputElement).value;
    fireEvent.change(name, { target: { value: "  spans.mine  " } });
    fireEvent.click(screen.getByRole("button", { name: "Save as new profile" }));

    await waitFor(() => expect(onSaved).toHaveBeenCalled());
    expect({ suggested, calls: submitForm.mock.calls, saved: onSaved.mock.calls }).toEqual({
      suggested: "spans.opensearch-copy",
      calls: [["/api/v1/profiles", "post", { ...DRAFT, profile: "spans.mine" }]],
      saved: [["spans.mine"]],
    });
  });

  it("keeps the dialog open with the server's refusal when the name is taken", async () => {
    const refusal = 'PROFILE_NAME_CONFLICT: profile "logs.oipa" conflicts with existing profile "logs.oipa"';
    const { onSaved } = setup({ success: false, error: refusal });
    fireEvent.change(screen.getByLabelText("New profile name"), { target: { value: "logs.oipa" } });
    fireEvent.click(screen.getByRole("button", { name: "Save as new profile" }));

    expect({ alert: (await screen.findByRole("alert")).textContent, saved: onSaved.mock.calls }).toEqual({
      alert: refusal,
      saved: [],
    });
  });

  it("offers no save for a blank name", () => {
    setup({ success: true });
    fireEvent.change(screen.getByLabelText("New profile name"), { target: { value: "   " } });
    expect(screen.getByRole("button", { name: "Save as new profile" })).toBeDisabled();
  });
});
