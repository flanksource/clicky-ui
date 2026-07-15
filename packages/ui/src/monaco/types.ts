import type { ReactNode } from "react";
import type { editor } from "monaco-editor";
import type { Monaco } from "@monaco-editor/react";
import type { JsonSchemaObject } from "../components/json-schema-form-types";

export type MonacoValidationStatus = "loading" | "valid" | "invalid" | "unavailable";

export type MonacoValidationState = {
  status: MonacoValidationStatus;
  errors: string[];
};

export type MonacoWorkerFactory = (label: string) => Worker;

export type MonacoProviderProps = {
  getWorker: MonacoWorkerFactory;
  children: ReactNode;
};

export type MonacoEditorProps = {
  value: string;
  onChange: (value: string) => void;
  language: string;
  path: string;
  height?: string | number;
  beforeMount?: (monaco: Monaco) => void;
  onMount?: (editor: editor.IStandaloneCodeEditor, monaco: Monaco) => void;
  onValidate?: (markers: editor.IMarker[]) => void;
};

export type MonacoSchemaEditorProps = Omit<MonacoEditorProps, "language" | "beforeMount" | "onMount" | "onValidate"> & {
  language: "json" | "yaml";
  schema: JsonSchemaObject;
  schemaUri: string;
  onValidationChange: (state: MonacoValidationState) => void;
};
