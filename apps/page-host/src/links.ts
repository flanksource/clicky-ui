export function developerOverrides(profile: string | undefined): boolean {
  if (profile === undefined || profile === "default") return false;
  if (profile === "developer") return true;
  throw new Error(`Unknown page-host profile: ${profile}`);
}
