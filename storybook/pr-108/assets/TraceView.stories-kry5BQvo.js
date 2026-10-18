import{j as r}from"./iframe-CKgGkAV6.js";import{g as T,h as Y,d as z,t as C,c as F,b as J,s as W}from"./fixtures-C3TGvGxW.js";import{T as t}from"./TraceView-DR7pURwI.js";import"./preload-helper-D6IOlyYr.js";import"./utils-DW-IJACk.js";import"./DataTable-vloyht7y.js";import"./SortableHeader-Ry5ldV7u.js";import"./loading-CVVM6inm.js";import"./router-BaKFvvG8.js";import"./Modal-CyMxnyK7.js";import"./index-B8WCVke5.js";import"./index-B-AXG8c2.js";import"./Icon-zT9BHEU_.js";import"./button-mYaiNNVw.js";import"./index-CPURVhFy.js";import"./modalStack-TnERC9Dk.js";import"./zIndex-BGbNBNA8.js";import"./FilterBar-DpLc6Jkd.js";import"./floating-ui.react-DvrmiGRg.js";import"./FilterPill-CvKT4WAZ.js";import"./filter-bar-multi-Dt__OFRf.js";import"./Combobox-Ce8evdZR.js";import"./json-schema-form-size-E77C3uZS.js";import"./timestamp-format-DJzkpO9P.js";import"./DateTimePicker-BbQkUMe4.js";import"./MultiSelect-C-Y1qLAG.js";import"./RangeSlider-BaY40EZu.js";import"./TimeRange-j9ZOOMTL.js";import"./select-eS4vf-VP.js";import"./WorkloadPicker-BWVZwiTh.js";import"./NamespacePicker-BlJZooVo.js";import"./index-UgZ8RgH0.js";import"./data-table-filter-values-BoCQDwQ9.js";import"./duration-BuesBvhN.js";import"./Timestamp-C0FbbUfZ.js";import"./TagList-DXVHXee-.js";import"./Badge-DNVG-Ar4.js";import"./badge-variants-BNgEarpT.js";import"./HoverCard-D6AhenUg.js";import"./Properties-aB4NtyEt.js";import"./IconButton-_EDmsPTs.js";import"./DropdownMenu-BmZ28lfR.js";import"./DropdownMenuSubmenu-j0TnzvxK.js";import"./format-2niohfpq.js";import"./JsonView-CkPnotjI.js";import"./AccordionList-5bOCqJVe.js";import"./collections-CoHfwOze.js";import"./StatusDot-Cc34Nx7R.js";import"./StackDumpView-DwFfc0-r.js";import"./frame-heuristics-D62qKi0n.js";import"./JvmStackTrace-DZyI9rwy.js";import"./StackFrameRow-C6JgP64f.js";import"./FrameSourceWindow-DOFZJrxo.js";import"./code-highlight-BWRQ-hT_.js";import"./HighlightedTokens-Dei84GlG.js";import"./GoProfileView-BMDC4hZU.js";import"./process-tree-BV4Gc7wn.js";import"./stack-checkpoints-UeFU0tRC.js";import"./ProcessTraceTree-C0MyNYeM.js";import"./utils-COxqAcUN.js";import"./Tree-BUJ8DGY7.js";import"./TreeNode-Dj6_Ccy_.js";import"./SqlTraceTable-Dy5P5JJR.js";import"./Switch-B5rsbBcI.js";import"./CodeBlock-BLqJHOcq.js";import"./CodeDiff-CUQ4nb-v.js";import"./SegmentedControl-DpwJjHzq.js";import"./code-diff-BUXB4Bx8.js";import"./TerminalCastPlayer-BaYbHuZ7.js";import"./AnsiHtml-CNvM2bbP.js";import"./TraceHarView-DKbJusVC.js";import"./HarPanel-DdmHAokQ.js";import"./use-resource-clock-Cbjrkj8S.js";const{expect:s,within:a}=__STORYBOOK_MODULE_TEST__,hr={title:"Data/Traces/TraceView",component:t,parameters:{docs:{description:{component:"Dispatches a trace kind's records to its viewer: `http` / `http_proxy` to a HAR panel, `pg_proxy` / `sql_statements` to a SQL table, `terminal` to a cast player, `process_tree` to a process tree, `goprof` to a Go profile view per process, `stacks` to a stack dump per checkpoint per process, and any other kind to a table over the row keys. A row missing the field its viewer needs throws, naming the kind and the row."}}}},o=e=>r.jsx("div",{className:"h-[480px] rounded-md border border-border",children:e}),n={render:()=>o(r.jsx(t,{kind:"http",rows:Y}))},i={render:()=>o(r.jsx(t,{kind:"http_proxy",rows:Y}))},c={render:()=>o(r.jsx(t,{kind:"pg_proxy",rows:z}))},p={render:()=>o(r.jsx(t,{kind:"sql_statements",rows:z}))},m={render:()=>o(r.jsx(t,{kind:"terminal",rows:C})),play:async({canvasElement:e})=>{await s(a(e).getByText("exit 0")).toBeInTheDocument()}},d={render:()=>o(r.jsx(t,{kind:"process_tree",rows:J,samples:F}))},l={render:()=>o(r.jsx(t,{kind:"goprof",rows:T})),play:async({canvasElement:e})=>{await s(await a(e).findByText("Total 2.3 s across 7 functions")).toBeInTheDocument()}},w={render:()=>o(r.jsx(t,{kind:"goprof",rows:[...T,...T.map(e=>({...e,key:"101:100",checkpointId:`${e.checkpointId}-child`}))]})),play:async({canvasElement:e})=>{await s(await a(e).findByText("101:100")).toBeInTheDocument()}},k={render:()=>o(r.jsx(t,{kind:"stacks",rows:W})),play:async({canvasElement:e})=>{await s(await a(e).findByText("g22")).toBeInTheDocument()}},x={render:()=>o(r.jsx(t,{kind:"ticks",rows:[{tick:1,at:"2026-10-01T09:00:00Z",label:"first"},{tick:2,at:"2026-10-01T09:00:01Z",label:"second"}]})),play:async({canvasElement:e})=>{await s(await a(e).findByText("second")).toBeInTheDocument()}};var u,h,y;n.parameters={...n.parameters,docs:{...(u=n.parameters)==null?void 0:u.docs,source:{originalSource:`{
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
