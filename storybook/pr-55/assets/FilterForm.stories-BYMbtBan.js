import{j as r,r as l}from"./iframe-BxSHt6am.js";import{Q as d}from"./queryClient-BrHJJWPF.js";import{Q as f}from"./suspense-Dfu9i9E4.js";import{F as c}from"./FilterForm-CDvbn6s3.js";import{F as g}from"./rpc-story.fixtures-B3YiDNdO.js";import"./preload-helper-CMdjLrOk.js";import"./useQuery-BsaAbF3J.js";import"./button-BQC6J4zs.js";import"./utils-CR52uffu.js";import"./index-0zBpNI7D.js";import"./loading-BVbt5uSK.js";import"./TimeRange-e7JkhGYw.js";import"./floating-ui.react-Dx5zIT9R.js";import"./index-C7qnLePO.js";import"./index-BfNp2C0W.js";import"./Icon-69Sjv527.js";import"./modalStack-Btv7ibBQ.js";import"./zIndex-CigQ76av.js";import"./select-CzvdH8B6.js";import"./FilterPill-BXAtaj_U.js";import"./types-BHfRQr8X.js";const{fn:y}=__STORYBOOK_MODULE_TEST__,h=[{name:"q",in:"query",schema:{type:"string"},description:"Search query"},{name:"kind",in:"query",schema:{type:"string",enum:["big","small"]},description:"Widget kind"},{name:"limit",in:"query",schema:{type:"integer",default:50},description:"Max rows"}];function S(i){const u=l.useMemo(()=>new d({defaultOptions:{queries:{retry:!1,gcTime:0}}}),[]);return r.jsx(f,{client:u,children:r.jsx("div",{className:"max-w-md",children:r.jsx(c,{...i})})})}const N={title:"Clicky-RPC/FilterForm",component:c,parameters:{docs:{description:{component:"Renders an operation's query parameters as a compact filter form (the list-page sidebar of the entity explorer). Supports locked/hidden values, server-side lookup options (via the client) and auto-submit. This story injects a synthetic client."}}},render:i=>r.jsx(S,{...i})},e={args:{client:g,path:"/api/v1/widgets",method:"get",parameters:h,submitLabel:"Apply filters",onSubmit:y()}},t={args:{...e.args,autoSubmit:!0}};var o,s,a;e.parameters={...e.parameters,docs:{...(o=e.parameters)==null?void 0:o.docs,source:{originalSource:`{
  args: {
    client: FAKE_CLIENT,
    path: "/api/v1/widgets",
    method: "get",
    parameters: PARAMETERS,
    submitLabel: "Apply filters",
    onSubmit: fn()
  }
}`,...(a=(s=e.parameters)==null?void 0:s.docs)==null?void 0:a.source}}};var n,m,p;t.parameters={...t.parameters,docs:{...(n=t.parameters)==null?void 0:n.docs,source:{originalSource:`{
  args: {
    ...Default.args,
    autoSubmit: true
  }
}`,...(p=(m=t.parameters)==null?void 0:m.docs)==null?void 0:p.source}}};const I=["Default","AutoSubmit"];export{t as AutoSubmit,e as Default,I as __namedExportsOrder,N as default};
