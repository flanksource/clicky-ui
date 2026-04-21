import { AnsiHtml } from "@flanksource/clicky-ui";
import { DemoRow, DemoSection } from "./Section";

const logSample = `\x1b[32m  \u2713 passes\x1b[0m\n\x1b[31m  \u2717 fails\x1b[0m\n\x1b[33m  ! skipped\x1b[0m\n\x1b[1mbold line\x1b[0m\n\x1b[34mblue\x1b[0m \x1b[35mmagenta\x1b[0m \x1b[36mcyan\x1b[0m`;

export function AnsiHtmlDemo() {
  return (
    <DemoSection
      id="ansi-html"
      title="AnsiHtml"
      description="Parse and render ANSI escape sequences (SGR colors, bold, italic, underline, dim)."
    >
      <AnsiHtml
        text={logSample}
        className="bg-black text-white p-density-3 rounded-md text-xs whitespace-pre-wrap"
      />
      <DemoRow label="Inline span">
        <span className="text-sm">
          level=
          <AnsiHtml as="span" text={"\x1b[31merror\x1b[0m"} /> msg="boom"
        </span>
      </DemoRow>
    </DemoSection>
  );
}
