import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{t}from"./jsx-runtime-BG4KOiPz.js";import{l as n,r}from"./fixtures-DQ4-m9zu.js";import{n as i,t as a}from"./SqlTraceTable-DSNJkv84.js";var o,s,c,l,u,d,f,p;function m(){return(m=e((()=>{r(),i(),o=t(),{expect:s,within:c}=__STORYBOOK_MODULE_TEST__,l={title:`Data/Traces/SqlTraceTable`,component:a,parameters:{docs:{description:{component:"`pg_proxy` / `sql_statements` records as a DataTable: time, op, tables, highlighted SQL, duration, rows and error. Statements sharing a `repeatKey` collapse into one row with a count badge and their total duration; the switch shows each execution instead. Expanding a row shows the full statement and its arguments."}}}},u={render:()=>(0,o.jsx)(`div`,{className:`h-[420px] rounded-md border border-border`,children:(0,o.jsx)(a,{rows:n})}),play:async({canvasElement:e})=>{await s(await c(e).findByText(`×3`)).toBeInTheDocument()}},d={render:()=>(0,o.jsx)(`div`,{className:`h-[420px] rounded-md border border-border`,children:(0,o.jsx)(a,{rows:n,groupRepeated:!1})})},f={render:()=>(0,o.jsx)(a,{rows:[]})},p=[`GroupedRepeats`,`EveryExecution`,`Empty`],u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  render: () => <div className="h-[420px] rounded-md border border-border">
      <SqlTraceTable rows={sqlStatementRows} />
    </div>,
  play: async ({
    canvasElement
  }) => {
    await expect(await within(canvasElement).findByText("×3")).toBeInTheDocument();
  }
}`,...u.parameters?.docs?.source}}},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  render: () => <div className="h-[420px] rounded-md border border-border">
      <SqlTraceTable rows={sqlStatementRows} groupRepeated={false} />
    </div>
}`,...d.parameters?.docs?.source}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  render: () => <SqlTraceTable rows={[]} />
}`,...f.parameters?.docs?.source}}}})))()}m();export{f as Empty,d as EveryExecution,u as GroupedRepeats,p as __namedExportsOrder,l as default};