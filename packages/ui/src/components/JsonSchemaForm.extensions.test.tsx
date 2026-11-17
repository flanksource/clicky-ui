import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { Component, type ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { JsonSchemaForm } from "./JsonSchemaForm";
import type { FormExtension, FormExtensionSource, LayoutEngine } from "./json-schema-form-extension-api";
import { withoutExtensionSources } from "./json-schema-form-schema-extensions";
import type { JsonSchemaFormProps, JsonSchemaObject, LookupFetcher } from "./json-schema-form-types";

const PREFS_KEY = "json-schema-form-extensions-test";

function renderForm(schema: JsonSchemaObject, extra: Partial<JsonSchemaFormProps> = {}) {
  const onChange = vi.fn();
  const view = render(
    <JsonSchemaForm
      schema={schema}
      value={{}}
      onChange={onChange}
      applyDefaults={false}
      showPreferencesMenu={false}
      persistPreferences={false}
      preferencesStorageKey={PREFS_KEY}
      {...extra}
    />,
  );
  return { ...view, onChange };
}

afterEach(() => {
  localStorage.clear();
  vi.restoreAllMocks();
});

const swatchExtension: FormExtension = {
  name: "swatch",
  formats: {
    swatch: ({ value, onChange, fieldId, readOnly }) => (
      <button type="button" id={fieldId} data-testid="swatch" disabled={readOnly} onClick={() => onChange("#0ea5e9")}>
        {String(value ?? "none")}
      </button>
    ),
  },
};

describe("custom field types (formats)", () => {
  const schema: JsonSchemaObject = {
    type: "object",
    properties: {
      accent: { type: "string", title: "Accent", format: "swatch" },
      email: { type: "string", title: "Email", format: "email" },
    },
  };

  it("renders the registered renderer for its format and commits through onChange", () => {
    const { onChange } = renderForm(schema, { extensions: [swatchExtension] });
    fireEvent.click(screen.getByTestId("swatch"));
    expect(onChange).toHaveBeenCalledWith({ accent: "#0ea5e9" });
  });

  it("hands the renderer the field value, field id and read-only state", () => {
    renderForm(schema, { extensions: [swatchExtension], value: { accent: "#fff" }, readOnly: true });
    const swatch = screen.getByTestId("swatch");
    expect(swatch).toHaveTextContent("#fff");
    expect(swatch).toBeDisabled();
    expect(screen.getByLabelText("Accent")).toBe(swatch);
  });

  it("keeps rendering an unregistered standard format such as email as a text input", () => {
    renderForm(schema, { extensions: [swatchExtension] });
    expect(screen.getByLabelText("Email")).toHaveAttribute("data-jsf-input");
  });

  it("throws when an extension registers a reserved format", () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => renderForm(schema, { extensions: [{ name: "bad", formats: { md: () => null } }] })).toThrow(
      /reserved format "md"/,
    );
  });

  it("gives pre extensions the custom field and lets post extensions decorate it", () => {
    const seenKinds: string[] = [];
    const decorated: FormExtension = {
      ...swatchExtension,
      name: "decorated",
      pre: [(field) => (seenKinds.push(`${field.key}:${field.kind}:${field.format ?? ""}`), field)],
      post: [(field, nodes) => (field.format === "swatch" ? { ...nodes, label: <>{nodes.label}<i data-testid="mark" /></> } : nodes)],
    };
    renderForm(schema, { extensions: [decorated] });
    expect(seenKinds).toContain("accent:custom:swatch");
    expect(seenKinds).toContain("email:string:");
    expect(screen.getAllByTestId("mark")).toHaveLength(1);
  });
});

describe("lookup handlers", () => {
  const schema: JsonSchemaObject = {
    type: "object",
    properties: {
      owner: { type: "string", title: "Owner", "x-clicky-lookup": { url: "ext:team", filter: "id" } },
      cluster: { type: "string", title: "Cluster", "x-clicky-lookup": { url: "/api/v1/cluster", filter: "id" } },
    },
  };

  it("routes a registered url to the extension handler and any other url to lookupFetcher", async () => {
    const handler = vi.fn<LookupFetcher>(async () => [{ value: "ada", label: "Ada" }]);
    const lookupFetcher = vi.fn<LookupFetcher>(async () => [{ value: "c1", label: "C1" }]);
    renderForm(schema, { extensions: [{ name: "team", lookups: { "ext:team": handler } }], lookupFetcher });
    await waitFor(() => expect(handler).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(lookupFetcher).toHaveBeenCalledTimes(1));
    expect(handler.mock.calls[0]![0].descriptor.url).toBe("ext:team");
    expect(lookupFetcher.mock.calls[0]![0].descriptor.url).toBe("/api/v1/cluster");
  });

  it("serves an extension lookup without any lookupFetcher", async () => {
    const handler = vi.fn<LookupFetcher>(async () => []);
    renderForm(schema, { extensions: [{ name: "team", lookups: { "ext:team": handler } }] });
    await waitFor(() => expect(handler).toHaveBeenCalledTimes(1));
  });
});

