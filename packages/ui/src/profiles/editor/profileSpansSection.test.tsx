import { render, screen, fireEvent } from "@testing-library/react";
import { expect, it, vi } from "vitest";
import { configureProfiles } from "../profileApi";
import { ProfileSpansSection } from "./profileSpansSection";

it("clears a source mapping back to automatic detection", () => {
  configureProfiles({schema:{type:"object",properties:{spans:{type:"object",properties:{service:{type:"object",title:"Service",properties:{source:{type:"string",title:"Source field"}}}}}}}});
  const onChange = vi.fn();
  render(<ProfileSpansSection draft={{profile:"Trace",spans:{service:{source:"component"}}}} rows={[]} normalizedRows={[]} onChange={onChange} />);
  fireEvent.change(screen.getByRole("textbox",{name:"Source field"}),{target:{value:""}});
  expect(onChange).toHaveBeenLastCalledWith({profile:"Trace",spans:{}});
});
