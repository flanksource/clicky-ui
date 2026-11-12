import { expect, it } from "vitest";
import { sourceCandidates } from "./candidates.ts";

it.each(["Deployment path", "Deployment edit 3"])("keeps JSX, helper, template, object and comment classes while excluding rendered text: %s", (heading) => {
  const code = `const highlight = "hover:bg-red-500"; const spacing = \`p-[13px]\`; const layout = { flex: true }; /* bg-blue-500 */ export default () => <h1 className="text-2xl font-bold">${heading}</h1>;`;
  const candidates = sourceCandidates({ path: "page.tsx", code });
  expect(candidates).toEqual(expect.arrayContaining(["hover:bg-red-500", "p-[13px]", "text-2xl", "font-bold", "flex:", "bg-blue-500"]));
  expect(candidates.filter((candidate) => ["Deployment", "path", "edit", "3"].includes(candidate))).toEqual([]);
});
