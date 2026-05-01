import { useMemo, type CSSProperties } from "react";
import { ApiReferenceReact, type AnyApiReferenceConfiguration } from "@scalar/api-reference-react";
import "@scalar/api-reference-react/style.css";
import { cn } from "../lib/utils";

export const DEFAULT_OPENAPI_URL = "/api/openapi.json";

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
      <ApiReferenceReact configuration={scalarConfiguration} />
    </div>
  );
}
