import { expect, it } from "vitest";
import { validateSourcePath } from "./validation.ts";

it.each(Array.from({ length: 32 }, (_, code) => code))(
  "rejects source paths containing ASCII control code %i",
  (code) => {
    expect(() => validateSourcePath(`pages/report${String.fromCharCode(code)}.tsx`)).toThrow(/invalid source path/);
  },
);

it.each(["pages/monthly report.tsx", "pages/report!.tsx"])(
  "preserves printable source paths: %s",
  (path) => expect(() => validateSourcePath(path)).not.toThrow(),
);
