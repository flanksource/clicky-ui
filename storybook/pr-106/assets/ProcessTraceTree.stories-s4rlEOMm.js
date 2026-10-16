import{j as e,r as u}from"./iframe-BUpmsD4_.js";import{b as h,c as O}from"./fixtures-C3TGvGxW.js";import{P as s}from"./ProcessTraceTree-C1fjqvxk.js";import"./preload-helper-PGaPgbNH.js";import"./format-2niohfpq.js";import"./utils-DW-IJACk.js";import"./utils-XFzvKIOC.js";import"./Icon-DTAROQQs.js";import"./Tree-B-YvG_G5.js";import"./TreeNode-D7MwMn0M.js";import"./process-tree-BV4Gc7wn.js";const{expect:t,userEvent:K,within:n}=__STORYBOOK_MODULE_TEST__,ee={title:"Data/Traces/ProcessTraceTree",component:s,parameters:{docs:{description:{component:"The process tree of a `process_tree` trace: a forest by `key` / `parentKey`, where a process whose parent was never recorded is a root. Exited processes are dimmed and show their lifetime and peak CPU/RSS; `process_samples` add a CPU sparkline per process. With `onHideExitedChange` a toolbar counts the processes and hides exited ones that have no live descendant; `loading` and `error` cover a trace that has not arrived."}}}};function U({withSamples:r}){const[a,x]=u.useState("101:100");return e.jsx("div",{className:"max-w-3xl rounded-md border border-border",children:e.jsx(s,{nodes:h,selectedKey:a,onSelect:x,...r?{samples:O}:{}})})}const o={render:()=>e.jsx(U,{withSamples:!1}),play:async({canvasElement:r})=>{await t(n(r).getByText("orphan")).toBeInTheDocument()}},c={render:()=>e.jsx(U,{withSamples:!0}),play:async({canvasElement:r})=>{await t(n(r).getByRole("img",{name:"CPU % over 12 samples"})).toBeInTheDocument()}},d={render:()=>e.jsx(s,{nodes:[],onSelect:()=>{}})};function q({nodes:r}){const[a,x]=u.useState(!1),[F,y]=u.useState(null);return e.jsxs("div",{className:"max-w-3xl rounded-md border border-border",children:[e.jsxs("div",{className:"flex gap-2 border-b border-border p-density-2 text-xs",children:[e.jsx("button",{type:"button",onClick:()=>y(!0),children:"Expand all"}),e.jsx("button",{type:"button",onClick:()=>y(!1),children:"Collapse all"})]}),e.jsx(s,{nodes:r,samples:O,onSelect:()=>{},hideExited:a,onHideExitedChange:x,expandAll:F})]})}const i={render:()=>e.jsx(q,{nodes:h}),play:async({canvasElement:r})=>{const a=n(r);await t(a.getByText("4 processes")).toBeInTheDocument(),await K.click(a.getByLabelText("Hide exited")),await t(a.queryByText("compile")).not.toBeInTheDocument()}},l={render:()=>e.jsx("div",{className:"max-w-3xl rounded-md border border-border",children:e.jsx(s,{nodes:h.map(r=>({...r,status:"exited"})),hideExited:!0,onHideExitedChange:()=>{},onSelect:()=>{}})}),play:async({canvasElement:r})=>{await t(n(r).getByText("Every process has exited")).toBeInTheDocument()}},m={render:()=>e.jsx("div",{className:"max-w-3xl rounded-md border border-border",children:e.jsx(s,{nodes:[],loading:!0,onHideExitedChange:()=>{},onSelect:()=>{}})}),play:async({canvasElement:r})=>{await t(n(r).getByText("Waiting for process trace…")).toBeInTheDocument()}},p={render:()=>e.jsx("div",{className:"max-w-3xl rounded-md border border-border",children:e.jsx(s,{nodes:[],error:"trace store unreachable: connection refused",onSelect:()=>{}})})};var T,E,b;o.parameters={...o.parameters,docs:{...(T=o.parameters)==null?void 0:T.docs,source:{originalSource:`{
  render: () => <Selectable withSamples={false} />,
  play: async ({
    canvasElement
  }) => {
    await expect(within(canvasElement).getByText("orphan")).toBeInTheDocument();
  }
}`,...(b=(E=o.parameters)==null?void 0:E.docs)==null?void 0:b.source}}};var w,v,g;c.parameters={...c.parameters,docs:{...(w=c.parameters)==null?void 0:w.docs,source:{originalSource:`{
  render: () => <Selectable withSamples />,
  play: async ({
    canvasElement
  }) => {
    await expect(within(canvasElement).getByRole("img", {
      name: "CPU % over 12 samples"
    })).toBeInTheDocument();
  }
}`,...(g=(v=c.parameters)==null?void 0:v.docs)==null?void 0:g.source}}};var S,B,j;d.parameters={...d.parameters,docs:{...(S=d.parameters)==null?void 0:S.docs,source:{originalSource:`{
  render: () => <ProcessTraceTree nodes={[]} onSelect={() => {}} />
}`,...(j=(B=d.parameters)==null?void 0:B.docs)==null?void 0:j.source}}};var f,C,D;i.parameters={...i.parameters,docs:{...(f=i.parameters)==null?void 0:f.docs,source:{originalSource:`{
  render: () => <HideExitedToggle nodes={processNodeRows} />,
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("4 processes")).toBeInTheDocument();
    await userEvent.click(canvas.getByLabelText("Hide exited"));
    await expect(canvas.queryByText("compile")).not.toBeInTheDocument();
  }
}`,...(D=(C=i.parameters)==null?void 0:C.docs)==null?void 0:D.source}}};var H,P,I;l.parameters={...l.parameters,docs:{...(H=l.parameters)==null?void 0:H.docs,source:{originalSource:`{
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
}`,...(I=(P=l.parameters)==null?void 0:P.docs)==null?void 0:I.source}}};var N,_,k;m.parameters={...m.parameters,docs:{...(N=m.parameters)==null?void 0:N.docs,source:{originalSource:`{
  render: () => <div className="max-w-3xl rounded-md border border-border">
      <ProcessTraceTree nodes={[]} loading onHideExitedChange={() => {}} onSelect={() => {}} />
    </div>,
  play: async ({
    canvasElement
  }) => {
    await expect(within(canvasElement).getByText("Waiting for process trace…")).toBeInTheDocument();
  }
}`,...(k=(_=m.parameters)==null?void 0:_.docs)==null?void 0:k.source}}};var R,W,L;p.parameters={...p.parameters,docs:{...(R=p.parameters)==null?void 0:R.docs,source:{originalSource:`{
  render: () => <div className="max-w-3xl rounded-md border border-border">
      <ProcessTraceTree nodes={[]} error="trace store unreachable: connection refused" onSelect={() => {}} />
    </div>
}`,...(L=(W=p.parameters)==null?void 0:W.docs)==null?void 0:L.source}}};const re=["Forest","WithCpuSparklines","Empty","HideExited","EveryProcessExited","WaitingForTrace","LoadError"];export{d as Empty,l as EveryProcessExited,o as Forest,i as HideExited,p as LoadError,m as WaitingForTrace,c as WithCpuSparklines,re as __namedExportsOrder,ee as default};
