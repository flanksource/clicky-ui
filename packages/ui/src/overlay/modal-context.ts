import { createContext, useContext, type ComponentType } from "react";
import type { ModalProps } from "./Modal";

export type ModalDraft = Record<string, unknown>;

type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

export type ModalSubmissionResult<T> =
  | { status: "success"; value: T }
  | { status: "rejected"; error: string }
  | { status: "unknown"; error?: string };

export type ModalSubmission<T> = {
  draft: ModalDraft;
  /** Return a rejection when the server confirms the write failed. A throw leaves the outcome unknown. */
  request: () => Promise<ModalSubmissionResult<T>>;
  /** Runs after success. Handle callback errors independently from the mutation. */
  onSuccess?: (value: T) => void | Promise<void>;
};

export type HostedModalProps = {
  modalProps: Pick<
    ModalProps,
    "open" | "onClose" | "title" | "minimized" | "error"
  >;
  /** Seed the form's own draft state from this value so it survives minimization. */
  initialDraft: ModalDraft;
  submit: <T>(submission: ModalSubmission<T>) => Promise<void>;
};

export type ModalFormDefinition = {
  title: string;
  Form: ComponentType<HostedModalProps>;
  recovery?: {
    /** Select only the fields safe to retain in this tab. */
    serialize: (draft: ModalDraft) => Record<string, JsonValue>;
    /** Validate and decode the stored snapshot, throwing if it cannot be restored. */
    restore: (saved: unknown) => ModalDraft;
  };
};

export type ModalContextValue = {
  openModal: (formKey: string, initialDraft: ModalDraft) => void;
};

export const ModalContext = createContext<ModalContextValue | null>(null);

export function useModal(): ModalContextValue {
  const context = useContext(ModalContext);
  if (!context)
    throw new Error("useModal must be used within a <ModalProvider>");
  return context;
}
