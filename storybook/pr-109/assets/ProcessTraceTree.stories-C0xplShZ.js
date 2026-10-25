import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{t}from"./react-pByjoP3I.js";import{t as n}from"./jsx-runtime-BG4KOiPz.js";import{c as r,r as i,s as a}from"./fixtures-DQ4-m9zu.js";import{n as o,t as s}from"./ProcessTraceTree-C7a6hXSo.js";function c({withSamples:e}){let[t,n]=(0,u.useState)(`101:100`);return(0,d.jsx)(`div`,{className:`max-w-3xl rounded-md border border-border`,children:(0,d.jsx)(s,{nodes:a,selectedKey:t,onSelect:n,...e?{samples:r}:{}})})}function l({nodes:e}){let[t,n]=(0,u.useState)(!1),[i,a]=(0,u.useState)(null);return(0,d.jsxs)(`div`,{className:`max-w-3xl rounded-md border border-border`,children:[(0,d.jsxs)(`div`,{className:`flex gap-2 border-b border-border p-density-2 text-xs`,children:[(0,d.jsx)(`button`,{type:`button`,onClick:()=>a(!0),children:`Expand all`}),(0,d.jsx)(`button`,{type:`button`,onClick:()=>a(!1),children:`Collapse all`})]}),(0,d.jsx)(s,{nodes:e,samples:r,onSelect:()=>{},hideExited:t,onHideExitedChange:n,expandAll:i})]})}var u,d,f,p,m,h,g,_,v,y,b,x,S,C;function w(){return(w=e((()=>{u=t(),i(),o(),d=n(),{expect:f,userEvent:p,within:m}=__STORYBOOK_MODULE_TEST__,h={title:`Data/Traces/ProcessTraceTree`,component:s,parameters:{docs:{description:{component:"The process tree of a `process_tree` trace: a forest by `key` / `parentKey`, where a process whose parent was never recorded is a root. Exited processes are dimmed and show their lifetime and peak CPU/RSS; `process_samples` add a CPU sparkline per process. With `onHideExitedChange` a toolbar counts the processes and hides exited ones that have no live descendant; `loading` and `error` cover a trace that has not arrived."}}}},g={render:()=>(0,d.jsx)(c,{withSamples:!1}),play:async({canvasElement:e})=>{await f(m(e).getByText(`orphan`)).toBeInTheDocument()}},_={render:()=>(0,d.jsx)(c,{withSamples:!0}),play:async({canvasElement:e})=>{await f(m(e).getByRole(`img`,{name:`CPU % over 12 samples`})).toBeInTheDocument()}},v={render:()=>(0,d.jsx)(s,{nodes:[],onSelect:()=>{}})},y={render:()=>(0,d.jsx)(l,{nodes:a}),play:async({canvasElement:e})=>{let t=m(e);await f(t.getByText(`4 processes`)).toBeInTheDocument(),await p.click(t.getByLabelText(`Hide exited`)),await f(t.queryByText(`compile`)).not.toBeInTheDocument()}},b={render:()=>(0,d.jsx)(`div`,{className:`max-w-3xl rounded-md border border-border`,children:(0,d.jsx)(s,{nodes:a.map(e=>({...e,status:`exited`})),hideExited:!0,onHideExitedChange:()=>{},onSelect:()=>{}})}),play:async({canvasElement:e})=>{await f(m(e).getByText(`Every process has exited`)).toBeInTheDocument()}},x={render:()=>(0,d.jsx)(`div`,{className:`max-w-3xl rounded-md border border-border`,children:(0,d.jsx)(s,{nodes:[],loading:!0,onHideExitedChange:()=>{},onSelect:()=>{}})}),play:async({canvasElement:e})=>{await f(m(e).getByText(`Waiting for process trace…`)).toBeInTheDocument()}},S={render:()=>(0,d.jsx)(`div`,{className:`max-w-3xl rounded-md border border-border`,children:(0,d.jsx)(s,{nodes:[],error:`trace store unreachable: connection refused`,onSelect:()=>{}})})},C=[`Forest`,`WithCpuSparklines`,`Empty`,`HideExited`,`EveryProcessExited`,`WaitingForTrace`,`LoadError`],g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  render: () => <Selectable withSamples={false} />,
  play: async ({
    canvasElement
  }) => {
    await expect(within(canvasElement).getByText("orphan")).toBeInTheDocument();
  }
}`,...g.parameters?.docs?.source}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  render: () => <Selectable withSamples />,
  play: async ({
    canvasElement
  }) => {
    await expect(within(canvasElement).getByRole("img", {
      name: "CPU % over 12 samples"
    })).toBeInTheDocument();
  }
}`,..._.parameters?.docs?.source}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  render: () => <ProcessTraceTree nodes={[]} onSelect={() => {}} />
}`,...v.parameters?.docs?.source}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  render: () => <HideExitedToggle nodes={processNodeRows} />,
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("4 processes")).toBeInTheDocument();
    await userEvent.click(canvas.getByLabelText("Hide exited"));
    await expect(canvas.queryByText("compile")).not.toBeInTheDocument();
  }
}`,...y.parameters?.docs?.source}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  render: () => <div className="max-w-3xl rounded-md border border-border">
      <ProcessTraceTree nodes={processNodeRows.map(row => ({
      ...row,
      status: "exited"
    }))} hideExited onHideExitedChange={() => {}} onSelect={() => {}} />
    </div>,
  play: async ({
    canvasElement
  }) => {
    await expect(within(canvasElement).getByText("Every process has exited")).toBeInTheDocument();
  }
}`,...b.parameters?.docs?.source}}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  render: () => <div className="max-w-3xl rounded-md border border-border">
      <ProcessTraceTree nodes={[]} loading onHideExitedChange={() => {}} onSelect={() => {}} />
    </div>,
  play: async ({
    canvasElement
  }) => {
    await expect(within(canvasElement).getByText("Waiting for process trace…")).toBeInTheDocument();
  }
}`,...x.parameters?.docs?.source}}},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  render: () => <div className="max-w-3xl rounded-md border border-border">
      <ProcessTraceTree nodes={[]} error="trace store unreachable: connection refused" onSelect={() => {}} />
    </div>
}`,...S.parameters?.docs?.source}}}})))()}w();export{v as Empty,b as EveryProcessExited,g as Forest,y as HideExited,S as LoadError,x as WaitingForTrace,_ as WithCpuSparklines,C as __namedExportsOrder,h as default};