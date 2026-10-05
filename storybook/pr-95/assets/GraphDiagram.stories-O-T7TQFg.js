import{j as o,ac as J,r as w,ad as Q,ae as V,af as Z}from"./iframe-yuMqpJhb.js";import{G as r}from"./GraphDiagram-BRtCBBas.js";import"./preload-helper-DxStcPpW.js";import"./utils-DW-IJACk.js";import"./IconButton-CLZ4GHfp.js";import"./Icon-DbERJsbC.js";const{expect:s,userEvent:d,waitFor:c,within:u}=__STORYBOOK_MODULE_TEST__,me={title:"Data/GraphDiagram",component:r,tags:["autodocs"],parameters:{docs:{description:{component:"Generic, type-agnostic node/edge diagram. The `ring` layout places nodes on a circle so small cycles and reciprocal edges read clearly; the `columns` layout places nodes in the column of their `level` for a directed graph with a natural depth, such as a call graph. The component carries no domain fields; a producer maps its own model onto `GraphDiagramNode`/`GraphDiagramEdge`."}}},args:{ariaLabel:"Example graph"}},q=[{id:"session-a",label:"Session 93 · victim",tone:"danger"},{id:"resource-r1",label:"Lock A",detail:"keylock",shape:"pill"},{id:"session-b",label:"Session 47 · survivor",tone:"success"},{id:"resource-r2",label:"Lock B",detail:"keylock",shape:"pill"}],F=[{id:"e1",from:"resource-r1",to:"session-a",label:"holds X",tone:"info"},{id:"e2",from:"session-a",to:"resource-r2",label:"wants S",tone:"warning",dashed:!0},{id:"e3",from:"resource-r2",to:"session-b",label:"holds S",tone:"info"},{id:"e4",from:"session-b",to:"resource-r1",label:"wants X",tone:"warning",dashed:!0},{id:"e5",from:"resource-r1",to:"session-b",label:"holds S",tone:"info"}],p={args:{nodes:q,edges:F,ariaLabel:"Four node deadlock cycle"},render:a=>o.jsx("div",{style:{maxWidth:640},children:o.jsx(r,{...a})})},h={args:{nodes:q,edges:F,ariaLabel:"Selectable deadlock cycle"},render:a=>{function e(){const[n,t]=w.useState("session-a");return o.jsx("div",{style:{maxWidth:640},children:o.jsx(r,{...a,selectedId:n,onNodeSelect:t})})}return o.jsx(e,{})},play:async({canvasElement:a,step:e})=>{const n=u(a);await e("selected node is pressed",async()=>{const t=n.getByRole("button",{name:/victim/});await s(t).toHaveAttribute("aria-pressed","true")}),await e("clicking another node moves the selection",async()=>{const t=n.getByRole("button",{name:/survivor/});await d.click(t),await c(()=>s(t).toHaveAttribute("aria-pressed","true")),await s(n.getByRole("button",{name:/victim/})).toHaveAttribute("aria-pressed","false")})}},ee=[{id:"only",label:"Isolated resource",detail:"no contention"}],g={args:{nodes:ee,edges:[],ariaLabel:"Single isolated node"},render:a=>o.jsx("div",{style:{maxWidth:320},children:o.jsx(r,{...a})})},ae=8,l=Array.from({length:ae},(a,e)=>({id:`node-${e}`,label:`Session ${e+1}`,tone:e%2===0?"info":"neutral"})),ne=l.map((a,e)=>({id:`edge-${e}`,from:a.id,to:l[(e+1)%l.length].id,label:"waits on"})),m={args:{nodes:l,edges:ne,ariaLabel:"Eight node wait ring"},render:a=>o.jsx("div",{style:{maxWidth:720},children:o.jsx(r,{...a})}),play:async({canvasElement:a,step:e})=>{const n=u(a);await e("every node label is rendered",async()=>{for(const t of l)await s(n.getByText(String(t.label))).toBeInTheDocument()})}},te=[{id:"cmd/uir",label:"cmd/uir",title:"github.com/flanksource/uir/cmd/uir"},{id:"uir/query",label:"uir/query",title:"github.com/flanksource/uir/query"},{id:"uir/graph",label:"uir/graph",title:"github.com/flanksource/uir/graph"},{id:"uir/storage",label:"uir/storage",title:"github.com/flanksource/uir/storage"}],z=[{id:"serve",label:"serveModuleGraph",detail:"func",level:-1,group:"cmd/uir",expandCount:2},{id:"cli",label:"runGraphCommand",detail:"func",level:-1,group:"cmd/uir"},{id:"run",label:"Pipeline.RunModules",detail:"method",level:0,group:"uir/query",tone:"info"},{id:"resolve",label:"Pipeline.resolveSelector",detail:"method",level:1,group:"uir/query"},{id:"graph",label:"Pipeline.Graph",detail:"method",level:1,group:"uir/query"},{id:"build",label:"Build",detail:"func",level:1,group:"uir/graph"},{id:"load",label:"Store.LoadDocument",detail:"method",level:2,group:"uir/storage",expandCount:3},{id:"walk",label:"walk",detail:"func",level:2,group:"uir/graph"},{id:"lookup",label:"plugin.Lookup",detail:"unresolved",level:2,tone:"warning",muted:!0}],U=[{id:"serve-run",from:"serve",to:"run"},{id:"cli-run",from:"cli",to:"run",label:"len(args) > 0",title:"len(args) > 0",dashed:!0},{id:"run-resolve",from:"run",to:"resolve"},{id:"run-graph",from:"run",to:"graph",label:"opts.Depth > 0 ×2",title:"opts != nil ∧ opts.Depth > 0",dashed:!0},{id:"run-build",from:"run",to:"build",label:"via interface",tone:"info"},{id:"graph-build",from:"graph",to:"build"},{id:"resolve-load",from:"resolve",to:"load",label:"!cached",title:"!cached",dashed:!0},{id:"build-walk",from:"build",to:"walk"},{id:"build-lookup",from:"build",to:"lookup",tone:"warning"},{id:"walk-walk",from:"walk",to:"walk",label:"depth < limit",title:"depth < limit",dashed:!0},{id:"walk-graph",from:"walk",to:"graph"}];function f(a){const[e,n]=w.useState("run"),[t,y]=w.useState(),[K,X]=w.useState();return o.jsxs("div",{style:{maxWidth:1100},children:[o.jsx(r,{...a,onNodeSelect:n,onEdgeSelect:y,onNodeExpand:X,...e!==void 0?{selectedId:e}:{},...t!==void 0?{selectedEdgeId:t}:{}}),o.jsxs("p",{"data-testid":"call-graph-state",style:{fontSize:12},children:["node: ",e??"none"," · edge: ",t??"none"," · expanded: ",K??"none"]})]})}const i={name:"Call graph (columns)",args:{nodes:z,edges:U,groups:te,layout:"columns",nodeWidth:176,nodeHeight:48,columnGap:150,zoomable:!0,ariaLabel:"Call graph of Pipeline.RunModules"},parameters:{docs:{description:{story:"The `columns` layout places each node in the column of its `level` (callers negative, callees positive), keeps a `group` together inside a captioned box, and routes edges side to side: back edges return through the columns, and a self-edge or an edge inside one column loops beside it. Dashed edges are conditional; the pill shows the short guard and its tooltip the full one. `+N` asks the host to load more neighbours, edges and nodes are selectable, and `zoomable` adds ctrl/⌘ + wheel zoom, background drag and the zoom controls."}}},render:a=>o.jsx(f,{...a}),play:async({canvasElement:a,step:e})=>{const n=u(a),t=n.getByTestId("call-graph-state");await e("group captions and nodes render",async()=>{await s(n.getAllByText("uir/query").length).toBe(2),await s(n.getByText("Pipeline.RunModules")).toBeInTheDocument()}),await e("+N expands without selecting the node",async()=>{await d.click(n.getByRole("button",{name:"Expand 3 more from Store.LoadDocument"})),await c(()=>s(t).toHaveTextContent("node: run · edge: none · expanded: load"))}),await e("an edge is selected from its label pill",async()=>{await d.click(n.getByText("via interface")),await c(()=>s(n.getByRole("button",{name:"Pipeline.RunModules to Build: via interface"})).toHaveAttribute("aria-pressed","true"))})}},oe=[{detail:"method",words:"method",icon:o.jsx(Q,{title:"method"})},{detail:"func",words:"function",icon:o.jsx(V,{title:"function"})},{detail:"unresolved",words:"unresolved call",icon:o.jsx(Z,{title:"unresolved call"})}],se=z.map(({detail:a,...e})=>{const n=oe.find(y=>y.detail===a);if(!n)throw new Error(`GraphDiagram story: no icon for node kind "${String(a)}"`);const t=e.group===void 0?"":` in ${e.group}`;return{...e,icon:n.icon,title:`${n.words} ${String(e.label)}${t}`}}),re=U.map(a=>a.id==="run-build"?{id:a.id,from:a.from,to:a.to,tone:"info",icon:o.jsx(J,{title:"via interface"}),iconLabel:"via interface"}:a),b={name:"Call graph (icons)",args:{...i.args,nodes:se,edges:re,nodeHeight:32,rowGap:14},parameters:{docs:{description:{story:"A node's `icon` sits before its label, so the kind needs no second line and the node can be one line tall; below 44px the label is cut with an ellipsis instead of wrapping. The node's `title` is its tooltip and carries the words the icon replaced. An edge's `icon` sits in its pill before the label, or alone when the edge has no label; `iconLabel` says the icon in words in the edge's accessible name."}}},render:a=>o.jsx(f,{...a}),play:async({canvasElement:a,step:e})=>{const n=u(a);await e("a node is named by its icon and its label",async()=>{await s(n.getByRole("button",{name:"method Pipeline.RunModules"})).toHaveAttribute("title","method Pipeline.RunModules in uir/query")}),await e("an icon-only pill selects its edge",async()=>{const t=a.querySelector('[data-graph-edge-label="run-build"]');if(!t)throw new Error("GraphDiagram story: the run-build edge drew no pill");await d.click(t),await c(()=>s(n.getByRole("button",{name:"Pipeline.RunModules to Build: via interface"})).toHaveAttribute("aria-pressed","true"))})}},E=12,Y=18,ie=[{id:"run",label:"Pipeline.Run",level:0,tone:"info"},...Array.from({length:E},(a,e)=>({id:`step-${e}`,label:`step${e}`,level:1})),...Array.from({length:Y},(a,e)=>({id:`helper-${e}`,label:`helper${e}`,level:2}))],le=Array.from({length:E},(a,e)=>[{id:`run-step-${e}`,from:"run",to:`step-${e}`,label:`stage == ${e}`,dashed:!0},...[3*e,3*e+1,5*e+2].map((n,t)=>({id:`step-${e}-call-${t}`,from:`step-${e}`,to:`helper-${n%Y}`,...t===0?{label:"err != nil",dashed:!0}:{}}))]).flat(),v={name:"Dense call graph (edge focus)",args:{nodes:ie,edges:le,layout:"columns",nodeWidth:150,nodeHeight:32,rowGap:14,zoomable:!0,fitMinScale:.8,focusId:"run",maxHeight:420,ariaLabel:"Call graph of Pipeline.Run"},parameters:{docs:{description:{story:'Past 32 edges `edgeFocus="auto"` stops showing every pill: an edge shows its pill only while it is in focus — selected, hovered, or attached to the selected or hovered node — and the edges out of focus fade. The pills of a focused node sit toward the far end of each edge. `fitMinScale` keeps the diagram from opening smaller than is readable: it opens centred on `focusId` and is panned to reach the rest, `Fit to view` shows everything, and `Reset view` returns.'}}},render:a=>o.jsx(f,{...a}),play:async({canvasElement:a,step:e})=>{const n=u(a),t=()=>a.querySelectorAll("[data-graph-edge-label]").length;await e("only the selected root's edges show their pills",async()=>{await s(t()).toBe(E)}),await e("selecting a step moves the focus to its four edges, two of them labelled",async()=>{await d.click(n.getByRole("button",{name:"step4"})),await c(()=>s(t()).toBe(2))}),await e("a minimum fit scale adds Reset view",async()=>{await s(n.getByRole("button",{name:"Reset view"})).toBeInTheDocument()})}};var S,x,D;p.parameters={...p.parameters,docs:{...(S=p.parameters)==null?void 0:S.docs,source:{originalSource:`{
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
}`,...(D=(x=p.parameters)==null?void 0:x.docs)==null?void 0:D.source}}};var G,k,R;h.parameters={...h.parameters,docs:{...(G=h.parameters)==null?void 0:G.docs,source:{originalSource:`{
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
}`,...(R=(k=h.parameters)==null?void 0:k.docs)==null?void 0:R.source}}};var C,N,_;g.parameters={...g.parameters,docs:{...(C=g.parameters)==null?void 0:C.docs,source:{originalSource:`{
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
}`,...(_=(N=g.parameters)==null?void 0:N.docs)==null?void 0:_.source}}};var B,I,L;m.parameters={...m.parameters,docs:{...(B=m.parameters)==null?void 0:B.docs,source:{originalSource:`{
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
}`,...(L=(I=m.parameters)==null?void 0:I.docs)==null?void 0:L.source}}};var T,A,O;i.parameters={...i.parameters,docs:{...(T=i.parameters)==null?void 0:T.docs,source:{originalSource:`{
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
}`,...(O=(A=i.parameters)==null?void 0:A.docs)==null?void 0:O.source}}};var P,H,j;b.parameters={...b.parameters,docs:{...(P=b.parameters)==null?void 0:P.docs,source:{originalSource:`{
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
}`,...(j=(H=b.parameters)==null?void 0:H.docs)==null?void 0:j.source}}};var M,$,W;v.parameters={...v.parameters,docs:{...(M=v.parameters)==null?void 0:M.docs,source:{originalSource:`{
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
}`,...(W=($=v.parameters)==null?void 0:$.docs)==null?void 0:W.source}}};const be=["Default","Selectable","SingleNode","EightNodeRing","CallGraphColumns","CallGraphIcons","DenseCallGraph"];export{i as CallGraphColumns,b as CallGraphIcons,p as Default,v as DenseCallGraph,m as EightNodeRing,h as Selectable,g as SingleNode,be as __namedExportsOrder,me as default};
