import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { Button } from "../components/button";
import { LoadingDots } from "../components/loading";
import {
  ModalContext,
  type ModalDraft,
  type ModalFormDefinition,
  type ModalSubmission,
  type ModalSubmissionResult,
} from "./modal-context";
import {
  listModalDraftKeys,
  modalDraftPrefix,
  readModalDraft,
  recordModalRejection,
  saveModalDraft,
} from "./modal-draft-storage";
import { zIndex } from "./zIndex";

export type ModalProviderProps = {
  /** Namespace specific to the app, account and workspace. */
  scope: string;
  forms: Readonly<Record<string, ModalFormDefinition>>;
  children: ReactNode;
};

type HostedModal = {
  id: string;
  formKey: string;
  form: ModalFormDefinition;
  initialDraft: ModalDraft;
  state: "open" | "pending" | "recoverable";
  storageKey?: string;
  error?: string;
};

type RecoveryNotice = { message: string; storageKey?: string };

const unknownOutcome = "Submission outcome unknown";
const unknownError = `${unknownOutcome}. Check whether the change was applied before retrying.`;
const rejectedError =
  "The previous submission was rejected. Review your saved values and try again.";
const cardShapeClass =
  "w-full rounded-lg border px-density-3 py-density-2 text-sm shadow-lg";
const cardClass = `${cardShapeClass} border-border bg-popover text-popover-foreground`;
// A pending submission is the one card the user is waiting on, so it is filled
// with the primary colour rather than blending in with the page like a popover.
const pendingCardClass = `${cardShapeClass} border-primary bg-primary text-primary-foreground`;

export function ModalProvider(props: ModalProviderProps) {
  return <ModalScope key={props.scope} {...props} />;
}

