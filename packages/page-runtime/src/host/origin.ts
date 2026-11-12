export type FrameOrigin = "cross-origin" | "same-origin-local";

export function validateFrameOrigin(options: { runtimeOrigin: string; hostOrigin: string; origin: FrameOrigin }): void {
  const runtime = new URL(options.runtimeOrigin);
  if (runtime.origin !== options.runtimeOrigin || (options.runtimeOrigin === options.hostOrigin && options.origin !== "same-origin-local")) throw new Error("PageFrame requires a separate runtime origin");
  if (options.origin === "same-origin-local" && (options.runtimeOrigin !== options.hostOrigin || !/^(localhost|127\.0\.0\.1|\[::1\])$/.test(runtime.hostname))) throw new Error("same-origin-local requires the host's loopback origin");
}
