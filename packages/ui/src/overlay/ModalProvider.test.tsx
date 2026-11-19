import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { StrictMode, useState } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Modal } from "./Modal";
import { ModalProvider } from "./ModalProvider";
import {
  useModal,
  type HostedModalProps,
  type ModalDraft,
  type ModalFormDefinition,
  type ModalSubmissionResult,
} from "./modal-context";

type Result = ModalSubmissionResult<string>;
const scope = "test:account:workspace";
const initialDraft = { name: "Original", secret: "private" };
const submittedName = "Edited name";
const serverError = "This name is already taken";
const request = vi.fn<() => Promise<Result>>();
const onSuccess = vi.fn<(value: string) => void | Promise<void>>();

function EditForm({ modalProps, initialDraft, submit }: HostedModalProps) {
  const [draft, setDraft] = useState<ModalDraft>(initialDraft);
  return (
    <Modal
      {...modalProps}
      footer={
        <button
          type="button"
          onClick={() => {
            const attempt = { draft, request, onSuccess };
            void submit(attempt);
            void submit(attempt);
          }}
        >
          Save
        </button>
      }
    >
      <label>
        Name
        <input
          value={String(draft.name)}
          onChange={(event) => setDraft({ ...draft, name: event.target.value })}
        />
      </label>
    </Modal>
  );
}

const forms = {
  edit: {
    title: "Edit item",
    Form: EditForm,
    recovery: {
      serialize: (draft) => ({ name: String(draft.name) }),
      restore: (saved) => {
        if (
          !saved ||
          typeof saved !== "object" ||
          !("name" in saved) ||
          typeof saved.name !== "string"
        ) {
          throw new Error("Invalid saved name");
        }
        return { name: saved.name };
      },
    },
  },
  other: { title: "Edit another item", Form: EditForm },
} satisfies Record<string, ModalFormDefinition>;

function Page({ navigate }: { navigate: () => void }) {
  const { openModal } = useModal();
  return (
    <>
      <button type="button" onClick={() => openModal("edit", initialDraft)}>
        Edit
      </button>
      <button type="button" onClick={() => openModal("other", initialDraft)}>
        Edit another
      </button>
      <button type="button" onClick={navigate}>
        Go to another page
      </button>
    </>
  );
}

function App({ storageScope = scope }: { storageScope?: string }) {
  const [navigated, setNavigated] = useState(false);
  return (
    <StrictMode>
      <ModalProvider scope={storageScope} forms={forms}>
        {navigated ? (
          <button type="button" onClick={() => setNavigated(false)}>
            Back to items
          </button>
        ) : (
          <Page navigate={() => setNavigated(true)} />
        )}
      </ModalProvider>
    </StrictMode>
  );
}

function startEdit() {
  fireEvent.click(screen.getByRole("button", { name: "Edit", exact: true }));
  fireEvent.change(screen.getByRole("textbox", { name: "Name" }), {
    target: { value: submittedName },
  });
  fireEvent.click(screen.getByRole("button", { name: "Save" }));
}

beforeEach(() => {
  request.mockReset();
  onSuccess.mockReset();
  window.sessionStorage.clear();
});

afterEach(() => vi.restoreAllMocks());

