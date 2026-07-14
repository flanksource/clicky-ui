import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, expect, it, vi } from "vitest";
import { SchemaActionForm } from "./SchemaActionForm";
import { collectionPath } from "./schemaActionPath";
import type { ResolvedOperation } from "./types";
import type { OperationsApiClient } from "./useOperations";

vi.mock("../monaco/MonacoSchemaEditor", async () => {
  const React = await import("react");
  return {
    MonacoSchemaEditor: ({
      value,
      onChange,
      onValidationChange,
    }: {
      value: string;
      onChange: (value: string) => void;
      onValidationChange: (state: {
        status: "valid";
        errors: string[];
      }) => void;
    }) => {
      React.useEffect(
        () => onValidationChange({ status: "valid", errors: [] }),
        [value],
      );
      return (
        <textarea
          aria-label="YAML editor"
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
      );
    },
  };
});

function renderForm(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>,
  );
}

const createAction: ResolvedOperation = {
  path: "/api/v1/connection",
  method: "post",
  operation: {} as ResolvedOperation["operation"],
};

function baseClient(
  overrides: Partial<OperationsApiClient> = {},
): OperationsApiClient {
  return {
    getOpenAPISpec: vi.fn(),
    executeCommand: vi.fn(),
    ...overrides,
  };
}

describe("collectionPath", () => {
  it("strips a trailing /{id} segment", () => {
    expect(collectionPath("/api/v1/connection/{id}")).toBe(
      "/api/v1/connection",
    );
    expect(collectionPath("/api/v1/connection")).toBe("/api/v1/connection");
  });
});

