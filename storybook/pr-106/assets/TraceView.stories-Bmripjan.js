import{j as r}from"./iframe-BUpmsD4_.js";import{g as T,h as Y,d as z,t as C,c as F,b as J,s as W}from"./fixtures-C3TGvGxW.js";import{T as t}from"./TraceView-a9xEmJhK.js";import"./preload-helper-PGaPgbNH.js";import"./utils-DW-IJACk.js";import"./DataTable-D0ZAr8Wn.js";import"./SortableHeader-DzqJplk3.js";import"./loading-BVCwDMQn.js";import"./router-ivxbOHGV.js";import"./Modal-D_AIawBk.js";import"./index-D9pyqf52.js";import"./index-CsPwRm8U.js";import"./Icon-DTAROQQs.js";import"./button-C45Fp5VT.js";import"./index-CPURVhFy.js";import"./modalStack-Gk9S97tn.js";import"./zIndex-BGbNBNA8.js";import"./FilterBar-D1B1BCNq.js";import"./floating-ui.react-Ct-n3Sdx.js";import"./FilterPill-ZhMJAiFw.js";import"./filter-bar-multi-EJU47-mi.js";import"./Combobox-CaQ5ogPs.js";import"./json-schema-form-size-E77C3uZS.js";import"./timestamp-format-DJzkpO9P.js";import"./DateTimePicker-B_Xf9fMG.js";import"./MultiSelect-DOVvlLhk.js";import"./RangeSlider-u6TDUAHA.js";import"./TimeRange-DLbdylta.js";import"./select-CBErET8H.js";import"./WorkloadPicker-BqShn2mb.js";import"./NamespacePicker-BYq-r1wS.js";import"./index-DuJeJ7XF.js";import"./data-table-filter-values-BoCQDwQ9.js";import"./duration-BuesBvhN.js";import"./Timestamp-Ca1ZM5fk.js";import"./TagList-DnAzIPxU.js";import"./Badge-CU99F48u.js";import"./badge-variants-BNgEarpT.js";import"./HoverCard-CJMlbbGv.js";import"./Properties-CzvVSyin.js";import"./IconButton-CdsDTQWb.js";import"./DropdownMenu-LyJi-wEU.js";import"./DropdownMenuSubmenu-06pkj9qc.js";import"./format-2niohfpq.js";import"./JsonView-B4Nw9Fl0.js";import"./AccordionList-BTEWzV6y.js";import"./collections-CoHfwOze.js";import"./StatusDot-CD9gWk6p.js";import"./StackDumpView-Bt2PqYit.js";import"./frame-heuristics-D62qKi0n.js";import"./JvmStackTrace-B8te7UN1.js";import"./StackFrameRow-C5aLaa6B.js";import"./FrameSourceWindow-CS1fR05x.js";import"./code-highlight-B84SNtUw.js";import"./HighlightedTokens-wwLksTd_.js";import"./GoProfileView-CPczAcsU.js";import"./process-tree-BV4Gc7wn.js";import"./stack-checkpoints-UeFU0tRC.js";import"./ProcessTraceTree-C1fjqvxk.js";import"./utils-XFzvKIOC.js";import"./Tree-B-YvG_G5.js";import"./TreeNode-D7MwMn0M.js";import"./SqlTraceTable-h45QXyBE.js";import"./Switch-Dk2KOpAa.js";import"./CodeBlock-8BACWTJZ.js";import"./CodeDiff-B_c0QWKI.js";import"./SegmentedControl-BzAaXjE5.js";import"./code-diff-BUXB4Bx8.js";import"./TerminalCastPlayer-DQJqXYBm.js";import"./AnsiHtml-D5usPwhf.js";import"./TraceHarView-CJ2bv90s.js";import"./HarPanel-C1nj5SSQ.js";import"./use-resource-clock-DoJ7LmV9.js";const{expect:s,within:a}=__STORYBOOK_MODULE_TEST__,hr={title:"Data/Traces/TraceView",component:t,parameters:{docs:{description:{component:"Dispatches a trace kind's records to its viewer: `http` / `http_proxy` to a HAR panel, `pg_proxy` / `sql_statements` to a SQL table, `terminal` to a cast player, `process_tree` to a process tree, `goprof` to a Go profile view per process, `stacks` to a stack dump per checkpoint per process, and any other kind to a table over the row keys. A row missing the field its viewer needs throws, naming the kind and the row."}}}},o=e=>r.jsx("div",{className:"h-[480px] rounded-md border border-border",children:e}),n={render:()=>o(r.jsx(t,{kind:"http",rows:Y}))},i={render:()=>o(r.jsx(t,{kind:"http_proxy",rows:Y}))},c={render:()=>o(r.jsx(t,{kind:"pg_proxy",rows:z}))},p={render:()=>o(r.jsx(t,{kind:"sql_statements",rows:z}))},m={render:()=>o(r.jsx(t,{kind:"terminal",rows:C})),play:async({canvasElement:e})=>{await s(a(e).getByText("exit 0")).toBeInTheDocument()}},d={render:()=>o(r.jsx(t,{kind:"process_tree",rows:J,samples:F}))},l={render:()=>o(r.jsx(t,{kind:"goprof",rows:T})),play:async({canvasElement:e})=>{await s(await a(e).findByText("Total 2.3 s across 7 functions")).toBeInTheDocument()}},w={render:()=>o(r.jsx(t,{kind:"goprof",rows:[...T,...T.map(e=>({...e,key:"101:100",checkpointId:`${e.checkpointId}-child`}))]})),play:async({canvasElement:e})=>{await s(await a(e).findByText("101:100")).toBeInTheDocument()}},k={render:()=>o(r.jsx(t,{kind:"stacks",rows:W})),play:async({canvasElement:e})=>{await s(await a(e).findByText("g22")).toBeInTheDocument()}},x={render:()=>o(r.jsx(t,{kind:"ticks",rows:[{tick:1,at:"2026-10-01T09:00:00Z",label:"first"},{tick:2,at:"2026-10-01T09:00:01Z",label:"second"}]})),play:async({canvasElement:e})=>{await s(await a(e).findByText("second")).toBeInTheDocument()}};var u,h,y;n.parameters={...n.parameters,docs:{...(u=n.parameters)==null?void 0:u.docs,source:{originalSource:`{
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
