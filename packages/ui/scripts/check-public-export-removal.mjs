import { resolve } from "node:path";
import ts from "typescript";

const configPath = resolve(
  import.meta.dirname,
  "../tsconfig.public-exports.json",
);
const config = ts.readConfigFile(configPath, ts.sys.readFile);
if (config.error)
  throw new Error(
    ts.flattenDiagnosticMessageText(config.error.messageText, "\n"),
  );
const parsed = ts.parseJsonConfigFileContent(
  config.config,
  ts.sys,
  resolve(import.meta.dirname, ".."),
);
if (parsed.errors.length)
  throw new Error("invalid public-export typecheck config");

const barrelPath = resolve(import.meta.dirname, "../src/clicky.ts");
const host = ts.createCompilerHost(parsed.options);
const getSourceFile = host.getSourceFile;
host.getSourceFile = (fileName, languageVersion, ...options) => {
  if (resolve(fileName) !== barrelPath)
    return getSourceFile(fileName, languageVersion, ...options);
  const source = ts.sys.readFile(fileName);
  if (!source?.includes("  type ClickyRowDetailRenderer,\n"))
    throw new Error("expected public type export is missing before mutation");
  return ts.createSourceFile(
    fileName,
    source.replace("  type ClickyRowDetailRenderer,\n", ""),
    languageVersion,
  );
};
const diagnostics = ts.getPreEmitDiagnostics(
  ts.createProgram(parsed.fileNames, parsed.options, host),
);
const missingExport = diagnostics.filter(
  (diagnostic) =>
    diagnostic.code === 2305 &&
    diagnostic.file?.fileName.endsWith("clicky.consumer.ts") &&
    ts
      .flattenDiagnosticMessageText(diagnostic.messageText, "\n")
      .includes("ClickyRowDetailRenderer"),
);
if (missingExport.length !== 1)
  throw new Error(
    `expected one missing-export diagnostic, received ${missingExport.length}`,
  );
process.stdout.write(
  ts.formatDiagnostics(missingExport, {
    getCurrentDirectory: ts.sys.getCurrentDirectory,
    getCanonicalFileName: (name) => name,
    getNewLine: () => "\n",
  }),
);
