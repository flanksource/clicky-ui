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
  const [createdName, setCreatedName] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const trimmed = name.trim();

  const save = async () => {
    setSaving(true);
    setError("");
    let savedName = createdName;
    try {
      if (savedName === null) {
        if (!client.submitForm) throw new Error("Profile creation is unavailable");
        const response = await client.submitForm(action.path, action.method, { ...draft, profile: trimmed });
        if (!response.success) throw new Error(response.error || response.message || "Profile creation failed");
        savedName = trimmed;
        setCreatedName(savedName);
      }
      await onSaved(savedName);
    } catch (saveError) {
      const detail = saveError instanceof Error ? saveError.message : undefined;
      setError(savedName === null
        ? detail ?? "Profile creation failed"
        : `Profile "${savedName}" was created. ${detail ?? "Could not complete the action."}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open
      onClose={onCancel}
      closeOnEsc={!saving}
      hideClose={saving}
      title="Save as a new profile"
      size="sm"
      footer={
        <div className="flex w-full justify-end gap-2">
          <Button type="button" variant="ghost" disabled={saving} onClick={onCancel}>
            {createdName === null ? "Cancel" : "Close"}
          </Button>
          <Button type="button" disabled={saving || !trimmed} onClick={() => void save()}>
            {saving ? "Saving…" : createdName === null ? "Save as new profile" : "Retry"}
          </Button>
        </div>
      }
    >
      <div className="space-y-3">
        <p className="text-sm text-muted-foreground">
          Your changes are saved under the new name. {draft.profile ?? "This profile"} stays as it was.
        </p>
        <InputField aria-label="New profile name" value={name} onChange={setName} disabled={saving || createdName !== null} autoFocus />
        {error ? (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        ) : null}
      </div>
    </Modal>
  );
}
