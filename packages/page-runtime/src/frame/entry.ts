import { bootFrame } from "./boot.ts";
void bootFrame().catch((error: unknown) => {
  document.getElementById("root")!.textContent = `page-runtime boot failed: ${error instanceof Error ? error.message : String(error)}`;
});
