import{j as r,r as E}from"./iframe-BpsZ2AnK.js";import{p as f,a as _}from"./fixtures-C3FWcLZf.js";import{P as o}from"./ProcessTraceTree-K0DXNT80.js";import"./preload-helper-MsDOuF3K.js";import"./format-2niohfpq.js";import"./utils-DW-IJACk.js";import"./utils-DIpGG7rR.js";import"./Icon-nPi6h081.js";import"./Tree-CpaciHai.js";import"./TreeNode-CGkFCcsE.js";const{expect:h,within:y}=__STORYBOOK_MODULE_TEST__,O={title:"Data/Traces/ProcessTraceTree",component:o,parameters:{docs:{description:{component:"The process tree of a `process_tree` trace: a forest by `key` / `parentKey`, where a process whose parent was never recorded is a root. Exited processes are dimmed and show their lifetime and peak CPU/RSS; `process_samples` add a CPU sparkline per process."}}}};function w({withSamples:e}){const[x,T]=E.useState("101:100");return r.jsx("div",{className:"max-w-3xl rounded-md border border-border",children:r.jsx(o,{nodes:_,selectedKey:x,onSelect:T,...e?{samples:f}:{}})})}const s={render:()=>r.jsx(w,{withSamples:!1}),play:async({canvasElement:e})=>{await h(y(e).getByText("orphan")).toBeInTheDocument()}},a={render:()=>r.jsx(w,{withSamples:!0}),play:async({canvasElement:e})=>{await h(y(e).getByRole("img",{name:"CPU % over 12 samples"})).toBeInTheDocument()}},t={render:()=>r.jsx(o,{nodes:[],onSelect:()=>{}})};var n,c,p;s.parameters={...s.parameters,docs:{...(n=s.parameters)==null?void 0:n.docs,source:{originalSource:`{
  render: () => <Selectable withSamples={false} />,
  play: async ({
    canvasElement
  }) => {
    await expect(within(canvasElement).getByText("orphan")).toBeInTheDocument();
  }
}`,...(p=(c=s.parameters)==null?void 0:c.docs)==null?void 0:p.source}}};var m,i,l;a.parameters={...a.parameters,docs:{...(m=a.parameters)==null?void 0:m.docs,source:{originalSource:`{
  render: () => <Selectable withSamples />,
  play: async ({
    canvasElement
  }) => {
    await expect(within(canvasElement).getByRole("img", {
      name: "CPU % over 12 samples"
    })).toBeInTheDocument();
  }
}`,...(l=(i=a.parameters)==null?void 0:i.docs)==null?void 0:l.source}}};var d,u,S;t.parameters={...t.parameters,docs:{...(d=t.parameters)==null?void 0:d.docs,source:{originalSource:`{
  render: () => <ProcessTraceTree nodes={[]} onSelect={() => {}} />
}`,...(S=(u=t.parameters)==null?void 0:u.docs)==null?void 0:S.source}}};const U=["Forest","WithCpuSparklines","Empty"];export{t as Empty,s as Forest,a as WithCpuSparklines,U as __namedExportsOrder,O as default};
