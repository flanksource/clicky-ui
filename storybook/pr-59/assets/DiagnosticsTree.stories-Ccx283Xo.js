import{r as h,j as t}from"./iframe-Dd752MYf.js";import{D as o}from"./DiagnosticsTree-EsWrnjFa.js";import{s as P}from"./fixtures-Dw1r0SUX.js";import"./preload-helper-B2LPdJL4.js";import"./Tree-CZTGgUia.js";import"./utils-CR52uffu.js";import"./Icon-9CMiNgil.js";import"./TreeNode-BVxZefmo.js";import"./format-2niohfpq.js";const N={title:"Data/Diagnostics/Tree",component:o,args:{root:P,selectedPid:1,onSelect:()=>{}},argTypes:{onSelect:{table:{disable:!0}}},parameters:{docs:{description:{component:"Process-tree browser for diagnostics captures. It highlights the selected process, shows pid/status/cpu/memory, and delegates hierarchy/search behavior to Tree."}}}},e={render:a=>{const[S,x]=h.useState(a.selectedPid??null);return t.jsx("div",{className:"w-[640px]",children:t.jsx(o,{...a,selectedPid:S,onSelect:x})})}},r={render:()=>t.jsx(o,{onSelect:()=>{}})},s={render:()=>t.jsx(o,{root:{pid:1,name:"lonely-proc",is_root:!0,cpu_percent:.1},onSelect:()=>{}})};var n,c,i;e.parameters={...e.parameters,docs:{...(n=e.parameters)==null?void 0:n.docs,source:{originalSource:`{
  render: args => {
    const [pid, setPid] = useState<number | null>(args.selectedPid ?? null);
    return <div className="w-[640px]">
        <DiagnosticsTree {...args} selectedPid={pid} onSelect={setPid} />
      </div>;
  }
}`,...(i=(c=e.parameters)==null?void 0:c.docs)==null?void 0:i.source}}};var d,p,l;r.parameters={...r.parameters,docs:{...(d=r.parameters)==null?void 0:d.docs,source:{originalSource:`{
  render: () => <DiagnosticsTree onSelect={() => {}} />
}`,...(l=(p=r.parameters)==null?void 0:p.docs)==null?void 0:l.source}}};var m,u,g;s.parameters={...s.parameters,docs:{...(m=s.parameters)==null?void 0:m.docs,source:{originalSource:`{
  render: () => <DiagnosticsTree root={{
    pid: 1,
    name: "lonely-proc",
    is_root: true,
    cpu_percent: 0.1
  }} onSelect={() => {}} />
}`,...(g=(u=s.parameters)==null?void 0:u.docs)==null?void 0:g.source}}};const E=["Default","Loading","SingleNode"];export{e as Default,r as Loading,s as SingleNode,E as __namedExportsOrder,N as default};
