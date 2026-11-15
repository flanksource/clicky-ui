/** The text of a picked file, rejecting with the reader's error. */
export function readFileText(file: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => (typeof reader.result === "string" ? resolve(reader.result) : reject(new Error("The file did not read as text")));
    reader.onerror = () => reject(reader.error ?? new Error("The file could not be read"));
    reader.readAsText(file);
  });
}
