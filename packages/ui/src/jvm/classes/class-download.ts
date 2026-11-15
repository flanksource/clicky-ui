/** A filename for a downloaded class artifact; anything a filesystem might reject becomes `_`. */
export function classArtifactFilename(className: string, extension: "java" | "class"): string {
  return `${className.replace(/[^A-Za-z0-9_.$-]/g, "_")}.${extension}`;
}

/** Decodes base64 into a blob; throws on text that is not valid base64. */
export function base64ToBlob(base64: string, type: string): Blob {
  const binary = atob(base64);
  const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
  return new Blob([bytes], { type });
}

/** Offers a blob to the browser as a file download. */
export function saveBlob(filename: string, blob: Blob): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  // The browser starts the download asynchronously; revoking at once can cancel it.
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
