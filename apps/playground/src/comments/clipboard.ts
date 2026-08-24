export async function writeClipboard(text: Promise<string>): Promise<void> {
  if (
    typeof navigator === "undefined" ||
    navigator.clipboard?.write === undefined
  ) {
    throw new Error("Clipboard API is unavailable");
  }
  if (typeof ClipboardItem === "undefined") {
    throw new Error("ClipboardItem is unavailable");
  }

  await navigator.clipboard.write([
    new ClipboardItem({
      "text/plain": text.then(
        (value) => new Blob([value], { type: "text/plain" }),
      ),
    }),
  ]);
}
