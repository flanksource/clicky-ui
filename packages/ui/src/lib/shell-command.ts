// Renders a command + argv (+ optional cwd) as a line pasteable into a POSIX shell.

export function shellQuote(value: string): string {
  if (/^[A-Za-z0-9_@%+=:,./-]+$/.test(value)) return value;
  return `'${value.replaceAll("'", `'"'"'`)}'`;
}

export function shellCommandLine({
  command,
  args,
  cwd,
}: {
  command: string;
  args?: string[];
  cwd?: string;
}): string {
  const line = [command, ...(args ?? [])].map(shellQuote).join(" ");
  return cwd ? `cd ${shellQuote(cwd)} && ${line}` : line;
}
