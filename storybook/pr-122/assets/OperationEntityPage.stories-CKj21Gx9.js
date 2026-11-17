import{n as e}from"./rolldown-runtime-BCiCTKAo.js";import{t}from"./react-BcdEFcws.js";import{t as n}from"./jsx-runtime-DKU1u6-r.js";import{n as r,r as i}from"./QueryClientProvider-b6YDq6fV.js";import{n as a,t as o}from"./queryClient-lXfmqi15.js";import{a as s,i as c,o as l,t as u}from"./rpc-story.fixtures-Beq817CJ.js";import{n as d,t as f}from"./OperationEntityPage-oTJ_HcV9.js";function p(e){let t=(0,m.useMemo)(()=>new o({defaultOptions:{queries:{retry:!1,gcTime:0}}}),[]);return(0,h.jsx)(r,{client:t,children:(0,h.jsx)(`div`,{className:`h-[560px] overflow-auto rounded-md border border-border p-4`,children:(0,h.jsx)(f,{...e})})})}var m,h,g,_,v;function y(){return(y=e((()=>{m=t(),a(),i(),d(),l(),h=n(),g={title:`Clicky-RPC/OperationEntityPage`,component:f,parameters:{layout:`fullscreen`,docs:{description:{component:"A domain's entity page: the list view (filters + Clicky table) for a surface, drilling into per-entity detail. Resolves list/detail operations from the client for the given `surfaceKey`/entities. Requires a react-query `QueryClientProvider`; this story supplies one and a synthetic client."}}},render:e=>(0,h.jsx)(p,{...e})},_={args:{id:`wgt_42`,client:u,definition:c,entities:[`widget`],surfaceKey:`widgets`,renderLink:s,backHref:`/widgets`,backLabel:`Back to widgets`}},v=[`Default`],_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  args: {
    // OperationEntityPage is an entity *detail* page — it needs the id of the
    // entity to resolve the get-by-id endpoint and load its detail.
    id: "wgt_42",
    client: FAKE_CLIENT,
    definition: WIDGET_DEFINITION,
    entities: ["widget"],
    surfaceKey: "widgets",
    renderLink: anchorLink,
    backHref: "/widgets",
    backLabel: "Back to widgets"
  }
}`,..._.parameters?.docs?.source}}}})))()}y();export{_ as Default,v as __namedExportsOrder,g as default};