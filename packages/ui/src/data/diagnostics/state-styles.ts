// Tailwind class pickers for goroutine / JVM-thread states, shared by the
// stack cards and the diagnostics detail panel.

export function goroutineStateBadge(state: string): string {
  if (state.includes("running"))
    return "bg-green-50 text-green-700 dark:bg-green-500/20 dark:text-green-300";
  if (state.includes("chan") || state.includes("wait"))
    return "bg-blue-50 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300";
  if (state.includes("sleep"))
    return "bg-amber-50 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300";
  if (state.includes("select"))
    return "bg-violet-50 text-violet-700 dark:bg-violet-500/20 dark:text-violet-300";
  return "bg-muted text-muted-foreground";
}

export function goroutineStateDot(state: string): string {
  if (state.includes("running")) return "bg-green-500";
  if (state.includes("chan") || state.includes("wait")) return "bg-blue-500";
  if (state.includes("sleep")) return "bg-amber-500";
  if (state.includes("select")) return "bg-violet-500";
  return "bg-muted-foreground/40";
}

export function threadStateBadge(state: string): string {
  switch (state) {
    case "runnable":
      return "bg-green-50 text-green-700 dark:bg-green-500/20 dark:text-green-300";
    case "blocked":
      return "bg-red-50 text-red-700 dark:bg-red-500/20 dark:text-red-300";
    case "waiting":
    case "timed_waiting":
      return "bg-blue-50 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300";
    case "new":
      return "bg-amber-50 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300";
    case "terminated":
      return "bg-muted text-muted-foreground";
    default:
      return "bg-muted text-muted-foreground";
  }
}

export function threadStateDot(state: string): string {
  switch (state) {
    case "runnable":
      return "bg-green-500";
    case "blocked":
      return "bg-red-500";
    case "waiting":
    case "timed_waiting":
      return "bg-blue-500";
    case "new":
      return "bg-amber-500";
    case "terminated":
      return "bg-muted-foreground/40";
    default:
      return "bg-muted-foreground/40";
  }
}