describe("SchemaActionForm", () => {
  it("renders the fallback when the resource exposes no schema", async () => {
    const client = baseClient({
      getSchema: vi.fn(async () => undefined),
      submitForm: vi.fn(),
    });
    renderForm(
      <SchemaActionForm
        client={client}
        action={createAction}
        fallback={<div>param form</div>}
      />,
    );
    expect(await screen.findByText("param form")).toBeInTheDocument();
  });

  it("renders the fallback when the client cannot fetch schemas", () => {
    renderForm(
      <SchemaActionForm
        client={baseClient()}
        action={createAction}
        fallback={<div>param form</div>}
      />,
    );
    expect(screen.getByText("param form")).toBeInTheDocument();
  });

  it("submits the nested form value via submitForm and reports success", async () => {
    const submitForm = vi.fn(async () => ({ success: true }) as never);
    const onSuccess = vi.fn();
    const initialValue = {
      name: "pg",
      type: "postgres",
      properties: { sslmode: "disable" },
    };
    const client = baseClient({
      getSchema: vi.fn(async () => ({
        type: "object",
        properties: { name: { type: "string", title: "Name" } },
      })),
      submitForm,
    });

    renderForm(
      <SchemaActionForm
        client={client}
        action={createAction}
        initialValue={initialValue}
        onSuccess={onSuccess}
        fallback={<div>param form</div>}
      />,
    );

    const save = await screen.findByRole("button", { name: "Save" });
    fireEvent.click(save);

    await waitFor(() => expect(submitForm).toHaveBeenCalledTimes(1));
    expect(submitForm).toHaveBeenCalledWith(
      "/api/v1/connection",
      "POST",
      initialValue,
      expect.objectContaining({ Accept: "application/json+clicky" }),
    );
    expect(onSuccess).toHaveBeenCalledTimes(1);
  });

  it("edits and submits the same draft through the YAML tab", async () => {
    const submitForm = vi.fn(async () => ({ success: true }) as never);
    const client = baseClient({
      getSchema: vi.fn(async () => ({
        type: "object",
        properties: { name: { type: "string", title: "Name" } },
      })),
      submitForm,
    });

    renderForm(
      <SchemaActionForm
        client={client}
        action={createAction}
        initialValue={{ name: "before" }}
        fallback={<div>param form</div>}
      />,
    );

    fireEvent.click(await screen.findByRole("tab", { name: "YAML" }));
    const editor = await screen.findByRole("textbox", { name: "YAML editor" });
    expect(editor).toHaveValue("name: before\n");
    fireEvent.change(editor, {
      target: { value: "name: after\nproperties:\n  sslmode: disable\n" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() => expect(submitForm).toHaveBeenCalledTimes(1));
    expect(submitForm.mock.calls[0][2]).toEqual({
      name: "after",
      properties: { sslmode: "disable" },
    });
  });

  it("blocks submission while the YAML draft is invalid", async () => {
    const submitForm = vi.fn(async () => ({ success: true }) as never);
    const client = baseClient({
      getSchema: vi.fn(async () => ({ type: "object", properties: {} })),
      submitForm,
    });

    renderForm(
      <SchemaActionForm
        client={client}
        action={createAction}
        fallback={<div>param form</div>}
      />,
    );

    fireEvent.click(await screen.findByRole("tab", { name: "YAML" }));
    fireEvent.change(screen.getByRole("textbox", { name: "YAML editor" }), {
      target: { value: "name: [" },
    });

    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Save" })).toBeDisabled();
    expect(submitForm).not.toHaveBeenCalled();
  });

  it("returns to Form from invalid YAML using the last valid value", async () => {
    const submitForm = vi.fn(async () => ({ success: true }) as never);
    const client = baseClient({
      getSchema: vi.fn(async () => ({
        type: "object",
        properties: { name: { type: "string", title: "Name" } },
      })),
      submitForm,
    });

    renderForm(
      <SchemaActionForm
        client={client}
        action={createAction}
        initialValue={{ name: "before" }}
        fallback={<div>param form</div>}
      />,
    );

    fireEvent.click(await screen.findByRole("tab", { name: "YAML" }));
    fireEvent.change(screen.getByRole("textbox", { name: "YAML editor" }), {
      target: { value: "name: [" },
    });
    expect(screen.getByRole("button", { name: "Save" })).toBeDisabled();

    fireEvent.click(screen.getByRole("tab", { name: "Form" }));

    expect(screen.getByRole("tabpanel", { name: "Form" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Save" })).toBeEnabled();
    fireEvent.click(screen.getByRole("button", { name: "Save" }));
    await waitFor(() => expect(submitForm).toHaveBeenCalledTimes(1));
    expect(submitForm.mock.calls[0][2]).toEqual({ name: "before" });
  });

  it("exposes separate body and footer slots to dialog layouts", async () => {
    const client = baseClient({
      getSchema: vi.fn(async () => ({
        type: "object",
        properties: { name: { type: "string", title: "Name" } },
      })),
      submitForm: vi.fn(),
    });

    renderForm(
      <SchemaActionForm
        client={client}
        action={createAction}
        fallback={<div>param form</div>}
        renderLayout={({ body, footer }) => (
          <>
            <div data-testid="form-body">{body}</div>
            <div data-testid="form-footer">{footer}</div>
          </>
        )}
      />,
    );

    const save = await screen.findByRole("button", { name: "Save" });
    expect(screen.getByTestId("form-body")).not.toContainElement(save);
    expect(screen.getByTestId("form-footer")).toContainElement(save);
  });

  it("resolves the {id} path param from lockedValues when updating", async () => {
    const submitForm = vi.fn(async () => ({ success: true }) as never);
    const client = baseClient({
      getSchema: vi.fn(async () => ({ type: "object", properties: {} })),
      submitForm,
    });
    const updateAction: ResolvedOperation = {
      path: "/api/v1/connection/{id}",
      method: "put",
      operation: {} as ResolvedOperation["operation"],
    };

    renderForm(
      <SchemaActionForm
        client={client}
        action={updateAction}
        lockedValues={{ id: "abc-123" }}
        fallback={<div>param form</div>}
      />,
    );

    fireEvent.click(await screen.findByRole("button", { name: "Save" }));
    await waitFor(() => expect(submitForm).toHaveBeenCalledTimes(1));
    expect(submitForm.mock.calls[0][0]).toBe("/api/v1/connection/abc-123");
    expect(submitForm.mock.calls[0][1]).toBe("PUT");
    expect(submitForm.mock.calls[0][2]).toEqual({});
  });

  it("includes a locked entity id in collection-path update bodies", async () => {
    const submitForm = vi.fn(async () => ({ success: true }) as never);
    const client = baseClient({
      getSchema: vi.fn(async () => ({
        type: "object",
        properties: {
          profile: { type: "string" },
          provider: { type: "object" },
        },
      })),
      submitForm,
    });
    const updateAction: ResolvedOperation = {
      path: "/api/v1/profiles",
      method: "put",
      operation: {} as ResolvedOperation["operation"],
    };

    renderForm(
      <SchemaActionForm
        client={client}
        action={updateAction}
        lockedValues={{ id: "OS" }}
        initialValue={{
          profile: "OS",
          provider: { type: "opensearch", connection: "connection://OS" },
        }}
        fallback={<div>param form</div>}
      />,
    );

    fireEvent.click(await screen.findByRole("button", { name: "Save" }));
    await waitFor(() => expect(submitForm).toHaveBeenCalledTimes(1));
    expect(submitForm).toHaveBeenCalledWith(
      "/api/v1/profiles",
      "PUT",
      {
        id: "OS",
        profile: "OS",
        provider: { type: "opensearch", connection: "connection://OS" },
      },
      expect.objectContaining({ Accept: "application/json+clicky" }),
    );
  });
});