function ModalScope({ scope, forms, children }: ModalProviderProps) {
  const prefix = modalDraftPrefix(scope);
  const formRegistry = useRef(forms);
  useLayoutEffect(() => { formRegistry.current = forms; }, [forms]);
  const active = useRef(false);
  const modals = useRef(new Map<string, HostedModal>());
  const [entries, setEntries] = useState<HostedModal[]>([]);
  const [notices, setNotices] = useState<RecoveryNotice[]>([]);

  const show = useCallback((entry: HostedModal) => {
    modals.current.set(entry.id, entry);
    setEntries(Array.from(modals.current.values()));
  }, []);

  useLayoutEffect(() => {
    active.current = true;
    return () => {
      active.current = false;
    };
  }, []);

  useEffect(() => {
    const recoveryNotices: RecoveryNotice[] = [];
    try {
      for (const storageKey of listModalDraftKeys(prefix)) {
        try {
          const { form, record, draft } = readModalDraft(
            storageKey,
            formRegistry.current,
          );
          show({
            id: storageKey,
            storageKey,
            formKey: record.formKey,
            form,
            initialDraft: draft,
            state: "recoverable",
            error: record.status === "pending" ? unknownError : rejectedError,
          });
        } catch {
          recoveryNotices.push({
            storageKey,
            message: "Could not restore a saved draft.",
          });
        }
      }
    } catch {
      if (Object.values(formRegistry.current).some((form) => form.recovery)) {
        recoveryNotices.push({
          message: "Could not read saved drafts from this tab.",
        });
      }
    }
    setNotices(recoveryNotices);
  }, [prefix, show]);

  const openModal = useCallback(
    (formKey: string, initialDraft: ModalDraft) => {
      const form = Object.hasOwn(forms, formKey) ? forms[formKey] : undefined;
      if (!form) throw new Error(`Modal form "${formKey}" is not registered`);
      const id = prefix + crypto.getRandomValues(new Uint32Array(4)).join("-");
      show({ id, formKey, form, initialDraft, state: "open" });
    },
    [forms, prefix, show],
  );
  const context = useMemo(() => ({ openModal }), [openModal]);

  function removeDraft(storageKey: string) {
    try {
      window.sessionStorage.removeItem(storageKey);
      setNotices((current) =>
        current.filter((notice) => notice.storageKey !== storageKey),
      );
    } catch {
      setNotices((current) => [
        ...current.filter((notice) => notice.storageKey !== storageKey),
        {
          storageKey,
          message: "Could not clear the saved draft from this tab.",
        },
      ]);
    }
  }

  function close(entry: HostedModal) {
    if (entry.storageKey) removeDraft(entry.storageKey);
    modals.current.delete(entry.id);
    setEntries(Array.from(modals.current.values()));
  }

  async function submit<T>(
    id: string,
    { draft, request, onSuccess }: ModalSubmission<T>,
  ) {
    const entry = modals.current.get(id);
    if (!active.current || entry?.state !== "open") return;
    const { error: _error, ...fields } = entry;
    const { form, formKey } = fields;
    const pending: HostedModal = { ...fields, state: "pending" };
    if (form.recovery) {
      try {
        saveModalDraft(id, {
          formKey,
          draft: form.recovery.serialize(draft),
          status: "pending",
        });
        pending.storageKey = id;
      } catch {
        show({
          ...entry,
          error: "Could not save the draft in this tab.",
        });
        return;
      }
    }

    show(pending);
    let result: ModalSubmissionResult<T> | undefined;
    try {
      result = await request();
    } catch {
      // The server may already have committed a write whose response was lost.
    }
    if (!active.current) return;
    if (result?.status === "success") {
      close(pending);
      await onSuccess?.(result.value);
      return;
    }

    let error = result?.status === "rejected"
      ? result.error || rejectedError
      : result?.error ? `${unknownError} ${result.error}` : unknownError;
    if (pending.storageKey && result?.status === "rejected") {
      try {
        recordModalRejection(pending.storageKey);
      } catch {
        error += " Could not save the submission result in this tab.";
      }
    }
    show({ ...pending, state: "open", error });
  }

  return (
    <ModalContext.Provider value={context}>
      {children}
      {entries.map(
        (entry) =>
          entry.state !== "recoverable" && (
            <entry.form.Form
              key={entry.id}
              initialDraft={entry.initialDraft}
              submit={(submission) => submit(entry.id, submission)}
              modalProps={{
                open: true,
                onClose: () => {
                  const current = modals.current.get(entry.id);
                  if (current?.state === "open") close(current);
                },
                title: entry.form.title,
                minimized: entry.state === "pending",
                error: entry.error,
              }}
            />
          ),
      )}
      {typeof document !== "undefined" &&
        createPortal(
          <div
            className="pointer-events-none fixed inset-x-4 bottom-4 flex max-h-[50dvh] flex-col gap-density-2 overflow-auto sm:left-auto sm:w-80"
            style={{ zIndex: zIndex.popover }}
          >
            {entries.map(
              (entry) =>
                entry.state !== "open" && (
                  <SubmissionCard
                    key={entry.id}
                    entry={entry}
                    onRestore={() => show({ ...entry, state: "open" })}
                    onDiscard={() => close(entry)}
                  />
                ),
            )}
            {notices.map(({ storageKey, message }) => (
              <div
                key={storageKey ?? message}
                className={`${cardClass} pointer-events-auto`}
              >
                <div role="alert">{message}</div>
                {storageKey && (
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="mt-density-2"
                    onClick={() => removeDraft(storageKey)}
                  >
                    Discard saved draft
                  </Button>
                )}
              </div>
            ))}
          </div>,
          document.body,
        )}
    </ModalContext.Provider>
  );
}

function SubmissionCard({
  entry,
  onRestore,
  onDiscard,
}: {
  entry: HostedModal;
  onRestore: () => void;
  onDiscard: () => void;
}) {
  if (entry.state === "pending") {
    return (
      <div
        data-slot="modal-submission-card"
        role="status"
        className={`${pendingCardClass} flex items-center gap-density-2`}
      >
        <LoadingDots className="size-4 motion-reduce:hidden" />
        <div className="min-w-0">
          <div className="wrap-break-word font-medium">{entry.form.title}</div>
          <div className="opacity-80">Submitting…</div>
        </div>
      </div>
    );
  }

  return (
    <div
      data-slot="modal-submission-card"
      className={`${cardClass} pointer-events-auto`}
    >
      <div className="wrap-break-word font-medium">{entry.form.title}</div>
      <div className="text-muted-foreground">
        {entry.error === unknownError ? unknownOutcome : "Submission rejected"}
      </div>
      <div className="mt-density-2 flex flex-wrap gap-density-2">
        <Button type="button" size="sm" variant="outline" onClick={onRestore}>
          Restore draft
        </Button>
        <Button type="button" size="sm" variant="ghost" onClick={onDiscard}>
          Discard
        </Button>
      </div>
    </div>
  );
}
