import{j as r,r as l}from"./iframe-BpRSSwZm.js";import{Q as d,a as f}from"./suspense-Bm9qLk9Q.js";import{F as c}from"./FilterForm-n8pm_xBr.js";import{F as g}from"./rpc-story.fixtures-DXnHj7G9.js";import"./preload-helper-CLp6iKya.js";import"./useQuery-tUnMcK4b.js";import"./button-DLaYyks1.js";import"./utils-CR52uffu.js";import"./index-0zBpNI7D.js";import"./loading-B8gOCNAl.js";import"./TimeRange-CFDfjNdi.js";import"./floating-ui.react-ydHiv85u.js";import"./index-Y5o9M25-.js";import"./index-DUpNOTYa.js";import"./Icon-mdei39NN.js";import"./modalStack-qb8VAS8H.js";import"./zIndex-CigQ76av.js";import"./select-DHhlOnRO.js";import"./FilterPill-sEltd1ql.js";import"./types-BHfRQr8X.js";const{fn:y}=__STORYBOOK_MODULE_TEST__,h=[{name:"q",in:"query",schema:{type:"string"},description:"Search query"},{name:"kind",in:"query",schema:{type:"string",enum:["big","small"]},description:"Widget kind"},{name:"limit",in:"query",schema:{type:"integer",default:50},description:"Max rows"}];function S(i){const u=l.useMemo(()=>new d({defaultOptions:{queries:{retry:!1,gcTime:0}}}),[]);return r.jsx(f,{client:u,children:r.jsx("div",{className:"max-w-md",children:r.jsx(c,{...i})})})}const N={title:"Clicky-RPC/FilterForm",component:c,parameters:{docs:{description:{component:"Renders an operation's query parameters as a compact filter form (the list-page sidebar of the entity explorer). Supports locked/hidden values, server-side lookup options (via the client) and auto-submit. This story injects a synthetic client."}}},render:i=>r.jsx(S,{...i})},e={args:{client:g,path:"/api/v1/widgets",method:"get",parameters:h,submitLabel:"Apply filters",onSubmit:y()}},t={args:{...e.args,autoSubmit:!0}};var s,o,a;e.parameters={...e.parameters,docs:{...(s=e.parameters)==null?void 0:s.docs,source:{originalSource:`{
  args: {
    client: FAKE_CLIENT,
    path: "/api/v1/widgets",
    method: "get",
    parameters: PARAMETERS,
    submitLabel: "Apply filters",
    onSubmit: fn()
  }
}`,...(a=(o=e.parameters)==null?void 0:o.docs)==null?void 0:a.source}}};var n,m,p;t.parameters={...t.parameters,docs:{...(n=t.parameters)==null?void 0:n.docs,source:{originalSource:`{
  args: {
    ...Default.args,
    autoSubmit: true
  }
}`,...(p=(m=t.parameters)==null?void 0:m.docs)==null?void 0:p.source}}};const Q=["Default","AutoSubmit"];export{t as AutoSubmit,e as Default,Q as __namedExportsOrder,N as default};
