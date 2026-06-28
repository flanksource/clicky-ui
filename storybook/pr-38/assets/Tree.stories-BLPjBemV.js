import{j as s,r as S}from"./iframe-BxLPOr6M.js";import{B as U}from"./Badge-CMVsmLhG.js";import{I as l}from"./Icon-DGql8Ler.js";import{T as r}from"./Tree-B8NLzSEo.js";import{U as R}from"./UiClass-cBj3Dg8j.js";import{U as P}from"./UiDebug-DabtHlXk.js";import{U as b}from"./UiPass-fzCktA5A.js";import{U as K}from"./UiError-DdzXw9FK.js";import{U as v}from"./UiPause-DOgO8Yiq.js";import"./preload-helper-C4wV90-x.js";import"./utils-CR52uffu.js";import"./index-0zBpNI7D.js";import"./TreeNode-Cc5f5pT6.js";import"./UiChevronDown-BxzZdAmx.js";import"./UiChevronRight-DKNjap7a.js";import"./UiSearch-CjFq2-8_.js";import"./UiClose-BkgTCVec.js";import"./UiExpandAll-Qls7xI8d.js";const Z={title:"Data/Tree",component:r,args:{roots:[{id:"root",label:"Root",children:[{id:"child",label:"Child"}]}],getKey:e=>e.id,getChildren:e=>e.children,renderRow:({node:e})=>e.label,showControls:!0},parameters:{docs:{description:{component:"Generic hierarchical list with built-in search, expand/collapse controls, custom row rendering, secondary child support, and controlled expand-all state."}}}},k=[{id:"root",name:"my-suite",status:"failed",children:[{id:"g1",name:"group: auth",status:"passed",children:[{id:"t1",name:"logs in",status:"passed",duration:42},{id:"t2",name:"logs out",status:"passed",duration:18}]},{id:"g2",name:"group: billing",status:"failed",children:[{id:"t3",name:"charges card",status:"failed",duration:210},{id:"t4",name:"refund",status:"skipped"}]}]}],n={render:()=>{const[e,i]=S.useState(null);return s.jsx(r,{roots:k,getChildren:t=>t.children,getKey:t=>t.id,selected:e,onSelect:i,defaultOpen:(t,c)=>c<1||t.status==="failed",renderRow:({node:t})=>{const c=t.status==="passed"?b:t.status==="failed"?K:v,w=t.status==="passed"?"success":t.status==="failed"?"danger":"warning";return s.jsxs(s.Fragment,{children:[s.jsx(l,{icon:c}),s.jsx("span",{className:"truncate flex-1",children:t.name}),t.duration&&s.jsxs("span",{className:"text-xs text-muted-foreground",children:[t.duration,"ms"]}),s.jsx(U,{tone:w,size:"sm",children:t.status})]})}})}},E=[{pid:1,name:"init",cpu:.1,children:[{pid:23,name:"sshd",cpu:0},{pid:42,name:"node",cpu:12.4,children:[{pid:100,name:"vite",cpu:5.2}]}]}],a={render:()=>s.jsx(r,{roots:E,getChildren:e=>e.children,getKey:e=>e.pid,defaultOpen:()=>!0,renderRow:({node:e})=>s.jsxs(s.Fragment,{children:[s.jsx(l,{icon:P,className:"text-muted-foreground"}),s.jsx("span",{className:"font-medium",children:e.name}),s.jsxs("span",{className:"text-xs text-muted-foreground",children:["pid ",e.pid]}),s.jsx("span",{className:"flex-1"}),s.jsxs("span",{className:"text-xs text-muted-foreground",children:[e.cpu.toFixed(1),"%"]})]})})},O=[{id:"g-pod",kind:"group",name:"Pod (2)",children:[{id:"p1",kind:"Pod",name:"api-server"},{id:"p2",kind:"Pod",name:"worker"}]},{id:"g-svc",kind:"group",name:"Service (1)",children:[{id:"s1",kind:"Service",name:"api"}]}],o={render:()=>s.jsx(r,{roots:O,getChildren:e=>e.children,getKey:e=>e.id,defaultOpen:()=>!0,renderRow:({node:e,hasChildren:i})=>i?s.jsx("span",{className:"font-medium text-sm",children:e.name}):s.jsxs(s.Fragment,{children:[s.jsx(l,{icon:R,className:"text-blue-500"}),s.jsx("span",{children:e.name})]})})},d={render:()=>s.jsx(r,{roots:[],getChildren:e=>e.children,getKey:e=>e.id,renderRow:()=>null,empty:s.jsx("div",{className:"p-density-4 text-muted-foreground text-sm",children:"No tests yet"})})};var m,p,u;n.parameters={...n.parameters,docs:{...(m=n.parameters)==null?void 0:m.docs,source:{originalSource:`{
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
}`,...(u=(p=n.parameters)==null?void 0:p.docs)==null?void 0:u.source}}};var g,x,h;a.parameters={...a.parameters,docs:{...(g=a.parameters)==null?void 0:g.docs,source:{originalSource:`{
  render: () => <Tree<Proc> roots={processes} getChildren={p => p.children} getKey={p => p.pid} defaultOpen={() => true} renderRow={({
    node
  }) => <>
          <Icon icon={UiDebug} className="text-muted-foreground" />
          <span className="font-medium">{node.name}</span>
          <span className="text-xs text-muted-foreground">pid {node.pid}</span>
          <span className="flex-1" />
          <span className="text-xs text-muted-foreground">{node.cpu.toFixed(1)}%</span>
        </>} />
}`,...(h=(x=a.parameters)==null?void 0:x.docs)==null?void 0:h.source}}};var f,j,N;o.parameters={...o.parameters,docs:{...(f=o.parameters)==null?void 0:f.docs,source:{originalSource:`{
  render: () => <Tree<Config> roots={groups} getChildren={c => c.children} getKey={c => c.id} defaultOpen={() => true} renderRow={({
    node,
    hasChildren
  }) => hasChildren ? <span className="font-medium text-sm">{node.name}</span> : <>
            <Icon icon={UiClass} className="text-blue-500" />
            <span>{node.name}</span>
          </>} />
}`,...(N=(j=o.parameters)==null?void 0:j.docs)==null?void 0:N.source}}};var y,C,T;d.parameters={...d.parameters,docs:{...(y=d.parameters)==null?void 0:y.docs,source:{originalSource:`{
  render: () => <Tree<Test> roots={[]} getChildren={t => t.children} getKey={t => t.id} renderRow={() => null} empty={<div className="p-density-4 text-muted-foreground text-sm">No tests yet</div>} />
}`,...(T=(C=d.parameters)==null?void 0:C.docs)==null?void 0:T.source}}};const $=["TestTree","ProcessTree","GroupedConfigTree","EmptyState"];export{d as EmptyState,o as GroupedConfigTree,a as ProcessTree,n as TestTree,$ as __namedExportsOrder,Z as default};
