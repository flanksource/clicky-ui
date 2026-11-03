import { isValidElement, type ReactElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import type {
  ConnectionLoggingCapability,
  ConnectionLoggingPolicyProps,
} from "../components/ConnectionLoggingPolicy.model";
import type { FieldControl } from "../components/json-schema-form-types";
import type { PostExtensionContext } from "../components/json-schema-form-runtime-types";
import { connectionLoggingFormExtensions } from "./connectionLogging";
import { fireEvent, render, screen } from "@testing-library/react";
import { ConnectionLoggingSummary } from "./ConnectionLoggingSummary";

const capability: ConnectionLoggingCapability = {
  family: "http",
  slowThreshold: "1s",
  thresholdLabel: "Slow threshold",
  events: [
    {
      event: "error",
      property: "log.level.error",
      label: "Errors",
      description: "Failed requests.",
      default: "error",
      captures: ["error"],
      example: { level: "error" },
      prettyExample: "[http/search] ERROR >=[82ms] [rows:0] request timed out",
    },
    {
      event: "http",
      property: "log.level.http",
      label: "Access summary",
      description: "Method and status.",
      default: "debug",
      captures: ["method", "status"],
      example: { level: "debug", status: 200 },
      prettyExample:
        "[http/search] POST https://api.example.test/_search 200 OK 86ms 512B",
    },
  ],
};

describe("compact connection logging", () => {
  it("keeps incomplete durations editable without applying them", () => {
    const onChange = vi.fn();
    render(
      <ConnectionLoggingSummary definition={capability} onChange={onChange} />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Edit logging" }));
    expect(
      screen.getByRole("dialog", { name: "Edit connection logging" }),
    ).toBeInTheDocument();
    expect(screen.queryByRole("menu")).toBeNull();
    fireEvent.change(screen.getByRole("textbox", { name: "Slow threshold" }), {
      target: { value: "2" },
    });
    expect(screen.getByRole("alert")).toHaveTextContent("positive duration");
    expect(screen.getByRole("button", { name: "Apply" })).toBeDisabled();
    fireEvent.change(screen.getByRole("textbox", { name: "Slow threshold" }), {
      target: { value: "2s" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Apply" }));
    expect(onChange).toHaveBeenCalledExactlyOnceWith({
      "log.slowThreshold": "2s",
    });
  });
  it("shows current levels without mounting the editor or preview", () => {
    render(
      <ConnectionLoggingSummary
        definition={capability}
        value={{ "log.level.http": "off" }}
        onChange={vi.fn()}
      />,
    );
    expect(screen.getByRole("button", { name: "Edit logging" })).toBeDefined();
    expect(screen.getByText("Access summary")).toBeDefined();
    expect(screen.getByText("off")).toBeDefined();
    expect(screen.queryByRole("radiogroup")).toBeNull();
    expect(screen.queryByTestId("connection-log-preview")).toBeNull();
  });
  it("applies draft changes only on Apply and preserves other properties", () => {
    const onChange = vi.fn();
    render(
      <ConnectionLoggingSummary
        definition={capability}
        value={{ kubecontext: "staging" }}
        onChange={onChange}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Edit logging" }));
    fireEvent.change(screen.getByRole("combobox", { name: "Errors level" }), {
      target: { value: "warn" },
    });
    expect(onChange).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Apply" }));
    expect(onChange).toHaveBeenCalledExactlyOnceWith({
      kubecontext: "staging",
      "log.level.error": "warn",
    });
  });
  it("discards cancelled changes and keeps read-only summaries uneditable", () => {
    const onChange = vi.fn();
    const { rerender } = render(
      <ConnectionLoggingSummary definition={capability} onChange={onChange} />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Edit logging" }));
    fireEvent.change(screen.getByRole("combobox", { name: "Errors level" }), {
      target: { value: "warn" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(onChange).not.toHaveBeenCalled();
    rerender(
      <ConnectionLoggingSummary
        definition={capability}
        onChange={onChange}
        readOnly
      />,
    );
    expect(screen.queryByRole("button", { name: "Edit logging" })).toBeNull();
  });
});

function field(): FieldControl {
  return {
    key: "logging",
    kind: "object",
    label: "Logging",
    required: false,
    schema: {
      "x-clicky-component": "connection-logging-policy",
      "x-clicky-logging": capability,
    },
    value: undefined,
    onChange: vi.fn(),
  };
}

describe("connectionLoggingFormExtensions", () => {
  it("turns the synthetic schema field into a full-width display surface", () => {
    const [pre] = connectionLoggingFormExtensions.pre;
    const transformed = pre?.(field(), {
      key: "logging",
      prop: field().schema,
      value: undefined,
    });

    expect(transformed).toMatchObject({
      kind: "display",
      displayVariant: "spacer",
      colSpan: "full",
    });
  });

  it("writes overrides into the root connection properties map", () => {
    const onRootChange = vi.fn();
    const ctx: PostExtensionContext = {
      rootValue: {
        name: "search",
        type: "opensearch",
        properties: { authType: "none" },
      },
      onRootChange,
    };
    const [post] = connectionLoggingFormExtensions.post;
    const nodes = post?.(
      field(),
      { label: <span>Logging</span>, value: null },
      ctx,
    );
    expect(renderToStaticMarkup(<>{nodes?.value}</>)).toContain(
      "Access summary",
    );

    type LoggingFieldProps = {
      field: FieldControl;
      ctx: PostExtensionContext;
    };
    if (!isValidElement<LoggingFieldProps>(nodes?.value)) {
      throw new Error("connection logging extension did not return a field");
    }
    const renderField = nodes.value.type as (
      props: LoggingFieldProps,
    ) => ReactElement<ConnectionLoggingPolicyProps>;
    const editor = renderField(nodes.value.props);

    editor.props.onChange({
      authType: "none",
      "log.level.http": "info",
    });
    expect(onRootChange).toHaveBeenCalledExactlyOnceWith({
      name: "search",
      type: "opensearch",
      properties: { authType: "none", "log.level.http": "info" },
    });
  });
});
