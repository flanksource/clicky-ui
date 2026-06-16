/** Serialize a key's detail and trigger a browser download as `<key>.json`. */
export function downloadJson(key: string, detail: object) {
  const blob = new Blob([JSON.stringify(detail, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `${key.replace(/[^\w.-]+/g, "_")}.json`;
  anchor.click();
  URL.revokeObjectURL(url);
}
