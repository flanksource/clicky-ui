/** URL-shaped selection the host persists (search params, router state, …). */
export type ClassesSurfaceState = {
  /** Fully qualified name of the class in view. */
  class?: string;
  /** Hash of the loader browsed and decompiled against; absent lists every loader. */
  loader?: string;
  /** A method selector (name, or name and descriptor) the class is folded to. */
  method?: string;
  /** Class name filter. */
  q?: string;
  /** "true" includes platform classes. */
  platform?: string;
  /** A bytecode line to highlight. */
  line?: string;
};

export type ClassesStatePatch = { [Key in keyof ClassesSurfaceState]-?: string };

/** Applies a change to the state; a key set to "" is removed rather than stored empty. */
export function updateClassesState(state: ClassesSurfaceState, patch: Partial<ClassesStatePatch>): ClassesSurfaceState {
  const next: Record<string, string> = {};
  for (const [key, value] of Object.entries({ ...state, ...patch })) {
    if (value) next[key] = value;
  }
  return next as ClassesSurfaceState;
}

export function includePlatformFromState(state: ClassesSurfaceState): boolean {
  return state.platform === "true";
}