describe("ModalProvider", () => {
  it("releases focus and Escape while pending, then restores the draft and error after a route change", async () => {
    const pending = Promise.withResolvers<Result>();
    request.mockReturnValueOnce(pending.promise);
    render(<App />);
    const trigger = screen.getByRole("button", { name: "Edit", exact: true });
    trigger.focus();
    startEdit();

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("Submitting…");
    expect(screen.getByRole("status")).toHaveClass("bg-primary", "text-primary-foreground");
    expect(trigger).toHaveFocus();
    expect(fireEvent.keyDown(document, { key: "Escape" })).toBe(true);
    expect(request).toHaveBeenCalledTimes(1);
    const saved = window.sessionStorage.getItem(window.sessionStorage.key(0)!);
    expect(saved).toContain(submittedName);
    expect(saved).not.toContain(initialDraft.secret);

    fireEvent.click(screen.getByRole("button", { name: "Go to another page" }));
    expect(trigger).not.toBeInTheDocument();
    await act(async () =>
      pending.resolve({ status: "rejected", error: serverError }),
    );

    const dialog = screen.getByRole("dialog", { name: "Edit item" });
    expect(dialog).toHaveFocus();
    expect(within(dialog).getByRole("textbox", { name: "Name" })).toHaveValue(
      submittedName,
    );
    expect(within(dialog).getByRole("alert")).toHaveTextContent(serverError);
    expect(within(dialog).getByRole("alert")).toHaveAttribute(
      "data-slot",
      "modal-error",
    );
    expect(
      screen.getByRole("button", { name: "Back to items" }),
    ).toBeInTheDocument();

    const retry = Promise.withResolvers<Result>();
    request.mockReturnValueOnce(retry.promise);
    fireEvent.click(within(dialog).getByRole("button", { name: "Save" }));
    await act(async () =>
      retry.resolve({ status: "success", value: submittedName }),
    );
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
    expect(window.sessionStorage.length).toBe(0);
    expect(onSuccess.mock.calls).toEqual([[submittedName]]);
  });

  it("restores an interrupted attempt from a fresh provider without dispatching a second request", async () => {
    const pending = Promise.withResolvers<Result>();
    request.mockReturnValueOnce(pending.promise);
    const previous = render(<App />);
    startEdit();
    previous.unmount();

    render(<App />);
    expect(screen.getByText("Submission outcome unknown")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Restore draft" }));
    expect(screen.getByRole("textbox", { name: "Name" })).toHaveValue(
      submittedName,
    );
    expect(screen.getByRole("alert")).toHaveTextContent(
      "Check whether the change was applied before retrying",
    );
    await act(async () =>
      pending.resolve({ status: "success", value: submittedName }),
    );
    expect(request).toHaveBeenCalledTimes(1);
    expect(onSuccess).not.toHaveBeenCalled();
    expect(window.sessionStorage.length).toBe(1);
    fireEvent.keyDown(document, { key: "Escape" });
    expect(window.sessionStorage.length).toBe(0);
  });

  it("keeps the submitted snapshot on rejection without persisting the server error", async () => {
    request.mockResolvedValueOnce({ status: "rejected", error: serverError });
    const previous = render(<App />);
    startEdit();
    expect(await screen.findByText(serverError)).toBeInTheDocument();
    expect(
      window.sessionStorage.getItem(window.sessionStorage.key(0)!),
    ).not.toContain(serverError);
    previous.unmount();

    render(<App />);
    fireEvent.click(screen.getByRole("button", { name: "Restore draft" }));
    expect(screen.getByRole("textbox", { name: "Name" })).toHaveValue(
      submittedName,
    );
    expect(screen.getByRole("alert")).toHaveTextContent(
      "The previous submission was rejected",
    );
    expect(request).toHaveBeenCalledTimes(1);
  });

  it("reports an unknown outcome when the request throws", async () => {
    request.mockRejectedValueOnce(new TypeError("Failed to fetch"));
    render(<App />);
    startEdit();
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Submission outcome unknown",
    );
    expect(onSuccess).not.toHaveBeenCalled();
  });

  it("settles two pending dialogs independently", async () => {
    const first = Promise.withResolvers<Result>();
    const second = Promise.withResolvers<Result>();
    request
      .mockReturnValueOnce(first.promise)
      .mockReturnValueOnce(second.promise);
    render(<App />);
    startEdit();
    fireEvent.click(screen.getByRole("button", { name: "Edit another" }));
    fireEvent.click(screen.getByRole("button", { name: "Save" }));
    expect(screen.getAllByRole("status")).toHaveLength(2);
    await act(async () =>
      second.resolve({ status: "success", value: "Other item" }),
    );
    expect(screen.getByRole("status")).toHaveTextContent("Edit item");
    await act(async () =>
      first.resolve({ status: "rejected", error: serverError }),
    );
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
    expect(screen.getByRole("dialog", { name: "Edit item" })).toHaveTextContent(
      serverError,
    );
    expect(onSuccess.mock.calls).toEqual([["Other item"]]);
  });

  it("keeps the dialog open when the snapshot cannot be saved", () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("Storage full");
    });
    render(<App />);
    startEdit();
    expect(screen.getByRole("dialog")).toContainElement(
      screen.getByRole("alert"),
    );
    expect(screen.getByRole("alert")).toHaveTextContent(
      "Could not save the draft",
    );
    expect(request).not.toHaveBeenCalled();
  });

  it("leaves a successful submission closed when saved-draft cleanup fails", async () => {
    vi.spyOn(Storage.prototype, "removeItem").mockImplementation(() => {
      throw new Error("Storage blocked");
    });
    request.mockResolvedValueOnce({ status: "success", value: submittedName });
    render(<App />);
    startEdit();
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Could not clear the saved draft",
    );
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(onSuccess.mock.calls).toEqual([[submittedName]]);
  });

  it("isolates storage by scope and lets the user discard unreadable drafts", () => {
    const key = `clicky.modal.${encodeURIComponent(`${scope}.subspace`)}:invalid`;
    window.sessionStorage.setItem(key, "not JSON");
    const { rerender } = render(<App />);
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    rerender(<App storageScope={`${scope}.subspace`} />);
    expect(screen.getByRole("alert")).toHaveTextContent(
      "Could not restore a saved draft",
    );
    fireEvent.click(
      screen.getByRole("button", { name: "Discard saved draft" }),
    );
    expect(window.sessionStorage.getItem(key)).toBeNull();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("removes a minimized mobile dialog immediately", () => {
    vi.spyOn(window, "matchMedia").mockImplementation((query) => ({
      media: query,
      matches: query === "(max-width: 639px)",
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));
    request.mockReturnValueOnce(Promise.withResolvers<Result>().promise);
    render(<App />);
    startEdit();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("Submitting…");
  });
});
