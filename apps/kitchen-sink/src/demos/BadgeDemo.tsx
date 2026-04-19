import { Badge } from "@flanksource/clicky-ui";
import { DemoRow, DemoSection } from "./Section";

const TONES = ["neutral", "success", "danger", "warning", "info"] as const;
const VARIANTS = ["soft", "solid", "outline"] as const;

export function BadgeDemo() {
  return (
    <DemoSection
      id="badge"
      title="Badge"
      description="Tone × variant matrix, with count and icon slots."
    >
      {VARIANTS.map((v) => (
        <DemoRow key={v} label={v}>
          {TONES.map((t) => (
            <Badge key={t} tone={t} variant={v}>
              {t}
            </Badge>
          ))}
        </DemoRow>
      ))}
      <DemoRow label="With count">
        <Badge tone="danger" variant="solid" count={12}>
          errors
        </Badge>
        <Badge tone="success" icon="codicon:check">
          passed
        </Badge>
        <Badge tone="warning" size="lg">
          needs review
        </Badge>
      </DemoRow>
    </DemoSection>
  );
}
