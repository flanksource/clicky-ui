import{j as r,r as l}from"./iframe-0bc176G1.js";import{Q as d,a as f}from"./suspense-EeFNUonn.js";import{F as c}from"./FilterForm-C6KlbBOg.js";import{F as g}from"./rpc-story.fixtures-B4zXYyva.js";import"./preload-helper-D-2WW-AN.js";import"./useQuery-B4MKR6M7.js";import"./button-CYgJK2Rk.js";import"./utils-CR52uffu.js";import"./index-0zBpNI7D.js";import"./loading-CJdteYdy.js";import"./TimeRange-CGnGAm1F.js";import"./floating-ui.react-DUyav7Mf.js";import"./index-C5YvwvsX.js";import"./index-Ms4dS0uC.js";import"./Icon-LDnLk-Ec.js";import"./modalStack-Cr8uIIEn.js";import"./zIndex-CigQ76av.js";import"./select-DCHykvLz.js";import"./UiChevronDown-BuIn1m3V.js";import"./UiWatch-urs8z-tG.js";import"./UiCalendar-B8qIr9vT.js";import"./UiArrowRight-CnNCchvd.js";import"./UiClose--pfy67_V.js";import"./FilterPill-CL-GOm8e.js";import"./UiAdd-CSeQ7lzk.js";import"./UiRemove-B_03WPkl.js";import"./UiCheck-B-D4Byul.js";import"./types-BHfRQr8X.js";import"./UiSearch-BugLSLsD.js";const{fn:y}=__STORYBOOK_MODULE_TEST__,h=[{name:"q",in:"query",schema:{type:"string"},description:"Search query"},{name:"kind",in:"query",schema:{type:"string",enum:["big","small"]},description:"Widget kind"},{name:"limit",in:"query",schema:{type:"integer",default:50},description:"Max rows"}];function S(i){const u=l.useMemo(()=>new d({defaultOptions:{queries:{retry:!1,gcTime:0}}}),[]);return r.jsx(f,{client:u,children:r.jsx("div",{className:"max-w-md",children:r.jsx(c,{...i})})})}const H={title:"Clicky-RPC/FilterForm",component:c,parameters:{docs:{description:{component:"Renders an operation's query parameters as a compact filter form (the list-page sidebar of the entity explorer). Supports locked/hidden values, server-side lookup options (via the client) and auto-submit. This story injects a synthetic client."}}},render:i=>r.jsx(S,{...i})},t={args:{client:g,path:"/api/v1/widgets",method:"get",parameters:h,submitLabel:"Apply filters",onSubmit:y()}},e={args:{...t.args,autoSubmit:!0}};var o,s,a;t.parameters={...t.parameters,docs:{...(o=t.parameters)==null?void 0:o.docs,source:{originalSource:`{
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
