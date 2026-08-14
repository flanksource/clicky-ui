import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";

import type {
  JsonSchemaObject,
  PostExtension,
  PreExtension,
} from "../../components/json-schema-form-types";
import {
  configureProfiles,
  profileFormExtensions,
  type ProfileSchema,
} from "../profileApi";
import { ProfileSchemaSection } from "./profileEditorSections";

/**
 * A minimal profile schema carrying one field tagged with a host widget.
 *
 * The point of the specs below is that a host's widget reaches the editor at
 * all: `x-clicky-component` is a hint the schema generator emits and only the
 * host can honour, so a form that drops the host's extensions renders the raw
 * control and silently ignores the hint.
 */
const SCHEMA = {
  type: "object",
  properties: {
    query: {
      type: "string",
      title: "Query",
      "x-clicky-component": "host-widget",
    },
    render: { type: "string", title: "Render" },
  },
} as unknown as ProfileSchema;

const hostWidget: PostExtension = (field, nodes) => {
  if (field.schema["x-clicky-component"] !== "host-widget") return nodes;
  return {
    label: nodes.label,
    value: <div data-testid="host-widget">HOST WIDGET</div>,
  };
};

const renderSection = (keys: string[]) =>
  renderToStaticMarkup(
    <ProfileSchemaSection
      draft={{ profile: "p", query: "select 1" }}
      keys={keys}
      title="Section"
      description="A section."
      idPrefix="section"
      onChange={vi.fn()}
    />,
  );

afterEach(() => {
  configureProfiles({ schema: SCHEMA });
});

describe("profileFormExtensions", () => {
  it("is empty until a host supplies any", () => {
    configureProfiles({ schema: SCHEMA });

    expect(profileFormExtensions()).toEqual({ pre: [], post: [] });
  });

  it("keeps what the host registered at boot", () => {
    const pre: PreExtension[] = [
      (_field, schema) => schema as JsonSchemaObject,
    ];
    configureProfiles({
      schema: SCHEMA,
      formExtensions: { pre, post: [hostWidget] },
    });

    expect(profileFormExtensions().post).toEqual([hostWidget]);
    expect(profileFormExtensions().pre).toEqual(pre);
  });

  it("clears previously registered extensions when reconfigured without any", () => {
    configureProfiles({
      schema: SCHEMA,
      formExtensions: { post: [hostWidget] },
    });
    configureProfiles({ schema: SCHEMA });

    expect(profileFormExtensions().post).toEqual([]);
  });
});

describe("ProfileSchemaSection", () => {
  it("renders a host widget for a field the schema tags with one", () => {
    configureProfiles({
      schema: SCHEMA,
      formExtensions: { post: [hostWidget] },
    });

    expect(renderSection(["query"])).toContain("HOST WIDGET");
  });

  it("renders the plain control when no host extension claims the field", () => {
    configureProfiles({ schema: SCHEMA });

    const html = renderSection(["query"]);
    expect(html).not.toContain("HOST WIDGET");
    expect(html).toContain("Query");
  });

  it("leaves fields the extension does not match alone", () => {
    configureProfiles({
      schema: SCHEMA,
      formExtensions: { post: [hostWidget] },
    });

    const html = renderSection(["render"]);
    expect(html).not.toContain("HOST WIDGET");
    expect(html).toContain("Render");
  });

  // The gap this closes was reported against the wizard, not the section: the
  // Advanced pane is where `processors` is edited, and a host widget for it was
  // being dropped on the way through.
  it("carries a host widget into the wizard's Advanced pane", () => {
    configureProfiles({
      schema: {
        type: "object",
        properties: {
          processors: {
            type: "array",
            title: "Processors",
            "x-clicky-component": "host-widget",
            items: { type: "object", properties: {} },
          },
        },
      } as unknown as ProfileSchema,
      formExtensions: { post: [hostWidget] },
    });

    const html = renderToStaticMarkup(
      <ProfileSchemaSection
        draft={{ profile: "p", processors: [{ use: "java.stacktrace" }] }}
        keys={["processors"]}
        title="Advanced composition"
        description="Compose profiles."
        idPrefix="profile-advanced"
        onChange={vi.fn()}
      />,
    );

    expect(html).toContain("Advanced composition");
    expect(html).toContain("HOST WIDGET");
  });

  it("gives an Advanced widget the full profile rather than only its projected fields", () => {
    let root: Record<string, unknown> | undefined;
    const readRoot: PostExtension = (field, nodes, ctx) => {
      if (field.key === "processors") root = ctx?.rootValue;
      return nodes;
    };
    configureProfiles({
      schema: {
        type: "object",
        properties: {
          processors: {
            type: "array",
            items: { type: "object", properties: {} },
          },
        },
      } as unknown as ProfileSchema,
      formExtensions: { post: [readRoot] },
    });

    renderToStaticMarkup(
      <ProfileSchemaSection
        draft={{ profile: "logs", provider: { type: "loki" }, processors: [] }}
        keys={["processors"]}
        title="Advanced composition"
        description="Compose profiles."
        idPrefix="profile-advanced"
        onChange={vi.fn()}
      />,
    );

    expect(root).toEqual({
      profile: "logs",
      provider: { type: "loki" },
      processors: [],
    });
  });

  it("lets a section-level override replace the configured extensions", () => {
    configureProfiles({
      schema: SCHEMA,
      formExtensions: { post: [hostWidget] },
    });

    const html = renderToStaticMarkup(
      <ProfileSchemaSection
        draft={{ profile: "p", query: "select 1" }}
        keys={["query"]}
        title="Section"
        description="A section."
        idPrefix="section"
        post={[]}
        onChange={vi.fn()}
      />,
    );

    expect(html).not.toContain("HOST WIDGET");
  });
});
