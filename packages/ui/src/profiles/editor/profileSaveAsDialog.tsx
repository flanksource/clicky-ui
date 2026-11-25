import { useState } from "react";
import { Button } from "../../components/button";
import { InputField } from "../../components/InputField";
import { Modal } from "../../overlay/Modal";
import type { ResolvedOperation } from "../../rpc/types";
import type { OperationsApiClient } from "../../rpc/useOperations";
import type { ProfileWizardDraft } from "../wizard/profileWizardModel";

/**
 * Saves the editor's draft as a new profile through the profiles collection's
 * create operation, leaving the profile being edited as it was. The server
 * refuses a name already in use, and the refusal stays in the dialog so the
 * user can pick another.
 */
export function ProfileSaveAsDialog({
  client,
  action,
  draft,
  onCancel,
  onSaved,
}: {
  client: OperationsApiClient;
  action: ResolvedOperation;
  draft: ProfileWizardDraft;
  onCancel: () => void;
  onSaved: (name: string) => void | Promise<void>;
}) {
  const [name, setName] = useState(`${draft.profile ?? "profile"}-copy`);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const trimmed = name.trim();

  const save = async () => {
    if (!client.submitForm) {
      setError("Profile creation is unavailable");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const response = await client.submitForm(action.path, action.method, { ...draft, profile: trimmed });
      if (!response.success) throw new Error(response.error || response.message || "Profile creation failed");
      await onSaved(trimmed);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Profile creation failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open
      onClose={onCancel}
      title="Save as a new profile"
      size="sm"
      footer={
        <div className="flex w-full justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="button" disabled={saving || !trimmed} onClick={() => void save()}>
            {saving ? "Saving…" : "Save as new profile"}
          </Button>
        </div>
      }
    >
      <div className="space-y-3">
        <p className="text-sm text-muted-foreground">
          Your changes are saved under the new name. {draft.profile ?? "This profile"} stays as it was.
        </p>
        <InputField aria-label="New profile name" value={name} onChange={setName} autoFocus />
        {error ? (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        ) : null}
      </div>
    </Modal>
  );
}
