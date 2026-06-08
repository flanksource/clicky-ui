import { CommandOutput, type CommandOutputProps } from "./CommandOutput";

export type ExecutionResultProps = CommandOutputProps;

export function ExecutionResult({
  ariaLabel = "Response body",
  bare = true,
  ...props
}: ExecutionResultProps) {
  return <CommandOutput ariaLabel={ariaLabel} bare={bare} {...props} />;
}
