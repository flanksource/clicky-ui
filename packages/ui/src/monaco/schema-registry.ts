import type { Monaco } from "@monaco-editor/react";
import { configureMonacoYaml, type MonacoYaml } from "monaco-yaml";

type Registration = { token: symbol; uri: string; schema: Record<string, unknown> };
const yamlSchemas = new Map<string, Registration>();
const jsonSchemas = new Map<string, Registration>();
let yamlController: MonacoYaml | undefined;
let updateQueue = Promise.resolve();

export function registerMonacoSchema(
  monaco: Monaco,
  language: "json" | "yaml",
  modelPath: string,
  schemaUri: string,
  schema: Record<string, unknown>,
): () => void {
  if (language === "json") {
    const token = Symbol(modelPath);
    jsonSchemas.set(modelPath, { token, uri: schemaUri, schema });
    updateJsonSchemas(monaco);
    return () => {
      if (jsonSchemas.get(modelPath)?.token !== token) return;
      jsonSchemas.delete(modelPath);
      updateJsonSchemas(monaco);
    };
  }

  const token = Symbol(modelPath);
  yamlSchemas.set(modelPath, { token, uri: schemaUri, schema });
  if (!yamlController) {
    yamlController = configureMonacoYaml(monaco, {
      completion: true,
      hover: true,
      validate: true,
      format: true,
      yamlVersion: "1.2",
      schemas: yamlSchemaSettings(),
    });
  } else {
    queueYamlUpdate();
  }

  return () => {
    if (yamlSchemas.get(modelPath)?.token !== token) return;
    yamlSchemas.delete(modelPath);
    queueYamlUpdate();
  };
}

function updateJsonSchemas(monaco: Monaco) {
  monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
    validate: true,
    schemas: [...jsonSchemas.entries()].map(([path, entry]) => ({
      uri: entry.uri,
      fileMatch: modelFileMatches(path),
      schema: entry.schema,
    })),
  });
}

function queueYamlUpdate() {
  const schemas = yamlSchemaSettings();
  updateQueue = updateQueue.then(() => yamlController?.update({ schemas })).then(() => undefined);
}

function yamlSchemaSettings() {
  return [...yamlSchemas.entries()].map(([path, entry]) => ({
    uri: entry.uri,
    fileMatch: modelFileMatches(path),
    schema: entry.schema,
  }));
}

function modelFileMatches(path: string): string[] {
  const filename = path.split("/").pop();
  return filename ? [path, `**/${filename}`] : [path];
}
