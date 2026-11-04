import { describe, expect, it } from "vitest";
import { configureProfiles } from "../profileApi";
import { defaultSpanColumns, obsoleteSpanColumns } from "./spanColumns";

describe("canonical listing columns", () => {
  it("resets to schema defaults without requiring a sample and returns an independent draft", () => {
    configureProfiles({schema:{type:"object",properties:{spans:{type:"object","x-clicky-default-columns":[{name:"duration_ms",type:"duration",unit:"ms"}]}}}});
    const columns = defaultSpanColumns();
    expect(columns).toEqual([{name:"duration_ms",type:"duration",unit:"ms"}]);
    columns[0]!.label = "Edited";
    expect(defaultSpanColumns()[0]).not.toHaveProperty("label");
  });
  it("rejects raw fields and accepts normalized attribute paths", () => {
    const attribute = {name:"attributes.http.method",source:"_span_attributes",jsonpath:'$["http.method"]'};
    expect(obsoleteSpanColumns([{name:"spanID"},{...attribute,name:"Method"}],[{name:"span_id"},attribute])).toEqual(["spanID"]);
  });
});
