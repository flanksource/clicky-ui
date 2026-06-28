import{r as h,j as o}from"./iframe-BxLPOr6M.js";import{s as P,D as s}from"./fixtures-xSo23CkX.js";import"./preload-helper-C4wV90-x.js";import"./Tree-B8NLzSEo.js";import"./utils-CR52uffu.js";import"./Icon-DGql8Ler.js";import"./TreeNode-Cc5f5pT6.js";import"./UiChevronDown-BxzZdAmx.js";import"./UiChevronRight-DKNjap7a.js";import"./UiSearch-CjFq2-8_.js";import"./UiClose-BkgTCVec.js";import"./UiExpandAll-Qls7xI8d.js";import"./UiServerProcess-Dc9W5Cbj.js";import"./UiWatch-DyAJyBtK.js";import"./UiPause-DOgO8Yiq.js";import"./UiError-DdzXw9FK.js";import"./UiDebugStepOver-BXkCMRG4.js";import"./UiLoader-Ctaevank.js";import"./UiDebug-DabtHlXk.js";import"./format-2niohfpq.js";const C={title:"Data/Diagnostics/Tree",component:s,args:{root:P,selectedPid:1,onSelect:()=>{}},argTypes:{onSelect:{table:{disable:!0}}},parameters:{docs:{description:{component:"Process-tree browser for diagnostics captures. It highlights the selected process, shows pid/status/cpu/memory, and delegates hierarchy/search behavior to Tree."}}}},e={render:a=>{const[S,x]=h.useState(a.selectedPid??null);return o.jsx("div",{className:"w-[640px]",children:o.jsx(s,{...a,selectedPid:S,onSelect:x})})}},r={render:()=>o.jsx(s,{onSelect:()=>{}})},t={render:()=>o.jsx(s,{root:{pid:1,name:"lonely-proc",is_root:!0,cpu_percent:.1},onSelect:()=>{}})};var i,n,c;e.parameters={...e.parameters,docs:{...(i=e.parameters)==null?void 0:i.docs,source:{originalSource:`{
  render: args => {
    const [pid, setPid] = useState<number | null>(args.selectedPid ?? null);
    return <div className="w-[640px]">
        <DiagnosticsTree {...args} selectedPid={pid} onSelect={setPid} />
      </div>;
  }
}`,...(c=(n=e.parameters)==null?void 0:n.docs)==null?void 0:c.source}}};var p,d,m;r.parameters={...r.parameters,docs:{...(p=r.parameters)==null?void 0:p.docs,source:{originalSource:`{
  render: () => <DiagnosticsTree onSelect={() => {}} />
}`,...(m=(d=r.parameters)==null?void 0:d.docs)==null?void 0:m.source}}};var l,u,g;t.parameters={...t.parameters,docs:{...(l=t.parameters)==null?void 0:l.docs,source:{originalSource:`{
  render: () => <DiagnosticsTree root={{
    pid: 1,
    name: "lonely-proc",
    is_root: true,
    cpu_percent: 0.1
  }} onSelect={() => {}} />
}`,...(g=(u=t.parameters)==null?void 0:u.docs)==null?void 0:g.source}}};const F=["Default","Loading","SingleNode"];export{e as Default,r as Loading,t as SingleNode,F as __namedExportsOrder,C as default};
