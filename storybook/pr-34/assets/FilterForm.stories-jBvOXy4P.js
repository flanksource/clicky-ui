import{j as r,r as l}from"./iframe-Ch1BYoLl.js";import{Q as d,a as f}from"./suspense-DoJFb82X.js";import{F as c}from"./FilterForm-CzISyNLH.js";import{F as g}from"./rpc-story.fixtures-DHdbXDn5.js";import"./preload-helper-B4w--iqy.js";import"./useQuery-COCbxg8M.js";import"./button-C_7HN6uA.js";import"./utils-BLSKlp9E.js";import"./index-1evVQkiP.js";import"./loading-D4VpgK2W.js";import"./TimeRange-XtS2MF_9.js";import"./floating-ui.react-rRvTefo0.js";import"./index-DWuQH2px.js";import"./index-D4kBRSRx.js";import"./Icon-CajlMFHd.js";import"./modalStack-CXz3gd3A.js";import"./zIndex-CigQ76av.js";import"./select-Dw5uhEZ_.js";import"./UiChevronDown-Cr-fH5xI.js";import"./UiWatch-Dk5qcItP.js";import"./UiCalendar-CC_TAq6h.js";import"./UiArrowRight-7fndfbAh.js";import"./UiClose-B7EVqjbt.js";import"./FilterPill-BGPZ3wsp.js";import"./UiAdd-CvQNATwt.js";import"./UiRemove-DUUyKYfT.js";import"./UiCheck-D5P45Pjn.js";import"./types-BHfRQr8X.js";import"./UiSearch-B-mqYh-g.js";const{fn:y}=__STORYBOOK_MODULE_TEST__,h=[{name:"q",in:"query",schema:{type:"string"},description:"Search query"},{name:"kind",in:"query",schema:{type:"string",enum:["big","small"]},description:"Widget kind"},{name:"limit",in:"query",schema:{type:"integer",default:50},description:"Max rows"}];function S(i){const u=l.useMemo(()=>new d({defaultOptions:{queries:{retry:!1,gcTime:0}}}),[]);return r.jsx(f,{client:u,children:r.jsx("div",{className:"max-w-md",children:r.jsx(c,{...i})})})}const H={title:"Clicky-RPC/FilterForm",component:c,parameters:{docs:{description:{component:"Renders an operation's query parameters as a compact filter form (the list-page sidebar of the entity explorer). Supports locked/hidden values, server-side lookup options (via the client) and auto-submit. This story injects a synthetic client."}}},render:i=>r.jsx(S,{...i})},t={args:{client:g,path:"/api/v1/widgets",method:"get",parameters:h,submitLabel:"Apply filters",onSubmit:y()}},e={args:{...t.args,autoSubmit:!0}};var o,s,a;t.parameters={...t.parameters,docs:{...(o=t.parameters)==null?void 0:o.docs,source:{originalSource:`{
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
