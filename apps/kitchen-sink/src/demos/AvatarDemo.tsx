import { Avatar } from "@flanksource/clicky-ui";
import { DemoRow, DemoSection } from "./Section";

const NAMES = ["alice", "bob", "carol", "dave", "eve", "frank", "grace", "heidi"];

export function AvatarDemo() {
  return (
    <DemoSection
      id="avatar"
      title="Avatar"
      description="Image with initial-fallback and deterministic palette from a hash of the key."
    >
      <DemoRow label="Palette">
        {NAMES.map((n) => (
          <Avatar key={n} alt={n} size={32} title={n} />
        ))}
      </DemoRow>
      <DemoRow label="Sizes">
        {[16, 24, 32, 48].map((s) => (
          <Avatar key={s} alt="alice" size={s} />
        ))}
      </DemoRow>
      <DemoRow label="Square">
        <Avatar
          alt="flanksource/clicky-ui"
          rounded="md"
          size={28}
          colorKey="flanksource/clicky-ui"
        />
        <Avatar alt="other-org/clicky-ui" rounded="md" size={28} colorKey="other-org/clicky-ui" />
      </DemoRow>
    </DemoSection>
  );
}
