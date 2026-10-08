import{j as o,ah as ae,ai as te,aj as x,ak as ne,r as y,al as oe,am as se,an as re}from"./iframe-PIqemlGB.js";import{G as r}from"./GraphDiagram-CyjludGe.js";import"./preload-helper-CLP1olNy.js";import"./utils-DW-IJACk.js";import"./IconButton-gbin6MpU.js";import"./Icon-BnoLxMF1.js";const{expect:s,userEvent:d,waitFor:c,within:u}=__STORYBOOK_MODULE_TEST__,Ee={title:"Data/GraphDiagram",component:r,tags:["autodocs"],parameters:{docs:{description:{component:"Generic, type-agnostic node/edge diagram. The `ring` layout places nodes on a circle so small cycles and reciprocal edges read clearly; the `columns` layout places nodes in the column of their `level` for a directed graph with a natural depth, such as a call graph. The component carries no domain fields; a producer maps its own model onto `GraphDiagramNode`/`GraphDiagramEdge`."}}},args:{ariaLabel:"Example graph"}},K=[{id:"session-a",label:"Session 93 · victim",tone:"danger"},{id:"resource-r1",label:"Lock A",detail:"keylock",shape:"pill"},{id:"session-b",label:"Session 47 · survivor",tone:"success"},{id:"resource-r2",label:"Lock B",detail:"keylock",shape:"pill"}],X=[{id:"e1",from:"resource-r1",to:"session-a",label:"holds X",tone:"info"},{id:"e2",from:"session-a",to:"resource-r2",label:"wants S",tone:"warning",dashed:!0},{id:"e3",from:"resource-r2",to:"session-b",label:"holds S",tone:"info"},{id:"e4",from:"session-b",to:"resource-r1",label:"wants X",tone:"warning",dashed:!0},{id:"e5",from:"resource-r1",to:"session-b",label:"holds S",tone:"info"}],p={args:{nodes:K,edges:X,ariaLabel:"Four node deadlock cycle"},render:a=>o.jsx("div",{style:{maxWidth:640},children:o.jsx(r,{...a})})},h={args:{nodes:K,edges:X,ariaLabel:"Selectable deadlock cycle"},render:a=>{function e(){const[t,n]=y.useState("session-a");return o.jsx("div",{style:{maxWidth:640},children:o.jsx(r,{...a,selectedId:t,onNodeSelect:n})})}return o.jsx(e,{})},play:async({canvasElement:a,step:e})=>{const t=u(a);await e("selected node is pressed",async()=>{const n=t.getByRole("button",{name:/victim/});await s(n).toHaveAttribute("aria-pressed","true")}),await e("clicking another node moves the selection",async()=>{const n=t.getByRole("button",{name:/survivor/});await d.click(n),await c(()=>s(n).toHaveAttribute("aria-pressed","true")),await s(t.getByRole("button",{name:/victim/})).toHaveAttribute("aria-pressed","false")})}},ie=[{id:"only",label:"Isolated resource",detail:"no contention"}],g={args:{nodes:ie,edges:[],ariaLabel:"Single isolated node"},render:a=>o.jsx("div",{style:{maxWidth:320},children:o.jsx(r,{...a})})},m={name:"Record groups",args:{layout:"columns",nodeWidth:240,compactNodeHeight:22,recordHeaderHeight:24,ariaLabel:"Record data access",groups:[{id:"Customers",label:o.jsxs("span",{className:"flex items-center gap-1.5",children:[o.jsx(ne,{}),"Customers"]}),title:"dbo.Customers",variant:"record"}],nodes:[{id:"load",label:"LoadCustomer",level:0},{id:"id",label:"ID",icon:o.jsx(te,{}),aside:"uniqueidentifier",level:1,group:"Customers",size:"compact"},{id:"name",label:"Name",icon:o.jsx(x,{}),aside:"nvarchar(100)",level:1,group:"Customers",size:"compact"},{id:"status",label:"Status",icon:o.jsx(x,{}),aside:"nvarchar(2)",level:1,group:"Customers",size:"compact"}],edges:[{id:"load-name",from:"load",to:"name",label:"read",tone:"success"}]},render:a=>o.jsx(f,{...a}),parameters:{docs:{description:{story:"Set a group's variant to record and its members' size to compact. The header uses recordHeaderHeight; each flush row uses compactNodeHeight. The aside slot shows a type, and edges attach to the row at the card's side. A record holding a regular node fails with its group and node id."}}}},le=8,l=Array.from({length:le},(a,e)=>({id:`node-${e}`,label:`Session ${e+1}`,tone:e%2===0?"info":"neutral"})),de=l.map((a,e)=>({id:`edge-${e}`,from:a.id,to:l[(e+1)%l.length].id,label:"waits on"})),b={args:{nodes:l,edges:de,ariaLabel:"Eight node wait ring"},render:a=>o.jsx("div",{style:{maxWidth:720},children:o.jsx(r,{...a})}),play:async({canvasElement:a,step:e})=>{const t=u(a);await e("every node label is rendered",async()=>{for(const n of l)await s(t.getByText(String(n.label))).toBeInTheDocument()})}},ce=[{id:"cmd/uir",label:"cmd/uir",title:"github.com/flanksource/uir/cmd/uir"},{id:"uir/query",label:"uir/query",title:"github.com/flanksource/uir/query"},{id:"uir/graph",label:"uir/graph",title:"github.com/flanksource/uir/graph"},{id:"uir/storage",label:"uir/storage",title:"github.com/flanksource/uir/storage"}],J=[{id:"serve",label:"serveModuleGraph",detail:"func",level:-1,group:"cmd/uir",expandCount:2},{id:"cli",label:"runGraphCommand",detail:"func",level:-1,group:"cmd/uir"},{id:"run",label:"Pipeline.RunModules",detail:"method",level:0,group:"uir/query",tone:"info"},{id:"resolve",label:"Pipeline.resolveSelector",detail:"method",level:1,group:"uir/query"},{id:"graph",label:"Pipeline.Graph",detail:"method",level:1,group:"uir/query"},{id:"build",label:"Build",detail:"func",level:1,group:"uir/graph"},{id:"load",label:"Store.LoadDocument",detail:"method",level:2,group:"uir/storage",expandCount:3},{id:"walk",label:"walk",detail:"func",level:2,group:"uir/graph"},{id:"lookup",label:"plugin.Lookup",detail:"unresolved",level:2,tone:"warning",muted:!0}],Q=[{id:"serve-run",from:"serve",to:"run"},{id:"cli-run",from:"cli",to:"run",label:"len(args) > 0",title:"len(args) > 0",dashed:!0},{id:"run-resolve",from:"run",to:"resolve"},{id:"run-graph",from:"run",to:"graph",label:"opts.Depth > 0 ×2",title:"opts != nil ∧ opts.Depth > 0",dashed:!0},{id:"run-build",from:"run",to:"build",label:"via interface",tone:"info"},{id:"graph-build",from:"graph",to:"build"},{id:"resolve-load",from:"resolve",to:"load",label:"!cached",title:"!cached",dashed:!0},{id:"build-walk",from:"build",to:"walk"},{id:"build-lookup",from:"build",to:"lookup",tone:"warning"},{id:"walk-walk",from:"walk",to:"walk",label:"depth < limit",title:"depth < limit",dashed:!0},{id:"walk-graph",from:"walk",to:"graph"}];function f(a){const[e,t]=y.useState("run"),[n,S]=y.useState(),[Z,ee]=y.useState();return o.jsxs("div",{style:{maxWidth:1100},children:[o.jsx(r,{...a,onNodeSelect:t,onEdgeSelect:S,onNodeExpand:ee,...e!==void 0?{selectedId:e}:{},...n!==void 0?{selectedEdgeId:n}:{}}),o.jsxs("p",{"data-testid":"call-graph-state",style:{fontSize:12},children:["node: ",e??"none"," · edge: ",n??"none"," · expanded: ",Z??"none"]})]})}const i={name:"Call graph (columns)",args:{nodes:J,edges:Q,groups:ce,layout:"columns",nodeWidth:176,nodeHeight:48,columnGap:150,zoomable:!0,ariaLabel:"Call graph of Pipeline.RunModules"},parameters:{docs:{description:{story:"The `columns` layout places each node in the column of its `level` (callers negative, callees positive), keeps a `group` together inside a captioned box, and routes edges side to side: back edges return through the columns, and a self-edge or an edge inside one column loops beside it. Dashed edges are conditional; the pill shows the short guard and its tooltip the full one. `+N` asks the host to load more neighbours, edges and nodes are selectable, and `zoomable` adds ctrl/⌘ + wheel zoom, background drag and the zoom controls."}}},render:a=>o.jsx(f,{...a}),play:async({canvasElement:a,step:e})=>{const t=u(a),n=t.getByTestId("call-graph-state");await e("group captions and nodes render",async()=>{await s(t.getAllByText("uir/query").length).toBe(2),await s(t.getByText("Pipeline.RunModules")).toBeInTheDocument()}),await e("+N expands without selecting the node",async()=>{await d.click(t.getByRole("button",{name:"Expand 3 more from Store.LoadDocument"})),await c(()=>s(n).toHaveTextContent("node: run · edge: none · expanded: load"))}),await e("an edge is selected from its label pill",async()=>{await d.click(t.getByText("via interface")),await c(()=>s(t.getByRole("button",{name:"Pipeline.RunModules to Build: via interface"})).toHaveAttribute("aria-pressed","true"))})}},ue=[{detail:"method",words:"method",icon:o.jsx(oe,{title:"method"})},{detail:"func",words:"function",icon:o.jsx(se,{title:"function"})},{detail:"unresolved",words:"unresolved call",icon:o.jsx(re,{title:"unresolved call"})}],pe=J.map(({detail:a,...e})=>{const t=ue.find(S=>S.detail===a);if(!t)throw new Error(`GraphDiagram story: no icon for node kind "${String(a)}"`);const n=e.group===void 0?"":` in ${e.group}`;return{...e,icon:t.icon,title:`${t.words} ${String(e.label)}${n}`}}),he=Q.map(a=>a.id==="run-build"?{id:a.id,from:a.from,to:a.to,tone:"info",icon:o.jsx(ae,{title:"via interface"}),iconLabel:"via interface"}:a),v={name:"Call graph (icons)",args:{...i.args,nodes:pe,edges:he,nodeHeight:32,rowGap:14},parameters:{docs:{description:{story:"A node's `icon` sits before its label, so the kind needs no second line and the node can be one line tall; below 44px the label is cut with an ellipsis instead of wrapping. The node's `title` is its tooltip and carries the words the icon replaced. An edge's `icon` sits in its pill before the label, or alone when the edge has no label; `iconLabel` says the icon in words in the edge's accessible name."}}},render:a=>o.jsx(f,{...a}),play:async({canvasElement:a,step:e})=>{const t=u(a);await e("a node is named by its icon and its label",async()=>{await s(t.getByRole("button",{name:"method Pipeline.RunModules"})).toHaveAttribute("title","method Pipeline.RunModules in uir/query")}),await e("an icon-only pill selects its edge",async()=>{const n=a.querySelector('[data-graph-edge-label="run-build"]');if(!n)throw new Error("GraphDiagram story: the run-build edge drew no pill");await d.click(n),await c(()=>s(t.getByRole("button",{name:"Pipeline.RunModules to Build: via interface"})).toHaveAttribute("aria-pressed","true"))})}},E=12,V=18,ge=[{id:"run",label:"Pipeline.Run",level:0,tone:"info"},...Array.from({length:E},(a,e)=>({id:`step-${e}`,label:`step${e}`,level:1})),...Array.from({length:V},(a,e)=>({id:`helper-${e}`,label:`helper${e}`,level:2}))],me=Array.from({length:E},(a,e)=>[{id:`run-step-${e}`,from:"run",to:`step-${e}`,label:`stage == ${e}`,dashed:!0},...[3*e,3*e+1,5*e+2].map((t,n)=>({id:`step-${e}-call-${n}`,from:`step-${e}`,to:`helper-${t%V}`,...n===0?{label:"err != nil",dashed:!0}:{}}))]).flat(),w={name:"Dense call graph (edge focus)",args:{nodes:ge,edges:me,layout:"columns",nodeWidth:150,nodeHeight:32,rowGap:14,zoomable:!0,fitMinScale:.8,focusId:"run",maxHeight:420,ariaLabel:"Call graph of Pipeline.Run"},parameters:{docs:{description:{story:'Past 32 edges `edgeFocus="auto"` stops showing every pill: an edge shows its pill only while it is in focus — selected, hovered, or attached to the selected or hovered node — and the edges out of focus fade. The pills of a focused node sit toward the far end of each edge. `fitMinScale` keeps the diagram from opening smaller than is readable: it opens centred on `focusId` and is panned to reach the rest, `Fit to view` shows everything, and `Reset view` returns.'}}},render:a=>o.jsx(f,{...a}),play:async({canvasElement:a,step:e})=>{const t=u(a),n=()=>a.querySelectorAll("[data-graph-edge-label]").length;await e("only the selected root's edges show their pills",async()=>{await s(n()).toBe(E)}),await e("selecting a step moves the focus to its four edges, two of them labelled",async()=>{await d.click(t.getByRole("button",{name:"step4"})),await c(()=>s(n()).toBe(2))}),await e("a minimum fit scale adds Reset view",async()=>{await s(t.getByRole("button",{name:"Reset view"})).toBeInTheDocument()})}};var D,C,G;p.parameters={...p.parameters,docs:{...(D=p.parameters)==null?void 0:D.docs,source:{originalSource:`{
  args: {
    nodes: CYCLE_NODES,
    edges: CYCLE_EDGES,
    ariaLabel: "Four node deadlock cycle"
  },
  render: args => <div style={{
    maxWidth: 640
  }}>
      <GraphDiagram {...args} />
    </div>
}`,...(G=(C=p.parameters)==null?void 0:C.docs)==null?void 0:G.source}}};var R,N,k;h.parameters={...h.parameters,docs:{...(R=h.parameters)==null?void 0:R.docs,source:{originalSource:`{
  args: {
    nodes: CYCLE_NODES,
    edges: CYCLE_EDGES,
    ariaLabel: "Selectable deadlock cycle"
  },
  render: args => {
    function SelectableGraph() {
      const [selectedId, setSelectedId] = useState<string | undefined>("session-a");
      return <div style={{
        maxWidth: 640
      }}>
          <GraphDiagram {...args} selectedId={selectedId} onNodeSelect={setSelectedId} />
        </div>;
    }
    return <SelectableGraph />;
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("selected node is pressed", async () => {
      const button = canvas.getByRole("button", {
        name: /victim/
      });
      await expect(button).toHaveAttribute("aria-pressed", "true");
    });
    await step("clicking another node moves the selection", async () => {
      const survivor = canvas.getByRole("button", {
        name: /survivor/
      });
      await userEvent.click(survivor);
      await waitFor(() => expect(survivor).toHaveAttribute("aria-pressed", "true"));
      await expect(canvas.getByRole("button", {
        name: /victim/
      })).toHaveAttribute("aria-pressed", "false");
    });
  }
}`,...(k=(N=h.parameters)==null?void 0:N.docs)==null?void 0:k.source}}};var _,L,I;g.parameters={...g.parameters,docs:{...(_=g.parameters)==null?void 0:_.docs,source:{originalSource:`{
  args: {
    nodes: SINGLE_NODE,
    edges: [],
    ariaLabel: "Single isolated node"
  },
  render: args => <div style={{
    maxWidth: 320
  }}>
      <GraphDiagram {...args} />
    </div>
}`,...(I=(L=g.parameters)==null?void 0:L.docs)==null?void 0:I.source}}};var B,T,H;m.parameters={...m.parameters,docs:{...(B=m.parameters)==null?void 0:B.docs,source:{originalSource:`{
  name: "Record groups",
  args: {
    layout: "columns",
    nodeWidth: 240,
    compactNodeHeight: 22,
    recordHeaderHeight: 24,
    ariaLabel: "Record data access",
    groups: [{
      id: "Customers",
      label: <span className="flex items-center gap-1.5"><UiSqlTable />Customers</span>,
      title: "dbo.Customers",
      variant: "record"
    }],
    nodes: [{
      id: "load",
      label: "LoadCustomer",
      level: 0
    }, {
      id: "id",
      label: "ID",
      icon: <UiKey />,
      aside: "uniqueidentifier",
      level: 1,
      group: "Customers",
      size: "compact"
    }, {
      id: "name",
      label: "Name",
      icon: <UiSqlColumn />,
      aside: "nvarchar(100)",
      level: 1,
      group: "Customers",
      size: "compact"
    }, {
      id: "status",
      label: "Status",
      icon: <UiSqlColumn />,
      aside: "nvarchar(2)",
      level: 1,
      group: "Customers",
      size: "compact"
    }],
    edges: [{
      id: "load-name",
      from: "load",
      to: "name",
      label: "read",
      tone: "success"
    }]
  },
  render: args => <CallGraph {...args} />,
  parameters: {
    docs: {
      description: {
        story: "Set a group's variant to record and its members' size to compact. The header uses recordHeaderHeight; each flush row uses compactNodeHeight. The aside slot shows a type, and edges attach to the row at the card's side. A record holding a regular node fails with its group and node id."
      }
    }
  }
}`,...(H=(T=m.parameters)==null?void 0:T.docs)==null?void 0:H.source}}};var A,j,O;b.parameters={...b.parameters,docs:{...(A=b.parameters)==null?void 0:A.docs,source:{originalSource:`{
  args: {
    nodes: WIDE_RING_NODES,
    edges: WIDE_RING_EDGES,
    ariaLabel: "Eight node wait ring"
  },
  render: args => <div style={{
    maxWidth: 720
  }}>
      <GraphDiagram {...args} />
    </div>,
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("every node label is rendered", async () => {
      for (const node of WIDE_RING_NODES) {
        await expect(canvas.getByText(String(node.label))).toBeInTheDocument();
      }
    });
  }
}`,...(O=(j=b.parameters)==null?void 0:j.docs)==null?void 0:O.source}}};var P,q,M;i.parameters={...i.parameters,docs:{...(P=i.parameters)==null?void 0:P.docs,source:{originalSource:`{
  name: "Call graph (columns)",
  args: {
    nodes: CALL_NODES,
    edges: CALL_EDGES,
    groups: CALL_GROUPS,
    layout: "columns",
    nodeWidth: 176,
    nodeHeight: 48,
    columnGap: 150,
    zoomable: true,
    ariaLabel: "Call graph of Pipeline.RunModules"
  },
  parameters: {
    docs: {
      description: {
        story: "The \`columns\` layout places each node in the column of its \`level\` (callers negative, callees positive), keeps a \`group\` together inside a captioned box, and routes edges side to side: back edges return through the columns, and a self-edge or an edge inside one column loops beside it. Dashed edges are conditional; the pill shows the short guard and its tooltip the full one. \`+N\` asks the host to load more neighbours, edges and nodes are selectable, and \`zoomable\` adds ctrl/⌘ + wheel zoom, background drag and the zoom controls."
      }
    }
  },
  render: args => <CallGraph {...args} />,
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    const state = canvas.getByTestId("call-graph-state");
    await step("group captions and nodes render", async () => {
      await expect(canvas.getAllByText("uir/query").length).toBe(2);
      await expect(canvas.getByText("Pipeline.RunModules")).toBeInTheDocument();
    });
    await step("+N expands without selecting the node", async () => {
      await userEvent.click(canvas.getByRole("button", {
        name: "Expand 3 more from Store.LoadDocument"
      }));
      await waitFor(() => expect(state).toHaveTextContent("node: run · edge: none · expanded: load"));
    });
    await step("an edge is selected from its label pill", async () => {
      await userEvent.click(canvas.getByText("via interface"));
      await waitFor(() => expect(canvas.getByRole("button", {
        name: "Pipeline.RunModules to Build: via interface"
      })).toHaveAttribute("aria-pressed", "true"));
    });
  }
}`,...(M=(q=i.parameters)==null?void 0:q.docs)==null?void 0:M.source}}};var W,z,$;v.parameters={...v.parameters,docs:{...(W=v.parameters)==null?void 0:W.docs,source:{originalSource:`{
  name: "Call graph (icons)",
  args: {
    ...CallGraphColumns.args,
    nodes: ICON_NODES,
    edges: ICON_EDGES,
    nodeHeight: 32,
    rowGap: 14
  },
  parameters: {
    docs: {
      description: {
        story: "A node's \`icon\` sits before its label, so the kind needs no second line and the node can be one line tall; below 44px the label is cut with an ellipsis instead of wrapping. The node's \`title\` is its tooltip and carries the words the icon replaced. An edge's \`icon\` sits in its pill before the label, or alone when the edge has no label; \`iconLabel\` says the icon in words in the edge's accessible name."
      }
    }
  },
  render: args => <CallGraph {...args} />,
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step("a node is named by its icon and its label", async () => {
      await expect(canvas.getByRole("button", {
        name: "method Pipeline.RunModules"
      })).toHaveAttribute("title", "method Pipeline.RunModules in uir/query");
    });
    await step("an icon-only pill selects its edge", async () => {
      const pill = canvasElement.querySelector<HTMLElement>('[data-graph-edge-label="run-build"]');
      if (!pill) throw new Error("GraphDiagram story: the run-build edge drew no pill");
      await userEvent.click(pill);
      await waitFor(() => expect(canvas.getByRole("button", {
        name: "Pipeline.RunModules to Build: via interface"
      })).toHaveAttribute("aria-pressed", "true"));
    });
  }
}`,...($=(z=v.parameters)==null?void 0:z.docs)==null?void 0:$.source}}};var U,F,Y;w.parameters={...w.parameters,docs:{...(U=w.parameters)==null?void 0:U.docs,source:{originalSource:`{
  name: "Dense call graph (edge focus)",
  args: {
    nodes: DENSE_NODES,
    edges: DENSE_EDGES,
    layout: "columns",
    nodeWidth: 150,
    nodeHeight: 32,
    rowGap: 14,
    zoomable: true,
    fitMinScale: 0.8,
    focusId: "run",
    maxHeight: 420,
    ariaLabel: "Call graph of Pipeline.Run"
  },
  parameters: {
    docs: {
      description: {
        story: "Past 32 edges \`edgeFocus=\\"auto\\"\` stops showing every pill: an edge shows its pill only while it is in focus — selected, hovered, or attached to the selected or hovered node — and the edges out of focus fade. The pills of a focused node sit toward the far end of each edge. \`fitMinScale\` keeps the diagram from opening smaller than is readable: it opens centred on \`focusId\` and is panned to reach the rest, \`Fit to view\` shows everything, and \`Reset view\` returns."
      }
    }
  },
  render: args => <CallGraph {...args} />,
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    const pills = () => canvasElement.querySelectorAll("[data-graph-edge-label]").length;
    await step("only the selected root's edges show their pills", async () => {
      await expect(pills()).toBe(DENSE_STEPS);
    });
    await step("selecting a step moves the focus to its four edges, two of them labelled", async () => {
      await userEvent.click(canvas.getByRole("button", {
        name: "step4"
      }));
      await waitFor(() => expect(pills()).toBe(2));
    });
    await step("a minimum fit scale adds Reset view", async () => {
      await expect(canvas.getByRole("button", {
        name: "Reset view"
      })).toBeInTheDocument();
    });
  }
}`,...(Y=(F=w.parameters)==null?void 0:F.docs)==null?void 0:Y.source}}};const xe=["Default","Selectable","SingleNode","RecordGroups","EightNodeRing","CallGraphColumns","CallGraphIcons","DenseCallGraph"];export{i as CallGraphColumns,v as CallGraphIcons,p as Default,w as DenseCallGraph,b as EightNodeRing,m as RecordGroups,h as Selectable,g as SingleNode,xe as __namedExportsOrder,Ee as default};
