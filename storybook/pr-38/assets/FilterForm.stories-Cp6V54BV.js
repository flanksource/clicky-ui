import{j as r,r as l}from"./iframe-BxLPOr6M.js";import{Q as d,a as f}from"./suspense-DJ3MBEGN.js";import{F as c}from"./FilterForm-WjV9K1hI.js";import{F as g}from"./rpc-story.fixtures-DRBelces.js";import"./preload-helper-C4wV90-x.js";import"./useQuery-D3BLezaY.js";import"./button-CcdgmEp6.js";import"./utils-CR52uffu.js";import"./index-0zBpNI7D.js";import"./loading-C28S_Ccf.js";import"./TimeRange-B20I7o7D.js";import"./floating-ui.react-DuikDt8B.js";import"./index-DOlc9q0f.js";import"./index-CXpH9Yf8.js";import"./Icon-DGql8Ler.js";import"./modalStack-BJc3ZvRY.js";import"./zIndex-CigQ76av.js";import"./select-BQiAzG3l.js";import"./UiChevronDown-BxzZdAmx.js";import"./UiWatch-DyAJyBtK.js";import"./UiCalendar-BZYLhFp1.js";import"./UiArrowRight-W2CLP-s8.js";import"./UiClose-BkgTCVec.js";import"./FilterPill-CCjDi8CW.js";import"./UiAdd-JiDWhMD_.js";import"./UiRemove-BjxrPqZR.js";import"./UiCheck-DcO0ZANr.js";import"./types-BHfRQr8X.js";import"./UiSearch-CjFq2-8_.js";const{fn:y}=__STORYBOOK_MODULE_TEST__,h=[{name:"q",in:"query",schema:{type:"string"},description:"Search query"},{name:"kind",in:"query",schema:{type:"string",enum:["big","small"]},description:"Widget kind"},{name:"limit",in:"query",schema:{type:"integer",default:50},description:"Max rows"}];function S(i){const u=l.useMemo(()=>new d({defaultOptions:{queries:{retry:!1,gcTime:0}}}),[]);return r.jsx(f,{client:u,children:r.jsx("div",{className:"max-w-md",children:r.jsx(c,{...i})})})}const H={title:"Clicky-RPC/FilterForm",component:c,parameters:{docs:{description:{component:"Renders an operation's query parameters as a compact filter form (the list-page sidebar of the entity explorer). Supports locked/hidden values, server-side lookup options (via the client) and auto-submit. This story injects a synthetic client."}}},render:i=>r.jsx(S,{...i})},t={args:{client:g,path:"/api/v1/widgets",method:"get",parameters:h,submitLabel:"Apply filters",onSubmit:y()}},e={args:{...t.args,autoSubmit:!0}};var o,s,a;t.parameters={...t.parameters,docs:{...(o=t.parameters)==null?void 0:o.docs,source:{originalSource:`{
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
