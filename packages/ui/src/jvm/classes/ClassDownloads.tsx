import { useState } from "react";
import { Button } from "../../components/button";
import { InlineError } from "../../rpc/InlineError";
import { base64ToBlob, classArtifactFilename, saveBlob } from "./class-download";

export type ClassDownloadsProps = {
  /** Fully qualified class name; "" when no class is selected. */
  qualifiedName: string;
  /** The source to save, including unsaved edits; undefined before it has loaded. */
  source: string | undefined;
  /** Fetches the loaded class file, base64 encoded. */
  loadBytecode: () => Promise<string>;
};

/** Saves the shown source as `.java` and the loaded bytecode as `.class`. */
export function ClassDownloads({ qualifiedName, source, loadBytecode }: ClassDownloadsProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown>(null);

  const downloadBytecode = async () => {
    setLoading(true);
    setError(null);
    try {
      saveBlob(classArtifactFilename(qualifiedName, "class"), base64ToBlob(await loadBytecode(), "application/java-vm"));
    } catch (failure) {
      setError(failure);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          variant="outline"
          disabled={!qualifiedName || !source}
          onClick={() => saveBlob(classArtifactFilename(qualifiedName, "java"), new Blob([source ?? ""], { type: "text/x-java-source;charset=utf-8" }))}
        >
          Download source
        </Button>
        <Button size="sm" variant="outline" loading={loading} disabled={!qualifiedName} onClick={() => void downloadBytecode()}>
          Download .class
        </Button>
      </div>
      {error ? <InlineError title="Download failed" error={error} /> : null}
    </div>
  );
}