describe("layout engines", () => {
  const nested: JsonSchemaObject = {
    type: "object",
    properties: {
      name: { type: "string", title: "Name" },
      db: {
        type: "object",
        title: "Database",
        properties: { host: { type: "string", title: "Host" } },
      },
    },
  };
  const cards: LayoutEngine = {
    Grid: ({ children }) => <div data-testid="cards-grid">{children}</div>,
    Row: (row) => (
      <section data-testid={`card-${row.field.key}`}>
        <h4>{row.label}</h4>
        {row.value}
      </section>
    ),
  };
  const layoutExtension: FormExtension = { name: "layouts", layouts: { cards } };

  it("renders the engine's Grid and Row for a form layout.mode, at nested depth too", () => {
    renderForm(nested, { extensions: [layoutExtension], layout: { mode: "cards" } });
    expect(screen.getByTestId("card-name")).toBeInTheDocument();
    const dbCard = screen.getByTestId("card-db");
    expect(within(dbCard).getByTestId("card-host")).toBeInTheDocument();
    expect(screen.getAllByTestId("cards-grid")).toHaveLength(2);
  });

  it("applies a field-level x-layout engine to that one row only", () => {
    const schema: JsonSchemaObject = {
      type: "object",
      properties: {
        name: { type: "string", title: "Name" },
        tags: { type: "string", title: "Tags", "x-layout": "cards" },
      },
    };
    renderForm(schema, { extensions: [layoutExtension] });
    expect(screen.getByTestId("card-tags")).toBeInTheDocument();
    expect(screen.queryByTestId("card-name")).not.toBeInTheDocument();
    expect(screen.queryByTestId("cards-grid")).not.toBeInTheDocument();
    expect(screen.getByLabelText("Name")).toBeInTheDocument();
  });

  it("hands the engine every array row, so the built-in empty-array picker never steps in for it", () => {
    const list = (title: string) => ({ type: "array" as const, title, items: { type: "string" as const } });
    const arrays: JsonSchemaObject = {
      type: "object",
      properties: { a: list("A"), b: list("B"), c: list("C"), d: list("D") },
    };
    renderForm(arrays, { extensions: [layoutExtension], layout: { mode: "cards" } });
    expect(["a", "b", "c", "d"].map((key) => screen.queryByTestId(`card-${key}`) !== null)).toEqual([true, true, true, true]);
    expect(screen.queryByRole("combobox", { name: "Add item" })).not.toBeInTheDocument();
  });

  it("throws for an unregistered layout.mode", () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => renderForm(nested, { layout: { mode: "masonry" } })).toThrow(/form layout "masonry".*not registered/);
  });

  it("throws for an unregistered field x-layout, naming the field", () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const schema: JsonSchemaObject = {
      type: "object",
      properties: { tags: { type: "string", "x-layout": "chips" } },
    };
    expect(() => renderForm(schema, { extensions: [layoutExtension] })).toThrow(/layout "chips" on field "tags"/);
  });

  it("throws when an extension registers a reserved layout", () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => renderForm(nested, { extensions: [{ name: "bad", layouts: { table: cards } }] })).toThrow(
      /reserved layout "table"/,
    );
  });

  it("lists registered engines after the built-in layouts in the preferences menu", () => {
    renderForm(nested, {
      extensions: [layoutExtension],
      layout: { mode: "cards" },
      showPreferencesMenu: true,
    });
    fireEvent.click(screen.getByRole("button", { name: "Form display options" }));
    const options = screen.getAllByRole("menuitemradio").map((item) => item.textContent);
    expect(options.slice(options.indexOf("Stacked"), options.indexOf("Stacked") + 4)).toEqual([
      "Stacked",
      "Inline",
      "Properties",
      "cards",
    ]);
    expect(screen.getByRole("menuitemradio", { name: "cards" })).toHaveAttribute("aria-checked", "true");
  });
});

