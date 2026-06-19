import{j as r,r as l}from"./iframe-CmW1bXIL.js";import{Q as d,a as f}from"./suspense-BvtEJzrj.js";import{F as c}from"./FilterForm-DyjC5NvY.js";import{F as g}from"./rpc-story.fixtures-C_Jwbi38.js";import"./preload-helper-ByUaG9M2.js";import"./useQuery-CdU0hvij.js";import"./button-Cbf2D1Lj.js";import"./utils-BLSKlp9E.js";import"./index-1evVQkiP.js";import"./loading-BzXaTpRU.js";import"./TimeRange-B1rlhEFO.js";import"./floating-ui.react-mTFBW1Ma.js";import"./index-CvvFywp4.js";import"./index-CwG-8UeD.js";import"./Icon-DgKWNfUH.js";import"./modalStack-CihdweRn.js";import"./zIndex-CigQ76av.js";import"./select-pkm1YVYK.js";import"./UiChevronDown-DNI0luU1.js";import"./UiWatch-BJsevy8H.js";import"./UiCalendar-CMRdMOnT.js";import"./UiArrowRight-Ce2uwFX5.js";import"./UiClose-BWsNrAoC.js";import"./FilterPill-D3c4bT_8.js";import"./UiAdd-cDftFtFQ.js";import"./UiRemove-DdJaLPEm.js";import"./UiCheck-D6M7xpTV.js";import"./types-BHfRQr8X.js";import"./UiSearch-L2vxKGO0.js";const{fn:y}=__STORYBOOK_MODULE_TEST__,h=[{name:"q",in:"query",schema:{type:"string"},description:"Search query"},{name:"kind",in:"query",schema:{type:"string",enum:["big","small"]},description:"Widget kind"},{name:"limit",in:"query",schema:{type:"integer",default:50},description:"Max rows"}];function S(i){const u=l.useMemo(()=>new d({defaultOptions:{queries:{retry:!1,gcTime:0}}}),[]);return r.jsx(f,{client:u,children:r.jsx("div",{className:"max-w-md",children:r.jsx(c,{...i})})})}const H={title:"Clicky-RPC/FilterForm",component:c,parameters:{docs:{description:{component:"Renders an operation's query parameters as a compact filter form (the list-page sidebar of the entity explorer). Supports locked/hidden values, server-side lookup options (via the client) and auto-submit. This story injects a synthetic client."}}},render:i=>r.jsx(S,{...i})},t={args:{client:g,path:"/api/v1/widgets",method:"get",parameters:h,submitLabel:"Apply filters",onSubmit:y()}},e={args:{...t.args,autoSubmit:!0}};var o,s,a;t.parameters={...t.parameters,docs:{...(o=t.parameters)==null?void 0:o.docs,source:{originalSource:`{
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
