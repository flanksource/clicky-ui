import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import type {
  OperationsApiClient,
  ResolvedOperation,
} from "@flanksource/clicky-ui";
import {
  configureProfiles,
  ProfileEditor,
  type ProfileSchema,
} from "@flanksource/clicky-ui/profiles";
import { DemoSection } from "./Section";

const schema: ProfileSchema = {
  type: "object",
  required: ["profile", "provider"],
  properties: {
    profile: { type: "string", title: "Profile name" },
    namespace: { type: "string", title: "Namespace" },
    render: { type: "string", enum: ["table", "logs"] },
    query: { type: "string", title: "Query" },
    params: {
      type: "array",
      title: "Parameters",
      items: {
        type: "object",
        properties: {
          name: { type: "string" },
          label: { type: "string" },
          type: {
            type: "string",
            enum: ["string", "number", "boolean", "date", "enum", "list"],
          },
          role: {
            type: "string",
            enum: ["filter", "limit", "offset", "time-from", "time-to"],
          },
          required: { type: "boolean" },
        },
      },
    },
    imports: { type: "array", items: { type: "string" } },
    aliases: {
      type: "array",
      items: {
        type: "object",
        properties: {
          name: { type: "string" },
          value: { type: "string" },
        },
      },
    },
    processors: {
      type: "array",
      items: {
        type: "object",
        properties: {
          use: { type: "string", enum: ["example.normalize", "example.redact"] },
        },
      },
    },
    output: {
      type: "object",
      properties: { title: { type: "string" } },
    },
    provider: {
      type: "object",
      properties: {
        type: { type: "string", enum: ["sql", "opensearch"] },
      },
    },
  },
  $defs: {
    sql: {
      type: "object",
      properties: {
        options: {
          type: "object",
          properties: {
            database: { type: "string", title: "Database" },
          },
        },
      },
    },
    opensearch: {
      type: "object",
      properties: {
        options: {
          type: "object",
          properties: { index: { type: "string", title: "Index" } },
        },
      },
    },
  },
};

configureProfiles({ schema });

const client: OperationsApiClient = {
  async getOpenAPISpec() {
    return {
      openapi: "3.0.0",
      info: { title: "Profile examples", version: "1.0.0" },
      paths: {},
    };
  },
  async executeCommand() {
    return { success: true, exit_code: 0 };
  },
  async submitForm() {
    return { success: true, exit_code: 0, message: "Profile saved" };
  },
};

const action: ResolvedOperation = {
  path: "/api/v1/profiles/{id}",
  method: "put",
  operation: {
    operationId: "profile_update",
    summary: "Update profile",
    responses: { "200": { description: "Updated" } },
  },
};

const initialValue = {
  profile: "service-health",
  namespace: "observability",
  render: "table",
  provider: { type: "sql", options: { database: "operations" } },
  query:
    "SELECT observed_at, service, status, duration_ms FROM service_health ORDER BY observed_at DESC",
  params: [
    {
      name: "service",
      label: "Service",
      type: "string",
      role: "filter",
    },
  ],
  columns: [
    {
      name: "observed_at",
      label: "Observed",
      type: "datetime",
      kind: "timestamp",
    },
    {
      name: "service",
      label: "Service",
      type: "string",
      filter: { kind: "terms", lookup: true },
    },
    {
      name: "status",
      label: "Status",
      type: "string",
      kind: "status",
    },
  ],
};

export function ProfilesDemo() {
  const queryClient = useMemo(
    () =>
      new QueryClient({
        defaultOptions: { queries: { retry: false, gcTime: 0 } },
      }),
    [],
  );
  const [savedProfile, setSavedProfile] = useState("");

  return (
    <DemoSection
      id="profiles"
      title="Profiles"
      description="Edit a query profile through the route-sized section rail and workspace. This demo injects a compact host schema and an in-memory save client."
    >
      {savedProfile ? (
        <p role="status" className="text-sm text-success">
          Saved {savedProfile}
        </p>
      ) : null}
      <QueryClientProvider client={queryClient}>
        <div className="h-[720px] min-h-0 overflow-hidden rounded-md border border-border">
          <ProfileEditor
            client={client}
            action={action}
            surfaceKey="profile-service-health"
            initialValue={initialValue}
            onClose={() => undefined}
            onSuccess={setSavedProfile}
          />
        </div>
      </QueryClientProvider>
    </DemoSection>
  );
}
