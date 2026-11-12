async function run(): Promise<void> {
  await navigator.serviceWorker.register("/sw.js", { scope: "/" });
  await navigator.serviceWorker.ready;
  if (!navigator.serviceWorker.controller) await new Promise<void>((resolve) => navigator.serviceWorker.addEventListener("controllerchange", () => resolve(), { once: true }));
  const response = await fetch("/open.json");
  if (!response.ok) throw new Error(`fixture open: HTTP ${response.status}`);
  const channel = new MessageChannel();
  const opened = new Promise<void>((resolve, reject) => { channel.port1.onmessage = (event: MessageEvent<{ ok: boolean; error?: { message: string } }>) => { channel.port1.close(); if (event.data.ok) resolve(); else reject(new Error(event.data.error?.message ?? "worker open failed")); }; });
  navigator.serviceWorker.controller!.postMessage({ message: await response.json() }, [channel.port2]);
  await opened;
  const entry = "/src/report.js?page=report.js";
  await import(/* @vite-ignore */ entry);
}

void run().catch((error: unknown) => {
  document.querySelector("#result")!.textContent = error instanceof Error ? error.message : String(error);
  document.title = "CONVERTED-ERROR";
});
