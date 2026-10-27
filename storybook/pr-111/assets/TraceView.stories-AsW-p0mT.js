import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{t}from"./jsx-runtime-BG4KOiPz.js";import{c as n,d as r,l as i,n as a,r as o,s,t as c,u as l}from"./fixtures-DQ4-m9zu.js";import{n as u,t as d}from"./TraceView-r6n0BR4R.js";var f,p,m,h,g,_,v,y,b,x,S,C,w,T,E,D;function O(){return(O=e((()=>{o(),u(),f=t(),{expect:p,within:m}=__STORYBOOK_MODULE_TEST__,h={title:`Data/Traces/TraceView`,component:d,parameters:{docs:{description:{component:"Dispatches a trace kind's records to its viewer: `http` / `http_proxy` to a HAR panel, `pg_proxy` / `sql_statements` to a SQL table, `terminal` to a cast player, `process_tree` to a process tree, `goprof` to a Go profile view per process, `stacks` to a stack dump per checkpoint per process, and any other kind to a table over the row keys. A row missing the field its viewer needs throws, naming the kind and the row."}}}},g=e=>(0,f.jsx)(`div`,{className:`h-[480px] rounded-md border border-border`,children:e}),_={render:()=>g((0,f.jsx)(d,{kind:`http`,rows:a}))},v={render:()=>g((0,f.jsx)(d,{kind:`http_proxy`,rows:a}))},y={render:()=>g((0,f.jsx)(d,{kind:`pg_proxy`,rows:i}))},b={render:()=>g((0,f.jsx)(d,{kind:`sql_statements`,rows:i}))},x={render:()=>g((0,f.jsx)(d,{kind:`terminal`,rows:r})),play:async({canvasElement:e})=>{await p(m(e).getByText(`exit 0`)).toBeInTheDocument()}},S={render:()=>g((0,f.jsx)(d,{kind:`process_tree`,rows:s,samples:n}))},C={render:()=>g((0,f.jsx)(d,{kind:`goprof`,rows:c})),play:async({canvasElement:e})=>{await p(await m(e).findByText(`Total 2.3 s across 7 functions`)).toBeInTheDocument()}},w={render:()=>g((0,f.jsx)(d,{kind:`goprof`,rows:[...c,...c.map(e=>({...e,key:`101:100`,checkpointId:`${e.checkpointId}-child`}))]})),play:async({canvasElement:e})=>{await p(await m(e).findByText(`101:100`)).toBeInTheDocument()}},T={render:()=>g((0,f.jsx)(d,{kind:`stacks`,rows:l})),play:async({canvasElement:e})=>{await p(await m(e).findByText(`g22`)).toBeInTheDocument()}},E={render:()=>g((0,f.jsx)(d,{kind:`ticks`,rows:[{tick:1,at:`2026-10-01T09:00:00Z`,label:`first`},{tick:2,at:`2026-10-01T09:00:01Z`,label:`second`}]})),play:async({canvasElement:e})=>{await p(await m(e).findByText(`second`)).toBeInTheDocument()}},D=[`Http`,`HttpProxy`,`PgProxy`,`SqlStatements`,`Terminal`,`ProcessTree`,`GoProfile`,`GoProfileSeveralProcesses`,`Stacks`,`UnknownKind`],_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  render: () => frame(<TraceView kind="http" rows={httpExchangeRows} />)
}`,..._.parameters?.docs?.source}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  render: () => frame(<TraceView kind="http_proxy" rows={httpExchangeRows} />)
}`,...v.parameters?.docs?.source}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  render: () => frame(<TraceView kind="pg_proxy" rows={sqlStatementRows} />)
}`,...y.parameters?.docs?.source}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  render: () => frame(<TraceView kind="sql_statements" rows={sqlStatementRows} />)
}`,...b.parameters?.docs?.source}}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  render: () => frame(<TraceView kind="terminal" rows={terminalEvents} />),
  play: async ({
    canvasElement
  }) => {
    await expect(within(canvasElement).getByText("exit 0")).toBeInTheDocument();
  }
}`,...x.parameters?.docs?.source}}},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  render: () => frame(<TraceView kind="process_tree" rows={processNodeRows} samples={processSampleRows} />)
}`,...S.parameters?.docs?.source}}},C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
  render: () => frame(<TraceView kind="goprof" rows={goProfileRecords} />),
  play: async ({
    canvasElement
  }) => {
    await expect(await within(canvasElement).findByText("Total 2.3 s across 7 functions")).toBeInTheDocument();
  }
}`,...C.parameters?.docs?.source}}},w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
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
}`,...w.parameters?.docs?.source}}},T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
  render: () => frame(<TraceView kind="stacks" rows={stackRecords} />),
  play: async ({
    canvasElement
  }) => {
    await expect(await within(canvasElement).findByText("g22")).toBeInTheDocument();
  }
}`,...T.parameters?.docs?.source}}},E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{
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
}`,...E.parameters?.docs?.source}}}})))()}O();export{C as GoProfile,w as GoProfileSeveralProcesses,_ as Http,v as HttpProxy,y as PgProxy,S as ProcessTree,b as SqlStatements,T as Stacks,x as Terminal,E as UnknownKind,D as __namedExportsOrder,h as default};