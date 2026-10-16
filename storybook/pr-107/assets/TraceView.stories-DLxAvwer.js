import{j as r}from"./iframe-BsAqiW63.js";import{g as T,h as Y,d as z,t as C,c as F,b as J,s as W}from"./fixtures-C3TGvGxW.js";import{T as t}from"./TraceView-Due3q5iO.js";import"./preload-helper-Drww7zV3.js";import"./utils-DW-IJACk.js";import"./DataTable-BJptSIQ7.js";import"./SortableHeader-kFQrF4xZ.js";import"./loading-BJEbCWIe.js";import"./router-BgYu87PQ.js";import"./Modal-qlF4Wnfg.js";import"./index-DEP2UBhX.js";import"./index-DuXfw_hg.js";import"./Icon-Dyy6aaqa.js";import"./button-BtSAOAKJ.js";import"./index-CPURVhFy.js";import"./modalStack-DSQeidlD.js";import"./zIndex-BGbNBNA8.js";import"./FilterBar-BRWLo9rk.js";import"./floating-ui.react-C__wji9y.js";import"./FilterPill-Bzw0s4Xn.js";import"./filter-bar-multi-UjrkZIQp.js";import"./Combobox-BKuWHLhN.js";import"./json-schema-form-size-E77C3uZS.js";import"./timestamp-format-DJzkpO9P.js";import"./DateTimePicker-Bx8fiptj.js";import"./MultiSelect-C8zfQc50.js";import"./RangeSlider-DPi11dKG.js";import"./TimeRange-BYkBh0gt.js";import"./select-Dx3dTqXz.js";import"./WorkloadPicker-Bi9tT_P3.js";import"./NamespacePicker-my8PKnLF.js";import"./index-CMSqFLvx.js";import"./data-table-filter-values-BoCQDwQ9.js";import"./duration-BuesBvhN.js";import"./Timestamp-VJO0GUDl.js";import"./TagList-B5FA-7SG.js";import"./Badge-BSYyZDva.js";import"./badge-variants-BNgEarpT.js";import"./HoverCard-DFfEldqR.js";import"./Properties-DOLNt58n.js";import"./IconButton-CrvV3w7r.js";import"./DropdownMenu-CRLAXTiF.js";import"./DropdownMenuSubmenu-CyJ-SNUG.js";import"./format-2niohfpq.js";import"./JsonView-MllwN6TG.js";import"./AccordionList-CmL7DXC2.js";import"./collections-CoHfwOze.js";import"./StatusDot-CrwAY-qs.js";import"./StackDumpView-w425JzSB.js";import"./frame-heuristics-D62qKi0n.js";import"./JvmStackTrace-Dgyu4kSq.js";import"./StackFrameRow-BaIi5t3a.js";import"./FrameSourceWindow-C7BkTYwa.js";import"./code-highlight-DwCrX-Hn.js";import"./HighlightedTokens-BUaKcwG1.js";import"./GoProfileView-Da4fihJ1.js";import"./process-tree-BV4Gc7wn.js";import"./stack-checkpoints-UeFU0tRC.js";import"./ProcessTraceTree-BMcVaZcZ.js";import"./utils-Cc6tkQt_.js";import"./Tree-CVzpFtCq.js";import"./TreeNode-DwfXB92K.js";import"./SqlTraceTable-DDkz9gNw.js";import"./Switch-EcEvbvOl.js";import"./CodeBlock-BNi0pMSL.js";import"./CodeDiff-Y1v5LX7n.js";import"./SegmentedControl-CKXvowSa.js";import"./code-diff-BUXB4Bx8.js";import"./TerminalCastPlayer-Cqy8Ridx.js";import"./AnsiHtml-fT4U1N1H.js";import"./TraceHarView-CqJW7wFH.js";import"./HarPanel-Dn5MhPvi.js";import"./use-resource-clock-BDxUuUeC.js";const{expect:s,within:a}=__STORYBOOK_MODULE_TEST__,hr={title:"Data/Traces/TraceView",component:t,parameters:{docs:{description:{component:"Dispatches a trace kind's records to its viewer: `http` / `http_proxy` to a HAR panel, `pg_proxy` / `sql_statements` to a SQL table, `terminal` to a cast player, `process_tree` to a process tree, `goprof` to a Go profile view per process, `stacks` to a stack dump per checkpoint per process, and any other kind to a table over the row keys. A row missing the field its viewer needs throws, naming the kind and the row."}}}},o=e=>r.jsx("div",{className:"h-[480px] rounded-md border border-border",children:e}),n={render:()=>o(r.jsx(t,{kind:"http",rows:Y}))},i={render:()=>o(r.jsx(t,{kind:"http_proxy",rows:Y}))},c={render:()=>o(r.jsx(t,{kind:"pg_proxy",rows:z}))},p={render:()=>o(r.jsx(t,{kind:"sql_statements",rows:z}))},m={render:()=>o(r.jsx(t,{kind:"terminal",rows:C})),play:async({canvasElement:e})=>{await s(a(e).getByText("exit 0")).toBeInTheDocument()}},d={render:()=>o(r.jsx(t,{kind:"process_tree",rows:J,samples:F}))},l={render:()=>o(r.jsx(t,{kind:"goprof",rows:T})),play:async({canvasElement:e})=>{await s(await a(e).findByText("Total 2.3 s across 7 functions")).toBeInTheDocument()}},w={render:()=>o(r.jsx(t,{kind:"goprof",rows:[...T,...T.map(e=>({...e,key:"101:100",checkpointId:`${e.checkpointId}-child`}))]})),play:async({canvasElement:e})=>{await s(await a(e).findByText("101:100")).toBeInTheDocument()}},k={render:()=>o(r.jsx(t,{kind:"stacks",rows:W})),play:async({canvasElement:e})=>{await s(await a(e).findByText("g22")).toBeInTheDocument()}},x={render:()=>o(r.jsx(t,{kind:"ticks",rows:[{tick:1,at:"2026-10-01T09:00:00Z",label:"first"},{tick:2,at:"2026-10-01T09:00:01Z",label:"second"}]})),play:async({canvasElement:e})=>{await s(await a(e).findByText("second")).toBeInTheDocument()}};var u,h,y;n.parameters={...n.parameters,docs:{...(u=n.parameters)==null?void 0:u.docs,source:{originalSource:`{
  render: () => frame(<TraceView kind="http" rows={httpExchangeRows} />)
}`,...(y=(h=n.parameters)==null?void 0:h.docs)==null?void 0:y.source}}};var f,g,S;i.parameters={...i.parameters,docs:{...(f=i.parameters)==null?void 0:f.docs,source:{originalSource:`{
  render: () => frame(<TraceView kind="http_proxy" rows={httpExchangeRows} />)
}`,...(S=(g=i.parameters)==null?void 0:g.docs)==null?void 0:S.source}}};var B,_,v;c.parameters={...c.parameters,docs:{...(B=c.parameters)==null?void 0:B.docs,source:{originalSource:`{
  render: () => frame(<TraceView kind="pg_proxy" rows={sqlStatementRows} />)
}`,...(v=(_=c.parameters)==null?void 0:_.docs)==null?void 0:v.source}}};var E,R,P;p.parameters={...p.parameters,docs:{...(E=p.parameters)==null?void 0:E.docs,source:{originalSource:`{
  render: () => frame(<TraceView kind="sql_statements" rows={sqlStatementRows} />)
}`,...(P=(R=p.parameters)==null?void 0:R.docs)==null?void 0:P.source}}};var I,j,D;m.parameters={...m.parameters,docs:{...(I=m.parameters)==null?void 0:I.docs,source:{originalSource:`{
  render: () => frame(<TraceView kind="terminal" rows={terminalEvents} />),
  play: async ({
    canvasElement
  }) => {
    await expect(within(canvasElement).getByText("exit 0")).toBeInTheDocument();
  }
}`,...(D=(j=m.parameters)==null?void 0:j.docs)==null?void 0:D.source}}};var V,b,q;d.parameters={...d.parameters,docs:{...(V=d.parameters)==null?void 0:V.docs,source:{originalSource:`{
  render: () => frame(<TraceView kind="process_tree" rows={processNodeRows} samples={processSampleRows} />)
}`,...(q=(b=d.parameters)==null?void 0:b.docs)==null?void 0:q.source}}};var G,H,O;l.parameters={...l.parameters,docs:{...(G=l.parameters)==null?void 0:G.docs,source:{originalSource:`{
  render: () => frame(<TraceView kind="goprof" rows={goProfileRecords} />),
  play: async ({
    canvasElement
  }) => {
    await expect(await within(canvasElement).findByText("Total 2.3 s across 7 functions")).toBeInTheDocument();
  }
}`,...(O=(H=l.parameters)==null?void 0:H.docs)==null?void 0:O.source}}};var Z,K,N;w.parameters={...w.parameters,docs:{...(Z=w.parameters)==null?void 0:Z.docs,source:{originalSource:`{
  render: () => frame(<TraceView kind="goprof" rows={[...goProfileRecords, ...goProfileRecords.map(record => ({
    ...record,
    key: "101:100",
    checkpointId: \`\${record.checkpointId}-child\`
  }))]} />),
  play: async ({
    canvasElement
  }) => {
    await expect(await within(canvasElement).findByText("101:100")).toBeInTheDocument();
  }
}`,...(N=(K=w.parameters)==null?void 0:K.docs)==null?void 0:N.source}}};var U,A,L;k.parameters={...k.parameters,docs:{...(U=k.parameters)==null?void 0:U.docs,source:{originalSource:`{
  render: () => frame(<TraceView kind="stacks" rows={stackRecords} />),
  play: async ({
    canvasElement
  }) => {
    await expect(await within(canvasElement).findByText("g22")).toBeInTheDocument();
  }
}`,...(L=(A=k.parameters)==null?void 0:A.docs)==null?void 0:L.source}}};var $,M,Q;x.parameters={...x.parameters,docs:{...($=x.parameters)==null?void 0:$.docs,source:{originalSource:`{
  render: () => frame(<TraceView kind="ticks" rows={[{
    tick: 1,
    at: "2026-10-01T09:00:00Z",
    label: "first"
  }, {
    tick: 2,
    at: "2026-10-01T09:00:01Z",
    label: "second"
  }]} />),
  play: async ({
    canvasElement
  }) => {
    await expect(await within(canvasElement).findByText("second")).toBeInTheDocument();
  }
}`,...(Q=(M=x.parameters)==null?void 0:M.docs)==null?void 0:Q.source}}};const yr=["Http","HttpProxy","PgProxy","SqlStatements","Terminal","ProcessTree","GoProfile","GoProfileSeveralProcesses","Stacks","UnknownKind"];export{l as GoProfile,w as GoProfileSeveralProcesses,n as Http,i as HttpProxy,c as PgProxy,d as ProcessTree,p as SqlStatements,k as Stacks,m as Terminal,x as UnknownKind,yr as __namedExportsOrder,hr as default};
