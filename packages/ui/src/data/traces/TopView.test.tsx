import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { TopView, type TopViewState } from "./TopView";
import { WeightedProfile } from "./WeightedProfile";

const state: TopViewState = { source:"", frame:"", metric:"", view:"", search:"", zoom:"", paused:false };
const root = { id:"all", label:"All stacks", self:0, total:10, children:[{id:"work", label:"worker", self:10,total:10,children:[]}] };

describe("Top sample interactions",()=>{
  it("keeps search and sample controls visible when no samples are available",()=>{
    render(<TopView frames={[]} metrics={[]} state={state} onChange={vi.fn()} onRefresh={vi.fn()} />);
    expect(screen.getByRole("searchbox",{name:"Search sample"})).toBeInTheDocument();
    expect(screen.getByRole("button",{name:"Refresh"})).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("Complete samples unavailable");
  });
  it("opens the server's PrettyFull detail in a scrollable dialog",async()=>{
    render(<TopView frames={[]} metrics={[]} state={state} onChange={vi.fn()} onRefresh={vi.fn()} table={{version:1,node:{kind:"table",columns:[{name:"seq",defaultHidden:true},{name:"session",label:"Session"}],rows:[{cells:{seq:{kind:"text",text:"1",filterValue:1},session:{kind:"text",text:"session-12"}},detail:{kind:"code",language:"sql",source:"SELECT expensive_column FROM example_table"}}]}}} />);
    fireEvent.click(screen.getByText("session-12"));
    expect(await screen.findByRole("dialog")).toHaveTextContent("expensive_column");
  });
  it("supports keyboard zoom with a breadcrumb back to the complete profile",()=>{
    const zoom=vi.fn();
    render(<WeightedProfile hierarchy={{metric:"cpu",unit:"ns",root}} mode="flamegraph" zoom="" search="worker" onZoom={zoom} />);
    fireEvent.keyDown(screen.getByRole("button",{name:/worker,/}),{key:"Enter"});
    expect(zoom).toHaveBeenCalledWith("work");
    fireEvent.click(screen.getByRole("button",{name:"All stacks"}));
    expect(zoom).toHaveBeenCalledWith("");
  });
});