describe("slots", () => {
  const schema: JsonSchemaObject = {
    type: "object",
    properties: {
      name: { type: "string", title: "Name" },
      db: { type: "object", title: "Database", properties: { host: { type: "string", title: "Host" } } },
    },
  };

  it("replaces Title", () => {
    renderForm(schema, {
      title: "Service",
      extensions: [{ name: "s", slots: { Title: ({ title }) => <h2 data-testid="title">{title}!</h2> } }],
    });
    expect(screen.getByTestId("title")).toHaveTextContent("Service!");
    expect(screen.queryByRole("heading", { level: 3 })).not.toBeInTheDocument();
  });

  it("replaces ErrorSummary with the unmatched errors", () => {
    renderForm(schema, {
      errors: [{ instancePath: "/gone", message: "boom" }],
      extensions: [{ name: "s", slots: { ErrorSummary: ({ errors }) => <aside data-testid="summary">{errors.length}</aside> } }],
    });
    expect(screen.getByTestId("summary")).toHaveTextContent("1");
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("replaces NoMatches when the filter hides every field", () => {
    renderForm(schema, {
      showFilter: true,
      extensions: [{ name: "s", slots: { NoMatches: ({ filter }) => <p data-testid="none">nothing for {filter}</p> } }],
    });
    fireEvent.change(screen.getByLabelText("Filter fields"), { target: { value: "zzz" } });
    expect(screen.getByTestId("none")).toHaveTextContent("nothing for zzz");
  });

  it("replaces FieldFilter", () => {
    renderForm(schema, {
      showFilter: true,
      extensions: [{ name: "s", slots: { FieldFilter: () => <div data-testid="filter" /> } }],
    });
    expect(screen.getByTestId("filter")).toBeInTheDocument();
    expect(screen.queryByLabelText("Filter fields")).not.toBeInTheDocument();
  });

  it("replaces PreferencesMenu", () => {
    renderForm(schema, {
      showPreferencesMenu: true,
      extensions: [{ name: "s", slots: { PreferencesMenu: () => <div data-testid="menu" /> } }],
    });
    expect(screen.getByTestId("menu")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Form display options" })).not.toBeInTheDocument();
  });

  it("replaces SectionHeading for an object section", () => {
    renderForm(schema, {
      extensions: [{ name: "s", slots: { SectionHeading: ({ field }) => <b data-testid="heading">{field.label}</b> } }],
    });
    expect(screen.getByTestId("heading")).toHaveTextContent("Database");
  });

  it("replaces FieldError for a field with a host error", () => {
    renderForm(schema, {
      errors: [{ instancePath: "/name", message: "too short" }],
      extensions: [{ name: "s", slots: { FieldError: ({ errors }) => <em data-testid="field-error">{errors[0]!.message}</em> } }],
    });
    expect(screen.getByTestId("field-error")).toHaveTextContent("too short");
  });
});

class Boundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  override state = { error: null as Error | null };
  static getDerivedStateFromError(error: Error) {
    return { error };
  }
  override render() {
    return this.state.error ? <p role="alert">{this.state.error.message}</p> : this.props.children;
  }
}

describe("schema-declared extensions (x-clicky-extensions)", () => {
  const declared = (...sources: FormExtensionSource[]): JsonSchemaObject => ({
    type: "object",
    "x-clicky-extensions": sources,
    properties: { accent: { type: "string", title: "Accent", format: "swatch" } },
  });
  const ref = { ref: "examples/swatch.tsx" } as const;
  const renderBounded = (schema: JsonSchemaObject, extra: Partial<JsonSchemaFormProps>) =>
    render(
      <Boundary>
        <JsonSchemaForm schema={schema} value={{}} onChange={vi.fn()} applyDefaults={false} showPreferencesMenu={false} persistPreferences={false} {...extra} />
      </Boundary>,
    );

  it("loads each declared source through the loader, then renders its format", async () => {
    const extensionLoader = vi.fn(async () => swatchExtension);
    const { onChange } = renderForm(declared(ref), { extensionLoader });
    fireEvent.click(await screen.findByTestId("swatch"));
    expect(onChange).toHaveBeenCalledWith({ accent: "#0ea5e9" });
    expect(extensionLoader).toHaveBeenCalledTimes(1);
    expect(extensionLoader).toHaveBeenCalledWith(ref, 0);
  });

  it("shows Loading while the loader is pending", async () => {
    let resolve!: (ext: FormExtension) => void;
    const extensionLoader = vi.fn(() => new Promise<FormExtension>((done) => (resolve = done)));
    renderForm(declared(ref), { extensionLoader });
    expect(screen.getByRole("status", { name: "Loading" })).toBeInTheDocument();
    expect(screen.queryByTestId("swatch")).not.toBeInTheDocument();
    resolve(swatchExtension);
    expect(await screen.findByTestId("swatch")).toBeInTheDocument();
    expect(screen.queryByRole("status", { name: "Loading" })).not.toBeInTheDocument();
  });

  it("throws when the schema declares sources and no loader was provided", () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => renderForm(declared(ref))).toThrow(
      "schema declares x-clicky-extensions but no extensionLoader was provided; render it with PageForm or pass extensionLoader",
    );
  });

  it("does not need a loader when the declared list is empty", () => {
    renderForm(declared(), { extensions: [swatchExtension] });
    expect(screen.getByTestId("swatch")).toBeInTheDocument();
  });

  it("surfaces a loader rejection through an error boundary", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const extensionLoader = vi.fn(async () => {
      throw new Error("cannot load examples/swatch.tsx");
    });
    renderBounded(declared(ref), { extensionLoader });
    expect(await screen.findByRole("alert")).toHaveTextContent("cannot load examples/swatch.tsx");
  });

  it("throws on merge when a declared source duplicates a format from the extensions prop", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const extensionLoader = vi.fn(async () => ({ ...swatchExtension, name: "declared" }));
    renderBounded(declared(ref), { extensions: [swatchExtension], extensionLoader });
    expect(await screen.findByRole("alert")).toHaveTextContent(/"declared" cannot register format "swatch".*"swatch"/);
  });

  it("composes declared extensions after the extensions prop", async () => {
    const order: string[] = [];
    const hook = (name: string): FormExtension => ({ name, pre: [(field) => (order.push(name), field)] });
    renderForm(declared(ref), { extensions: [hook("prop")], extensionLoader: async () => ({ ...swatchExtension, ...hook("declared") }) });
    await screen.findByTestId("swatch");
    expect(order.slice(0, 2)).toEqual(["prop", "declared"]);
  });

  it("loads once across re-renders and again only when the declared sources change", async () => {
    const extensionLoader = vi.fn(async (_source: FormExtensionSource, index: number) =>
      index === 0 ? swatchExtension : { name: `extra-${index}` },
    );
    const props = { value: {}, onChange: vi.fn(), applyDefaults: false, showPreferencesMenu: false, persistPreferences: false, extensionLoader };
    const { rerender } = render(<JsonSchemaForm schema={declared(ref)} {...props} />);
    await screen.findByTestId("swatch");
    rerender(<JsonSchemaForm schema={{ ...declared(ref) }} {...props} extensionLoader={vi.fn(extensionLoader)} />);
    await screen.findByTestId("swatch");
    expect(extensionLoader).toHaveBeenCalledTimes(1);
    rerender(<JsonSchemaForm schema={declared(ref, { tsx: "export default {}", name: "x" })} {...props} />);
    await waitFor(() => expect(extensionLoader).toHaveBeenCalledTimes(3));
  });

  it("strips the keyword from the schema the renderer walks", () => {
    const schema = declared(ref);
    const stripped = withoutExtensionSources(schema);
    expect("x-clicky-extensions" in stripped).toBe(false);
    expect(schema["x-clicky-extensions"]).toEqual([ref]);
    const plain: JsonSchemaObject = { type: "object", properties: {} };
    expect(withoutExtensionSources(plain)).toBe(plain);
  });
});

describe("pre/post composition", () => {
  it("runs the pre and post props before extension pre and post hooks", () => {
    const preCalls: string[] = [];
    const postCalls: string[] = [];
    const schema: JsonSchemaObject = { type: "object", properties: { name: { type: "string", title: "Name" } } };
    renderForm(schema, {
      pre: [(field) => (preCalls.push("prop"), field)],
      post: [(_field, nodes) => (postCalls.push("prop"), nodes)],
      extensions: [
        { name: "first", pre: [(field) => (preCalls.push("first"), field)], post: [(_f, nodes) => (postCalls.push("first"), nodes)] },
        { name: "second", pre: [(field) => (preCalls.push("second"), field)], post: [(_f, nodes) => (postCalls.push("second"), nodes)] },
      ],
    });
    expect(preCalls.slice(0, 3)).toEqual(["prop", "first", "second"]);
    expect(postCalls.slice(0, 3)).toEqual(["prop", "first", "second"]);
  });
});
