import { DensitySwitcher, ThemeSwitcher } from "@flanksource/clicky-ui";
import { DemoRow, DemoSection } from "./Section";

export function SwitchersDemo() {
  return (
    <DemoSection
      id="switchers"
      title="ThemeSwitcher / DensitySwitcher"
      description="Radio-group controls wired to ThemeProvider and DensityProvider."
    >
      <DemoRow label="Theme">
        <ThemeSwitcher />
      </DemoRow>
      <DemoRow label="Density">
        <DensitySwitcher />
      </DemoRow>
    </DemoSection>
  );
}
