import{r as h,j as o}from"./iframe-Cbvd77G_.js";import{s as P,D as s}from"./fixtures-xXoLMOuC.js";import"./preload-helper-BqxgWdQg.js";import"./Tree-nzpc5Qz0.js";import"./utils-BLSKlp9E.js";import"./Icon-BFW8T_Wy.js";import"./TreeNode-GrG4BYa3.js";import"./UiChevronDown-biMgqLPN.js";import"./UiChevronRight-D5OxU2R1.js";import"./UiSearch-L-mYgxRs.js";import"./UiClose-hgToXACD.js";import"./UiExpandAll-CmUZvg__.js";import"./UiServerProcess-PZrNK3jh.js";import"./UiWatch-D4pEjziG.js";import"./UiPause-DMkueb6f.js";import"./UiError-C9kXs9WN.js";import"./UiDebugStepOver-QJX4wbI9.js";import"./UiLoader-_hr_Ly43.js";import"./UiDebug-Bxff_7y6.js";import"./format-DUfROWi7.js";const C={title:"Data/Diagnostics/Tree",component:s,args:{root:P,selectedPid:1,onSelect:()=>{}},argTypes:{onSelect:{table:{disable:!0}}},parameters:{docs:{description:{component:"Process-tree browser for diagnostics captures. It highlights the selected process, shows pid/status/cpu/memory, and delegates hierarchy/search behavior to Tree."}}}},e={render:a=>{const[S,x]=h.useState(a.selectedPid??null);return o.jsx("div",{className:"w-[640px]",children:o.jsx(s,{...a,selectedPid:S,onSelect:x})})}},r={render:()=>o.jsx(s,{onSelect:()=>{}})},t={render:()=>o.jsx(s,{root:{pid:1,name:"lonely-proc",is_root:!0,cpu_percent:.1},onSelect:()=>{}})};var i,n,c;e.parameters={...e.parameters,docs:{...(i=e.parameters)==null?void 0:i.docs,source:{originalSource:`{
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
