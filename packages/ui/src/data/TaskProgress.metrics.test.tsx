import { render, screen } from "@testing-library/react";
import { expect, it } from "vitest";
import { TaskProgress } from "./TaskProgress";

it("renders zero-of-known-total work with units and measured transfer metrics", () => {
 render(<TaskProgress snapshots={[
  { id:"group",name:"Compare",type:"group",status:"running",groupId:"group" },
  { id:"fetch",name:"[acme/rules] Fetch main",type:"task",status:"running",groupId:"group",description:"Receiving objects",progress:0,maxValue:10,progressMetrics:{unit:"objects",bytes:1048576,bytesPerSecond:524288} },
 ]}/>);
 expect(screen.getByText("0/10 objects · 0%")).toBeInTheDocument();
 expect(screen.getByText("1 MB · 512 KB/s")).toBeInTheDocument();
});
