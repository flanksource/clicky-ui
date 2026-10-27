import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{t}from"./react-pByjoP3I.js";import{t as n}from"./jsx-runtime-BG4KOiPz.js";import{Es as r,Hs as i,eo as a,go as o,n as s,ys as c}from"./icons-N6BqLuiz.js";import{r as l,t as u}from"./Icon-Drf4m9fW.js";import{n as d,t as f}from"./Badge-lfCmNIWB.js";import{n as p,t as m}from"./Tree-DmNbS5GP.js";var h,g,_,v,y,b,x,S,C,w,T;function E(){return(E=e((()=>{h=t(),d(),l(),s(),p(),g=n(),_={title:`Data/Tree`,component:m,args:{roots:[{id:`root`,label:`Root`,children:[{id:`child`,label:`Child`}]}],getKey:e=>e.id,getChildren:e=>e.children,renderRow:({node:e})=>e.label,showControls:!0},parameters:{docs:{description:{component:`Generic hierarchical list with built-in search, expand/collapse controls, custom row rendering, secondary child support, and controlled expand-all state.`}}}},v=[{id:`root`,name:`my-suite`,status:`failed`,children:[{id:`g1`,name:`group: auth`,status:`passed`,children:[{id:`t1`,name:`logs in`,status:`passed`,duration:42},{id:`t2`,name:`logs out`,status:`passed`,duration:18}]},{id:`g2`,name:`group: billing`,status:`failed`,children:[{id:`t3`,name:`charges card`,status:`failed`,duration:210},{id:`t4`,name:`refund`,status:`skipped`}]}]}],y={render:()=>{let[e,t]=(0,h.useState)(null);return(0,g.jsx)(m,{roots:v,getChildren:e=>e.children,getKey:e=>e.id,selected:e,onSelect:t,defaultOpen:(e,t)=>t<1||e.status===`failed`,renderRow:({node:e})=>{let t=e.status===`passed`?c:e.status===`failed`?i:o,n=e.status===`passed`?`success`:e.status===`failed`?`danger`:`warning`;return(0,g.jsxs)(g.Fragment,{children:[(0,g.jsx)(u,{icon:t}),(0,g.jsx)(`span`,{className:`truncate flex-1`,children:e.name}),e.duration&&(0,g.jsxs)(`span`,{className:`text-xs text-muted-foreground`,children:[e.duration,`ms`]}),(0,g.jsx)(f,{tone:n,size:`sm`,children:e.status})]})}})}},b=[{pid:1,name:`init`,cpu:.1,children:[{pid:23,name:`sshd`,cpu:0},{pid:42,name:`node`,cpu:12.4,children:[{pid:100,name:`vite`,cpu:5.2}]}]}],x={render:()=>(0,g.jsx)(m,{roots:b,getChildren:e=>e.children,getKey:e=>e.pid,defaultOpen:()=>!0,renderRow:({node:e})=>(0,g.jsxs)(g.Fragment,{children:[(0,g.jsx)(u,{icon:r,className:`text-muted-foreground`}),(0,g.jsx)(`span`,{className:`font-medium`,children:e.name}),(0,g.jsxs)(`span`,{className:`text-xs text-muted-foreground`,children:[`pid `,e.pid]}),(0,g.jsx)(`span`,{className:`flex-1`}),(0,g.jsxs)(`span`,{className:`text-xs text-muted-foreground`,children:[e.cpu.toFixed(1),`%`]})]})})},S=[{id:`g-pod`,kind:`group`,name:`Pod (2)`,children:[{id:`p1`,kind:`Pod`,name:`api-server`},{id:`p2`,kind:`Pod`,name:`worker`}]},{id:`g-svc`,kind:`group`,name:`Service (1)`,children:[{id:`s1`,kind:`Service`,name:`api`}]}],C={render:()=>(0,g.jsx)(m,{roots:S,getChildren:e=>e.children,getKey:e=>e.id,defaultOpen:()=>!0,renderRow:({node:e,hasChildren:t})=>t?(0,g.jsx)(`span`,{className:`font-medium text-sm`,children:e.name}):(0,g.jsxs)(g.Fragment,{children:[(0,g.jsx)(u,{icon:a,className:`text-blue-500`}),(0,g.jsx)(`span`,{children:e.name})]})})},w={render:()=>(0,g.jsx)(m,{roots:[],getChildren:e=>e.children,getKey:e=>e.id,renderRow:()=>null,empty:(0,g.jsx)(`div`,{className:`p-density-4 text-muted-foreground text-sm`,children:`No tests yet`})})},T=[`TestTree`,`ProcessTree`,`GroupedConfigTree`,`EmptyState`],y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [selected, setSelected] = useState<Test | null>(null);
    return <Tree<Test> roots={tests} getChildren={t => t.children} getKey={t => t.id} selected={selected} onSelect={setSelected} defaultOpen={(t, d) => d < 1 || t.status === "failed"} renderRow={({
      node
    }) => {
      const icon = node.status === "passed" ? UiPass : node.status === "failed" ? UiError : UiPause;
      const tone = node.status === "passed" ? "success" : node.status === "failed" ? "danger" : "warning";
      return <>
              <Icon icon={icon} />
              <span className="truncate flex-1">{node.name}</span>
              {node.duration && <span className="text-xs text-muted-foreground">{node.duration}ms</span>}
              <Badge tone={tone} size="sm">
                {node.status}
              </Badge>
            </>;
    }} />;
  }
}`,...y.parameters?.docs?.source}}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  render: () => <Tree<Proc> roots={processes} getChildren={p => p.children} getKey={p => p.pid} defaultOpen={() => true} renderRow={({
    node
  }) => <>
          <Icon icon={UiDebug} className="text-muted-foreground" />
          <span className="font-medium">{node.name}</span>
          <span className="text-xs text-muted-foreground">pid {node.pid}</span>
          <span className="flex-1" />
          <span className="text-xs text-muted-foreground">{node.cpu.toFixed(1)}%</span>
        </>} />
}`,...x.parameters?.docs?.source}}},C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
  render: () => <Tree<Config> roots={groups} getChildren={c => c.children} getKey={c => c.id} defaultOpen={() => true} renderRow={({
    node,
    hasChildren
  }) => hasChildren ? <span className="font-medium text-sm">{node.name}</span> : <>
            <Icon icon={UiClass} className="text-blue-500" />
            <span>{node.name}</span>
          </>} />
}`,...C.parameters?.docs?.source}}},w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
  render: () => <Tree<Test> roots={[]} getChildren={t => t.children} getKey={t => t.id} renderRow={() => null} empty={<div className="p-density-4 text-muted-foreground text-sm">No tests yet</div>} />
}`,...w.parameters?.docs?.source}}}})))()}E();export{w as EmptyState,C as GroupedConfigTree,x as ProcessTree,y as TestTree,T as __namedExportsOrder,_ as default};