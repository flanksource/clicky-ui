import { useComments as usePageComments } from "../comments/useComments";
import { useBrowserSession } from "./session";
export { PLAYGROUND_COMMENT_CONFIG } from "../comments/useComments";

export function useComments(...args: Parameters<typeof usePageComments>) {
  const session = useBrowserSession();
  if (!session) throw new Error("Browser comments require a browser session");
  return usePageComments(args[0], args[1], { ...args[2], capture: (input, actionId) => session.capture(input.anchor ?? "__document__", actionId) });
}
