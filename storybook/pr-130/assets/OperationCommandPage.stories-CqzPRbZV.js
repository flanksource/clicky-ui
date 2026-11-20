import{n as e}from"./rolldown-runtime-BCiCTKAo.js";import{t}from"./react-BcdEFcws.js";import{t as n}from"./jsx-runtime-DKU1u6-r.js";import{n as r,r as i}from"./QueryClientProvider-b6YDq6fV.js";import{n as a,t as o}from"./queryClient-lXfmqi15.js";import{a as s,o as c,t as l}from"./rpc-story.fixtures-Beq817CJ.js";import{n as u,t as d}from"./OperationCommandPage-B_Rh1tSS.js";function f(e){let t=(0,p.useMemo)(()=>new o({defaultOptions:{queries:{retry:!1,gcTime:0}}}),[]);return(0,m.jsx)(r,{client:t,children:(0,m.jsx)(`div`,{className:`max-w-3xl rounded-md border border-border p-4`,children:(0,m.jsx)(d,{...e})})})}var p,m,h,g,_,v;function y(){return(y=e((()=>{p=t(),a(),i(),u(),c(),m=n(),h={title:`Clicky-RPC/OperationCommandPage`,component:d,parameters:{docs:{description:{component:"A single operation as a command page: the parameter form (`CommandForm`) over the operation's parameters, plus the rendered `CommandOutput` after running. Resolves the operation from the client by `operationId`. Requires a react-query `QueryClientProvider`; this story supplies one and a synthetic client."}}},render:e=>(0,m.jsx)(f,{...e})},g={args:{client:l,operationId:`widget_create`,renderLink:s,backHref:`/widgets`,backLabel:`Back to widgets`}},_={args:{client:l,operationId:`widget_list`,renderLink:s}},v=[`CreateWidget`,`ListWidgets`],g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
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