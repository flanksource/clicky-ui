import{j as s,ae as S,af as R,r as P,a2 as U,a5 as b,ag as K}from"./iframe-BK7fwFVO.js";import{B as v}from"./Badge-XzN9bViS.js";import{I as l}from"./Icon-Cpi1U54P.js";import{T as n}from"./Tree-Bc__1QSo.js";import"./preload-helper-CLp6iKya.js";import"./utils-CR52uffu.js";import"./index-0zBpNI7D.js";import"./TreeNode-BnV1ej7P.js";const A={title:"Data/Tree",component:n,args:{roots:[{id:"root",label:"Root",children:[{id:"child",label:"Child"}]}],getKey:e=>e.id,getChildren:e=>e.children,renderRow:({node:e})=>e.label,showControls:!0},parameters:{docs:{description:{component:"Generic hierarchical list with built-in search, expand/collapse controls, custom row rendering, secondary child support, and controlled expand-all state."}}}},k=[{id:"root",name:"my-suite",status:"failed",children:[{id:"g1",name:"group: auth",status:"passed",children:[{id:"t1",name:"logs in",status:"passed",duration:42},{id:"t2",name:"logs out",status:"passed",duration:18}]},{id:"g2",name:"group: billing",status:"failed",children:[{id:"t3",name:"charges card",status:"failed",duration:210},{id:"t4",name:"refund",status:"skipped"}]}]}],r={render:()=>{const[e,i]=P.useState(null);return s.jsx(n,{roots:k,getChildren:t=>t.children,getKey:t=>t.id,selected:e,onSelect:i,defaultOpen:(t,c)=>c<1||t.status==="failed",renderRow:({node:t})=>{const c=t.status==="passed"?U:t.status==="failed"?b:K,w=t.status==="passed"?"success":t.status==="failed"?"danger":"warning";return s.jsxs(s.Fragment,{children:[s.jsx(l,{icon:c}),s.jsx("span",{className:"truncate flex-1",children:t.name}),t.duration&&s.jsxs("span",{className:"text-xs text-muted-foreground",children:[t.duration,"ms"]}),s.jsx(v,{tone:w,size:"sm",children:t.status})]})}})}},E=[{pid:1,name:"init",cpu:.1,children:[{pid:23,name:"sshd",cpu:0},{pid:42,name:"node",cpu:12.4,children:[{pid:100,name:"vite",cpu:5.2}]}]}],a={render:()=>s.jsx(n,{roots:E,getChildren:e=>e.children,getKey:e=>e.pid,defaultOpen:()=>!0,renderRow:({node:e})=>s.jsxs(s.Fragment,{children:[s.jsx(l,{icon:R,className:"text-muted-foreground"}),s.jsx("span",{className:"font-medium",children:e.name}),s.jsxs("span",{className:"text-xs text-muted-foreground",children:["pid ",e.pid]}),s.jsx("span",{className:"flex-1"}),s.jsxs("span",{className:"text-xs text-muted-foreground",children:[e.cpu.toFixed(1),"%"]})]})})},O=[{id:"g-pod",kind:"group",name:"Pod (2)",children:[{id:"p1",kind:"Pod",name:"api-server"},{id:"p2",kind:"Pod",name:"worker"}]},{id:"g-svc",kind:"group",name:"Service (1)",children:[{id:"s1",kind:"Service",name:"api"}]}],d={render:()=>s.jsx(n,{roots:O,getChildren:e=>e.children,getKey:e=>e.id,defaultOpen:()=>!0,renderRow:({node:e,hasChildren:i})=>i?s.jsx("span",{className:"font-medium text-sm",children:e.name}):s.jsxs(s.Fragment,{children:[s.jsx(l,{icon:S,className:"text-blue-500"}),s.jsx("span",{children:e.name})]})})},o={render:()=>s.jsx(n,{roots:[],getChildren:e=>e.children,getKey:e=>e.id,renderRow:()=>null,empty:s.jsx("div",{className:"p-density-4 text-muted-foreground text-sm",children:"No tests yet"})})};var u,p,m;r.parameters={...r.parameters,docs:{...(u=r.parameters)==null?void 0:u.docs,source:{originalSource:`{
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
}`,...(m=(p=r.parameters)==null?void 0:p.docs)==null?void 0:m.source}}};var g,x,h;a.parameters={...a.parameters,docs:{...(g=a.parameters)==null?void 0:g.docs,source:{originalSource:`{
  render: () => <Tree<Proc> roots={processes} getChildren={p => p.children} getKey={p => p.pid} defaultOpen={() => true} renderRow={({
    node
  }) => <>
          <Icon icon={UiDebug} className="text-muted-foreground" />
          <span className="font-medium">{node.name}</span>
          <span className="text-xs text-muted-foreground">pid {node.pid}</span>
          <span className="flex-1" />
          <span className="text-xs text-muted-foreground">{node.cpu.toFixed(1)}%</span>
        </>} />
}`,...(h=(x=a.parameters)==null?void 0:x.docs)==null?void 0:h.source}}};var f,j,N;d.parameters={...d.parameters,docs:{...(f=d.parameters)==null?void 0:f.docs,source:{originalSource:`{
  render: () => <Tree<Config> roots={groups} getChildren={c => c.children} getKey={c => c.id} defaultOpen={() => true} renderRow={({
    node,
    hasChildren
  }) => hasChildren ? <span className="font-medium text-sm">{node.name}</span> : <>
            <Icon icon={UiClass} className="text-blue-500" />
            <span>{node.name}</span>
          </>} />
}`,...(N=(j=d.parameters)==null?void 0:j.docs)==null?void 0:N.source}}};var y,C,T;o.parameters={...o.parameters,docs:{...(y=o.parameters)==null?void 0:y.docs,source:{originalSource:`{
  render: () => <Tree<Test> roots={[]} getChildren={t => t.children} getKey={t => t.id} renderRow={() => null} empty={<div className="p-density-4 text-muted-foreground text-sm">No tests yet</div>} />
}`,...(T=(C=o.parameters)==null?void 0:C.docs)==null?void 0:T.source}}};const H=["TestTree","ProcessTree","GroupedConfigTree","EmptyState"];export{o as EmptyState,d as GroupedConfigTree,a as ProcessTree,r as TestTree,H as __namedExportsOrder,A as default};
