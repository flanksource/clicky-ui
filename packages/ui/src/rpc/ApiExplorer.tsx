import { lazy, Suspense, useMemo, type CSSProperties } from "react";
import type { AnyApiReferenceConfiguration } from "@scalar/api-reference-react";
import { cn } from "../lib/utils";

export const DEFAULT_OPENAPI_URL = "/api/openapi.json";

const ScalarApiReference = lazy(async () => {
  await import("@scalar/api-reference-react/style.css");
  const mod = await import("@scalar/api-reference-react");
  return { default: mod.ApiReferenceReact };
});

export type ApiExplorerProps = {
  openApiUrl?: string;
  configuration?: AnyApiReferenceConfiguration;
  className?: string;
  style?: CSSProperties;
};

export function ApiExplorer({
  openApiUrl = DEFAULT_OPENAPI_URL,
  configuration,
  className,
  style,
}: ApiExplorerProps) {
  const scalarConfiguration = useMemo<AnyApiReferenceConfiguration>(() => {
    if (configuration == null) {
      return { url: openApiUrl };
    }
    if (Array.isArray(configuration)) {
      return configuration;
    }
    return { url: openApiUrl, ...configuration };
  }, [configuration, openApiUrl]);

  return (
    <div className={cn("h-full min-h-0 overflow-auto", className)} style={style}>
      <Suspense
        fallback={<div className="p-4 text-sm text-muted-foreground">Loading API explorer...</div>}
      >
        <ScalarApiReference configuration={scalarConfiguration} />
      </Suspense>
    </div>
  );
}
