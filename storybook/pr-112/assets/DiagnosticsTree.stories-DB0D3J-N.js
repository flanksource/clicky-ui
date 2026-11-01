import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{t}from"./react-pByjoP3I.js";import{t as n}from"./jsx-runtime-BG4KOiPz.js";import{n as r,t as i}from"./DiagnosticsTree-D2aGK5jE.js";import{n as a,t as o}from"./fixtures-h1Qmgw_D.js";var s,c,l,u,d,f,p;function m(){return(m=e((()=>{s=t(),r(),o(),c=n(),l={title:`Data/Diagnostics/Tree`,component:i,args:{root:a,selectedPid:1,onSelect:()=>void 0},argTypes:{onSelect:{table:{disable:!0}}},parameters:{docs:{description:{component:`Process-tree browser for diagnostics captures. It highlights the selected process, shows pid/status/cpu/memory, and delegates hierarchy/search behavior to Tree.`}}}},u={render:e=>{let[t,n]=(0,s.useState)(e.selectedPid??null);return(0,c.jsx)(`div`,{className:`w-[640px]`,children:(0,c.jsx)(i,{...e,selectedPid:t,onSelect:n})})}},d={render:()=>(0,c.jsx)(i,{onSelect:()=>{}})},f={render:()=>(0,c.jsx)(i,{root:{pid:1,name:`lonely-proc`,is_root:!0,cpu_percent:.1},onSelect:()=>{}})},p=[`Default`,`Loading`,`SingleNode`],u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  render: args => {
    const [pid, setPid] = useState<number | null>(args.selectedPid ?? null);
    return <div className="w-[640px]">
        <DiagnosticsTree {...args} selectedPid={pid} onSelect={setPid} />
      </div>;
  }
}`,...u.parameters?.docs?.source}}},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  render: () => <DiagnosticsTree onSelect={() => {}} />
}`,...d.parameters?.docs?.source}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  render: () => <DiagnosticsTree root={{
    pid: 1,
    name: "lonely-proc",
    is_root: true,
    cpu_percent: 0.1
  }} onSelect={() => {}} />
}`,...f.parameters?.docs?.source}}}})))()}m();export{u as Default,d as Loading,f as SingleNode,p as __namedExportsOrder,l as default};