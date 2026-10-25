import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{t}from"./react-pByjoP3I.js";import{t as n}from"./jsx-runtime-BG4KOiPz.js";import{g as r,h as i}from"./suspense-Bcp9qyqt.js";import{n as a,t as o}from"./queryClient-BlbTeML9.js";import{a as s,o as c,t as l}from"./rpc-story.fixtures-Cm67zRhY.js";import{n as u,t as d}from"./OperationCommandPage-CfdAhF8e.js";function f(e){let t=(0,p.useMemo)(()=>new o({defaultOptions:{queries:{retry:!1,gcTime:0}}}),[]);return(0,m.jsx)(i,{client:t,children:(0,m.jsx)(`div`,{className:`max-w-3xl rounded-md border border-border p-4`,children:(0,m.jsx)(d,{...e})})})}var p,m,h,g,_,v;function y(){return(y=e((()=>{p=t(),a(),r(),u(),c(),m=n(),h={title:`Clicky-RPC/OperationCommandPage`,component:d,parameters:{docs:{description:{component:"A single operation as a command page: the parameter form (`CommandForm`) over the operation's parameters, plus the rendered `CommandOutput` after running. Resolves the operation from the client by `operationId`. Requires a react-query `QueryClientProvider`; this story supplies one and a synthetic client."}}},render:e=>(0,m.jsx)(f,{...e})},g={args:{client:l,operationId:`widget_create`,renderLink:s,backHref:`/widgets`,backLabel:`Back to widgets`}},_={args:{client:l,operationId:`widget_list`,renderLink:s}},v=[`CreateWidget`,`ListWidgets`],g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  args: {
    client: FAKE_CLIENT,
    operationId: "widget_create",
    renderLink: anchorLink,
    backHref: "/widgets",
    backLabel: "Back to widgets"
  }
}`,...g.parameters?.docs?.source}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  args: {
    client: FAKE_CLIENT,
    operationId: "widget_list",
    renderLink: anchorLink
  }
}`,..._.parameters?.docs?.source}}}})))()}y();export{g as CreateWidget,_ as ListWidgets,v as __namedExportsOrder,h as default};