import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{t}from"./react-pByjoP3I.js";import{t as n}from"./jsx-runtime-BG4KOiPz.js";import{g as r,h as i}from"./suspense-Bcp9qyqt.js";import{n as a,t as o}from"./queryClient-BlbTeML9.js";import{n as s,t as c}from"./FilterForm-CYtlbxfA.js";import{o as l,t as u}from"./rpc-story.fixtures-Cm67zRhY.js";function d(e){let t=(0,f.useMemo)(()=>new o({defaultOptions:{queries:{retry:!1,gcTime:0}}}),[]);return(0,p.jsx)(i,{client:t,children:(0,p.jsx)(`div`,{className:`max-w-md`,children:(0,p.jsx)(c,{...e})})})}var f,p,m,h,g,_,v,y;function b(){return(b=e((()=>{f=t(),a(),r(),s(),l(),p=n(),{fn:m}=__STORYBOOK_MODULE_TEST__,h=[{name:`q`,in:`query`,schema:{type:`string`},description:`Search query`},{name:`kind`,in:`query`,schema:{type:`string`,enum:[`big`,`small`]},description:`Widget kind`},{name:`limit`,in:`query`,schema:{type:`integer`,default:50},description:`Max rows`}],g={title:`Clicky-RPC/FilterForm`,component:c,parameters:{docs:{description:{component:`Renders an operation's query parameters as a compact filter form (the list-page sidebar of the entity explorer). Supports locked/hidden values, server-side lookup options (via the client) and auto-submit. This story injects a synthetic client.`}}},render:e=>(0,p.jsx)(d,{...e})},_={args:{client:u,path:`/api/v1/widgets`,method:`get`,parameters:h,submitLabel:`Apply filters`,onSubmit:m()}},v={args:{..._.args,autoSubmit:!0}},y=[`Default`,`AutoSubmit`],_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  args: {
    client: FAKE_CLIENT,
    path: "/api/v1/widgets",
    method: "get",
    parameters: PARAMETERS,
    submitLabel: "Apply filters",
    onSubmit: fn()
  }
}`,..._.parameters?.docs?.source}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  args: {
    ...Default.args,
    autoSubmit: true
  }
}`,...v.parameters?.docs?.source}}}})))()}b();export{v as AutoSubmit,_ as Default,y as __namedExportsOrder,g as default};