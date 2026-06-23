import{j as r,r as l}from"./iframe-B-R1GM9F.js";import{Q as d,a as f}from"./suspense-D_05-LsV.js";import{F as c}from"./FilterForm-rhY6_hOE.js";import{F as g}from"./rpc-story.fixtures-DEM-Mt_1.js";import"./preload-helper-B4w--iqy.js";import"./useQuery-BND5mFfD.js";import"./button-BuoaacKd.js";import"./utils-BLSKlp9E.js";import"./index-1evVQkiP.js";import"./loading-BCTdXuAj.js";import"./TimeRange-DWYtJWrH.js";import"./floating-ui.react-DPNvzpty.js";import"./index-DJve4rSX.js";import"./index-BWgeyKN8.js";import"./Icon-GOgSuK4c.js";import"./modalStack-DOuKvvHi.js";import"./zIndex-CigQ76av.js";import"./select-DNUjaytE.js";import"./UiChevronDown-7vVXchWm.js";import"./UiWatch-ByqfI7k3.js";import"./UiCalendar-DDvtnKAI.js";import"./UiArrowRight-D7ofd1mB.js";import"./UiClose-CK_Ztmv-.js";import"./FilterPill-B0MqmF1U.js";import"./UiAdd-6kIRNr7o.js";import"./UiRemove--q7Gi2Ve.js";import"./UiCheck-BThsfaV8.js";import"./types-BHfRQr8X.js";import"./UiSearch-Dqhkv3lF.js";const{fn:y}=__STORYBOOK_MODULE_TEST__,h=[{name:"q",in:"query",schema:{type:"string"},description:"Search query"},{name:"kind",in:"query",schema:{type:"string",enum:["big","small"]},description:"Widget kind"},{name:"limit",in:"query",schema:{type:"integer",default:50},description:"Max rows"}];function S(i){const u=l.useMemo(()=>new d({defaultOptions:{queries:{retry:!1,gcTime:0}}}),[]);return r.jsx(f,{client:u,children:r.jsx("div",{className:"max-w-md",children:r.jsx(c,{...i})})})}const H={title:"Clicky-RPC/FilterForm",component:c,parameters:{docs:{description:{component:"Renders an operation's query parameters as a compact filter form (the list-page sidebar of the entity explorer). Supports locked/hidden values, server-side lookup options (via the client) and auto-submit. This story injects a synthetic client."}}},render:i=>r.jsx(S,{...i})},t={args:{client:g,path:"/api/v1/widgets",method:"get",parameters:h,submitLabel:"Apply filters",onSubmit:y()}},e={args:{...t.args,autoSubmit:!0}};var o,s,a;t.parameters={...t.parameters,docs:{...(o=t.parameters)==null?void 0:o.docs,source:{originalSource:`{
  args: {
    client: FAKE_CLIENT,
    path: "/api/v1/widgets",
    method: "get",
    parameters: PARAMETERS,
    submitLabel: "Apply filters",
    onSubmit: fn()
  }
}`,...(a=(s=t.parameters)==null?void 0:s.docs)==null?void 0:a.source}}};var m,n,p;e.parameters={...e.parameters,docs:{...(m=e.parameters)==null?void 0:m.docs,source:{originalSource:`{
  args: {
    ...Default.args,
    autoSubmit: true
  }
}`,...(p=(n=e.parameters)==null?void 0:n.docs)==null?void 0:p.source}}};const J=["Default","AutoSubmit"];export{e as AutoSubmit,t as Default,J as __namedExportsOrder,H as default};
