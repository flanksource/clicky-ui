import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{t}from"./react-pByjoP3I.js";import{t as n}from"./jsx-runtime-BG4KOiPz.js";import{Ka as r,Qa as i,Wa as a,ba as o,ca as s,ga as c,n as l,ss as u}from"./icons-N6BqLuiz.js";import{n as d,t as f}from"./GraphDiagram-grAQA-hm.js";function p(e){let[t,n]=(0,m.useState)(`run`),[r,i]=(0,m.useState)(),[a,o]=(0,m.useState)();return(0,h.jsxs)(`div`,{style:{maxWidth:1100},children:[(0,h.jsx)(f,{...e,onNodeSelect:n,onEdgeSelect:i,onNodeExpand:o,...t===void 0?{}:{selectedId:t},...r===void 0?{}:{selectedEdgeId:r}}),(0,h.jsxs)(`p`,{"data-testid":`call-graph-state`,style:{fontSize:12},children:[`node: `,t??`none`,` · edge: `,r??`none`,` · expanded: `,a??`none`]})]})}var m,h,g,_,v,y,b,x,S,C,w,T,E,D,O,k,A,j,M,N,P,F,I,L,R,z,B,V,H,U,W;function G(){return(G=e((()=>{m=t(),l(),d(),h=n(),{expect:g,userEvent:_,waitFor:v,within:y}=__STORYBOOK_MODULE_TEST__,b={title:`Data/GraphDiagram`,component:f,tags:[`autodocs`],parameters:{docs:{description:{component:"Generic, type-agnostic node/edge diagram. The `ring` layout places nodes on a circle so small cycles and reciprocal edges read clearly; the `columns` layout places nodes in the column of their `level` for a directed graph with a natural depth, such as a call graph. The component carries no domain fields; a producer maps its own model onto `GraphDiagramNode`/`GraphDiagramEdge`."}}},args:{ariaLabel:`Example graph`}},x=[{id:`session-a`,label:`Session 93 · victim`,tone:`danger`},{id:`resource-r1`,label:`Lock A`,detail:`keylock`,shape:`pill`},{id:`session-b`,label:`Session 47 · survivor`,tone:`success`},{id:`resource-r2`,label:`Lock B`,detail:`keylock`,shape:`pill`}],S=[{id:`e1`,from:`resource-r1`,to:`session-a`,label:`holds X`,tone:`info`},{id:`e2`,from:`session-a`,to:`resource-r2`,label:`wants S`,tone:`warning`,dashed:!0},{id:`e3`,from:`resource-r2`,to:`session-b`,label:`holds S`,tone:`info`},{id:`e4`,from:`session-b`,to:`resource-r1`,label:`wants X`,tone:`warning`,dashed:!0},{id:`e5`,from:`resource-r1`,to:`session-b`,label:`holds S`,tone:`info`}],C={args:{nodes:x,edges:S,ariaLabel:`Four node deadlock cycle`},render:e=>(0,h.jsx)(`div`,{style:{maxWidth:640},children:(0,h.jsx)(f,{...e})})},w={args:{nodes:x,edges:S,ariaLabel:`Selectable deadlock cycle`},render:e=>{function t(){let[t,n]=(0,m.useState)(`session-a`);return(0,h.jsx)(`div`,{style:{maxWidth:640},children:(0,h.jsx)(f,{...e,selectedId:t,onNodeSelect:n})})}return(0,h.jsx)(t,{})},play:async({canvasElement:e,step:t})=>{let n=y(e);await t(`selected node is pressed`,async()=>{let e=n.getByRole(`button`,{name:/victim/});await g(e).toHaveAttribute(`aria-pressed`,`true`)}),await t(`clicking another node moves the selection`,async()=>{let e=n.getByRole(`button`,{name:/survivor/});await _.click(e),await v(()=>g(e).toHaveAttribute(`aria-pressed`,`true`)),await g(n.getByRole(`button`,{name:/victim/})).toHaveAttribute(`aria-pressed`,`false`)})}},T=[{id:`only`,label:`Isolated resource`,detail:`no contention`}],E={args:{nodes:T,edges:[],ariaLabel:`Single isolated node`},render:e=>(0,h.jsx)(`div`,{style:{maxWidth:320},children:(0,h.jsx)(f,{...e})})},D={name:`Record groups`,args:{layout:`columns`,nodeWidth:240,compactNodeHeight:22,recordHeaderHeight:24,ariaLabel:`Record data access`,groups:[{id:`Customers`,label:(0,h.jsxs)(`span`,{className:`flex items-center gap-1.5`,children:[(0,h.jsx)(c,{}),`Customers`]}),title:`dbo.Customers`,variant:`record`}],nodes:[{id:`load`,label:`LoadCustomer`,level:0},{id:`id`,label:`ID`,icon:(0,h.jsx)(u,{}),aside:`uniqueidentifier`,level:1,group:`Customers`,size:`compact`},{id:`name`,label:`Name`,icon:(0,h.jsx)(s,{}),aside:`nvarchar(100)`,level:1,group:`Customers`,size:`compact`},{id:`status`,label:`Status`,icon:(0,h.jsx)(s,{}),aside:`nvarchar(2)`,level:1,group:`Customers`,size:`compact`}],edges:[{id:`load-name`,from:`load`,to:`name`,label:`read`,tone:`success`}]},render:e=>(0,h.jsx)(p,{...e}),parameters:{docs:{description:{story:`Set a group's variant to record and its members' size to compact. The header uses recordHeaderHeight; each flush row uses compactNodeHeight. The aside slot shows a type, and edges attach to the row at the card's side. A record holding a regular node fails with its group and node id.`}}}},O=Array.from({length:8},(e,t)=>({id:`node-${t}`,label:`Session ${t+1}`,tone:t%2==0?`info`:`neutral`})),k=O.map((e,t)=>({id:`edge-${t}`,from:e.id,to:O[(t+1)%O.length].id,label:`waits on`})),A={args:{nodes:O,edges:k,ariaLabel:`Eight node wait ring`},render:e=>(0,h.jsx)(`div`,{style:{maxWidth:720},children:(0,h.jsx)(f,{...e})}),play:async({canvasElement:e,step:t})=>{let n=y(e);await t(`every node label is rendered`,async()=>{for(let e of O)await g(n.getByText(String(e.label))).toBeInTheDocument()})}},j=[{id:`cmd/uir`,label:`cmd/uir`,title:`github.com/flanksource/uir/cmd/uir`},{id:`uir/query`,label:`uir/query`,title:`github.com/flanksource/uir/query`},{id:`uir/graph`,label:`uir/graph`,title:`github.com/flanksource/uir/graph`},{id:`uir/storage`,label:`uir/storage`,title:`github.com/flanksource/uir/storage`}],M=[{id:`serve`,label:`serveModuleGraph`,detail:`func`,level:-1,group:`cmd/uir`,expandCount:2},{id:`cli`,label:`runGraphCommand`,detail:`func`,level:-1,group:`cmd/uir`},{id:`run`,label:`Pipeline.RunModules`,detail:`method`,level:0,group:`uir/query`,tone:`info`},{id:`resolve`,label:`Pipeline.resolveSelector`,detail:`method`,level:1,group:`uir/query`},{id:`graph`,label:`Pipeline.Graph`,detail:`method`,level:1,group:`uir/query`},{id:`build`,label:`Build`,detail:`func`,level:1,group:`uir/graph`},{id:`load`,label:`Store.LoadDocument`,detail:`method`,level:2,group:`uir/storage`,expandCount:3},{id:`walk`,label:`walk`,detail:`func`,level:2,group:`uir/graph`},{id:`lookup`,label:`plugin.Lookup`,detail:`unresolved`,level:2,tone:`warning`,muted:!0}],N=[{id:`serve-run`,from:`serve`,to:`run`},{id:`cli-run`,from:`cli`,to:`run`,label:`len(args) > 0`,title:`len(args) > 0`,dashed:!0},{id:`run-resolve`,from:`run`,to:`resolve`},{id:`run-graph`,from:`run`,to:`graph`,label:`opts.Depth > 0 ×2`,title:`opts != nil ∧ opts.Depth > 0`,dashed:!0},{id:`run-build`,from:`run`,to:`build`,label:`via interface`,tone:`info`},{id:`graph-build`,from:`graph`,to:`build`},{id:`resolve-load`,from:`resolve`,to:`load`,label:`!cached`,title:`!cached`,dashed:!0},{id:`build-walk`,from:`build`,to:`walk`},{id:`build-lookup`,from:`build`,to:`lookup`,tone:`warning`},{id:`walk-walk`,from:`walk`,to:`walk`,label:`depth < limit`,title:`depth < limit`,dashed:!0},{id:`walk-graph`,from:`walk`,to:`graph`}],P={name:`Call graph (columns)`,args:{nodes:M,edges:N,groups:j,layout:`columns`,nodeWidth:176,nodeHeight:48,columnGap:150,zoomable:!0,ariaLabel:`Call graph of Pipeline.RunModules`},parameters:{docs:{description:{story:"The `columns` layout places each node in the column of its `level` (callers negative, callees positive), keeps a `group` together inside a captioned box, and routes edges side to side: back edges return through the columns, and a self-edge or an edge inside one column loops beside it. Dashed edges are conditional; the pill shows the short guard and its tooltip the full one. `+N` asks the host to load more neighbours, edges and nodes are selectable, and `zoomable` adds ctrl/⌘ + wheel zoom, background drag and the zoom controls."}}},render:e=>(0,h.jsx)(p,{...e}),play:async({canvasElement:e,step:t})=>{let n=y(e),r=n.getByTestId(`call-graph-state`);await t(`group captions and nodes render`,async()=>{await g(n.getAllByText(`uir/query`).length).toBe(2),await g(n.getByText(`Pipeline.RunModules`)).toBeInTheDocument()}),await t(`+N expands without selecting the node`,async()=>{await _.click(n.getByRole(`button`,{name:`Expand 3 more from Store.LoadDocument`})),await v(()=>g(r).toHaveTextContent(`node: run · edge: none · expanded: load`))}),await t(`an edge is selected from its label pill`,async()=>{await _.click(n.getByText(`via interface`)),await v(()=>g(n.getByRole(`button`,{name:`Pipeline.RunModules to Build: via interface`})).toHaveAttribute(`aria-pressed`,`true`))})}},F=[{detail:`method`,words:`method`,icon:(0,h.jsx)(a,{title:`method`})},{detail:`func`,words:`function`,icon:(0,h.jsx)(r,{title:`function`})},{detail:`unresolved`,words:`unresolved call`,icon:(0,h.jsx)(o,{title:`unresolved call`})}],I=M.map(({detail:e,...t})=>{let n=F.find(t=>t.detail===e);if(!n)throw Error(`GraphDiagram story: no icon for node kind "${String(e)}"`);let r=t.group===void 0?``:` in ${t.group}`;return{...t,icon:n.icon,title:`${n.words} ${String(t.label)}${r}`}}),L=N.map(e=>e.id===`run-build`?{id:e.id,from:e.from,to:e.to,tone:`info`,icon:(0,h.jsx)(i,{title:`via interface`}),iconLabel:`via interface`}:e),R={name:`Call graph (icons)`,args:{...P.args,nodes:I,edges:L,nodeHeight:32,rowGap:14},parameters:{docs:{description:{story:"A node's `icon` sits before its label, so the kind needs no second line and the node can be one line tall; below 44px the label is cut with an ellipsis instead of wrapping. The node's `title` is its tooltip and carries the words the icon replaced. An edge's `icon` sits in its pill before the label, or alone when the edge has no label; `iconLabel` says the icon in words in the edge's accessible name."}}},render:e=>(0,h.jsx)(p,{...e}),play:async({canvasElement:e,step:t})=>{let n=y(e);await t(`a node is named by its icon and its label`,async()=>{await g(n.getByRole(`button`,{name:`method Pipeline.RunModules`})).toHaveAttribute(`title`,`method Pipeline.RunModules in uir/query`)}),await t(`an icon-only pill selects its edge`,async()=>{let t=e.querySelector(`[data-graph-edge-label="run-build"]`);if(!t)throw Error(`GraphDiagram story: the run-build edge drew no pill`);await _.click(t),await v(()=>g(n.getByRole(`button`,{name:`Pipeline.RunModules to Build: via interface`})).toHaveAttribute(`aria-pressed`,`true`))})}},z=12,B=18,V=[{id:`run`,label:`Pipeline.Run`,level:0,tone:`info`},...Array.from({length:z},(e,t)=>({id:`step-${t}`,label:`step${t}`,level:1})),...Array.from({length:B},(e,t)=>({id:`helper-${t}`,label:`helper${t}`,level:2}))],H=Array.from({length:z},(e,t)=>[{id:`run-step-${t}`,from:`run`,to:`step-${t}`,label:`stage == ${t}`,dashed:!0},...[3*t,3*t+1,5*t+2].map((e,n)=>({id:`step-${t}-call-${n}`,from:`step-${t}`,to:`helper-${e%B}`,...n===0?{label:`err != nil`,dashed:!0}:{}}))]).flat(),U={name:`Dense call graph (edge focus)`,args:{nodes:V,edges:H,layout:`columns`,nodeWidth:150,nodeHeight:32,rowGap:14,zoomable:!0,fitMinScale:.8,focusId:`run`,maxHeight:420,ariaLabel:`Call graph of Pipeline.Run`},parameters:{docs:{description:{story:'Past 32 edges `edgeFocus="auto"` stops showing every pill: an edge shows its pill only while it is in focus — selected, hovered, or attached to the selected or hovered node — and the edges out of focus fade. The pills of a focused node sit toward the far end of each edge. `fitMinScale` keeps the diagram from opening smaller than is readable: it opens centred on `focusId` and is panned to reach the rest, `Fit to view` shows everything, and `Reset view` returns.'}}},render:e=>(0,h.jsx)(p,{...e}),play:async({canvasElement:e,step:t})=>{let n=y(e),r=()=>e.querySelectorAll(`[data-graph-edge-label]`).length;await t(`only the selected root's edges show their pills`,async()=>{await g(r()).toBe(z)}),await t(`selecting a step moves the focus to its four edges, two of them labelled`,async()=>{await _.click(n.getByRole(`button`,{name:`step4`})),await v(()=>g(r()).toBe(2))}),await t(`a minimum fit scale adds Reset view`,async()=>{await g(n.getByRole(`button`,{name:`Reset view`})).toBeInTheDocument()})}},W=[`Default`,`Selectable`,`SingleNode`,`RecordGroups`,`EightNodeRing`,`CallGraphColumns`,`CallGraphIcons`,`DenseCallGraph`],C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
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
}`,...C.parameters?.docs?.source}}},w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
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
}`,...w.parameters?.docs?.source}}},E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{
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
}`,...E.parameters?.docs?.source}}},D.parameters={...D.parameters,docs:{...D.parameters?.docs,source:{originalSource:`{
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
}`,...D.parameters?.docs?.source}}},A.parameters={...A.parameters,docs:{...A.parameters?.docs,source:{originalSource:`{
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
}`,...A.parameters?.docs?.source}}},P.parameters={...P.parameters,docs:{...P.parameters?.docs,source:{originalSource:`{
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
}`,...P.parameters?.docs?.source}}},R.parameters={...R.parameters,docs:{...R.parameters?.docs,source:{originalSource:`{
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
}`,...R.parameters?.docs?.source}}},U.parameters={...U.parameters,docs:{...U.parameters?.docs,source:{originalSource:`{
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
}`,...U.parameters?.docs?.source}}}})))()}G();export{P as CallGraphColumns,R as CallGraphIcons,C as Default,U as DenseCallGraph,A as EightNodeRing,D as RecordGroups,w as Selectable,E as SingleNode,W as __namedExportsOrder,b as default};