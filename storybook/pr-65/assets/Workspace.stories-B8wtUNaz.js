import{j as e,b4 as m,bc as h,Y as u,bd as b,aR as j,ax as g}from"./iframe-DcJ_qxo-.js";import{W as r}from"./Workspace-afVIOuks.js";import"./preload-helper-BHaa9cja.js";import"./utils-CR52uffu.js";const w={title:"Layout/Workspace",component:r,parameters:{layout:"fullscreen",docs:{description:{component:"VS Code-style workspace with labeled, collapsible, and resizable panes in left, center, right, and center-aligned bottom locations."}}}};function t({children:s}){return e.jsx("div",{className:"h-full bg-background p-density-3 text-sm text-muted-foreground",children:s})}const x=[{id:"explorer",label:"Explorer",icon:e.jsx(m,{}),location:"left",width:280,content:e.jsx(t,{children:"Files and folders"})},{id:"outline",label:"Outline",icon:e.jsx(h,{}),location:"left",width:280,height:180,content:e.jsx(t,{children:"Document symbols"})},{id:"editor",label:"Editor",icon:e.jsx(u,{}),location:"center",content:e.jsx(t,{children:"Primary editor surface"})},{id:"variables",label:"Variables",icon:e.jsx(b,{}),location:"right",width:320,content:e.jsx(t,{children:"Local variables"})},{id:"watch",label:"Watch",icon:e.jsx(j,{}),location:"right",width:320,height:160,content:e.jsx(t,{children:"Watch expressions"})},{id:"terminal",label:"Terminal",icon:e.jsx(g,{}),location:"bottom",height:220,content:e.jsx(t,{children:"Terminal output"})}],a={render:()=>e.jsx("div",{className:"h-[640px]",children:e.jsx(r,{panes:x,storageKey:"workspace-story",slots:{topRightActions:e.jsx("button",{type:"button",className:"px-1 text-xs",children:"Layout"})}})})},o={render:()=>e.jsx("div",{className:"h-[520px]",children:e.jsx(r,{panes:x.map(s=>s.id==="explorer"?{...s,collapsible:!1,resizable:!1}:s)})})};var n,i,l;a.parameters={...a.parameters,docs:{...(n=a.parameters)==null?void 0:n.docs,source:{originalSource:`{
  render: () => <div className="h-[640px]">
      <Workspace panes={panes} storageKey="workspace-story" slots={{
      topRightActions: <button type="button" className="px-1 text-xs">
              Layout
            </button>
    }} />
    </div>
}`,...(l=(i=a.parameters)==null?void 0:i.docs)==null?void 0:l.source}}};var c,d,p;o.parameters={...o.parameters,docs:{...(c=o.parameters)==null?void 0:c.docs,source:{originalSource:`{
  render: () => <div className="h-[520px]">
      <Workspace panes={panes.map(pane => pane.id === "explorer" ? {
      ...pane,
      collapsible: false,
      resizable: false
    } : pane)} />
    </div>
}`,...(p=(d=o.parameters)==null?void 0:d.docs)==null?void 0:p.source}}};const L=["IdeLayout","FixedExplorer"];export{o as FixedExplorer,a as IdeLayout,L as __namedExportsOrder,w as default};
