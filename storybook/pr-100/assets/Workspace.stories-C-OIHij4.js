import{j as e,bm as w,bA as v,a8 as k,bB as S,b8 as N,aQ as C,r as F}from"./iframe-PIqemlGB.js";import{W as n}from"./Workspace-CMz-WrEp.js";import"./preload-helper-CLP1olNy.js";import"./utils-DW-IJACk.js";const T={title:"Layout/Workspace",component:n,parameters:{layout:"fullscreen",docs:{description:{component:"VS Code-style workspace with labeled, collapsible, and resizable panes in left, center, right, and center-aligned bottom locations."}}}};function t({children:s}){return e.jsx("div",{className:"h-full bg-background p-density-3 text-sm text-muted-foreground",children:s})}const l=[{id:"explorer",label:"Explorer",icon:e.jsx(w,{}),location:"left",width:280,content:e.jsx(t,{children:"Files and folders"})},{id:"outline",label:"Outline",icon:e.jsx(v,{}),location:"left",width:280,height:180,content:e.jsx(t,{children:"Document symbols"})},{id:"editor",label:"Editor",icon:e.jsx(k,{}),location:"center",content:e.jsx(t,{children:"Primary editor surface"})},{id:"variables",label:"Variables",icon:e.jsx(S,{}),location:"right",width:320,content:e.jsx(t,{children:"Local variables"})},{id:"watch",label:"Watch",icon:e.jsx(N,{}),location:"right",width:320,height:160,content:e.jsx(t,{children:"Watch expressions"})},{id:"terminal",label:"Terminal",icon:e.jsx(C,{}),location:"bottom",height:220,content:e.jsx(t,{children:"Terminal output"})}],a={render:()=>e.jsx("div",{className:"h-[640px]",children:e.jsx(n,{panes:l,storageKey:"workspace-story",slots:{topRightActions:e.jsx("button",{type:"button",className:"px-1 text-xs",children:"Layout"})}})})},r={render:()=>e.jsx("div",{className:"h-[520px]",children:e.jsx(n,{panes:l.map(s=>s.id==="explorer"?{...s,collapsible:!1,resizable:!1}:s)})})};function E(){const[s,y]=F.useState(!1);return e.jsx("div",{className:"h-[520px]",children:e.jsx(n,{panes:l.map(i=>i.id==="editor"?{...i,content:e.jsxs("div",{className:"space-y-2 p-3 text-sm",children:[e.jsx("button",{type:"button",className:"rounded border px-2 py-1","aria-pressed":s,onClick:()=>y(!s),children:s?"Show the sides":"Give the editor the full width"}),e.jsx("p",{children:"Held collapsed, the sides lose their toggles; their layout comes back as it was."})]})}:i),collapsedSides:s?["left","right"]:[]})})}const o={render:()=>e.jsx(E,{})};var c,d,p;a.parameters={...a.parameters,docs:{...(c=a.parameters)==null?void 0:c.docs,source:{originalSource:`{
  render: () => <div className="h-[640px]">
      <Workspace panes={panes} storageKey="workspace-story" slots={{
      topRightActions: <button type="button" className="px-1 text-xs">
              Layout
            </button>
    }} />
    </div>
}`,...(p=(d=a.parameters)==null?void 0:d.docs)==null?void 0:p.source}}};var h,m,x;r.parameters={...r.parameters,docs:{...(h=r.parameters)==null?void 0:h.docs,source:{originalSource:`{
  render: () => <div className="h-[520px]">
      <Workspace panes={panes.map(pane => pane.id === "explorer" ? {
      ...pane,
      collapsible: false,
      resizable: false
    } : pane)} />
    </div>
}`,...(x=(m=r.parameters)==null?void 0:m.docs)==null?void 0:x.source}}};var u,b,j,f,g;o.parameters={...o.parameters,docs:{...(u=o.parameters)==null?void 0:u.docs,source:{originalSource:`{
  render: () => <FocusedCenter />
}`,...(j=(b=o.parameters)==null?void 0:b.docs)==null?void 0:j.source},description:{story:"A host holding both sides collapsed while its center needs the full width.",...(g=(f=o.parameters)==null?void 0:f.docs)==null?void 0:g.description}}};const z=["IdeLayout","FixedExplorer","HeldCollapsedSides"];export{r as FixedExplorer,o as HeldCollapsedSides,a as IdeLayout,z as __namedExportsOrder,T as default};
