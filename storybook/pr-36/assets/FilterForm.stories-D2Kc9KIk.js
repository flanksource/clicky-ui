import{j as r,r as l}from"./iframe-tozGD2Qm.js";import{Q as d,a as f}from"./suspense-zHp8QjVW.js";import{F as c}from"./FilterForm-DXOGDVNi.js";import{F as g}from"./rpc-story.fixtures-DGHkng_A.js";import"./preload-helper-DMBmwiZ1.js";import"./useQuery-VF1ne8P2.js";import"./button-BYIHgtoG.js";import"./utils-BLSKlp9E.js";import"./index-1evVQkiP.js";import"./loading-B_J6UqsB.js";import"./TimeRange-GNI-uP9a.js";import"./floating-ui.react-Cr0Yg90Q.js";import"./index-DpZMNVsH.js";import"./index-CoipAafu.js";import"./Icon-DV6apHHG.js";import"./modalStack-Bh_XSQ11.js";import"./zIndex-CigQ76av.js";import"./select-DX8Y4cr4.js";import"./UiChevronDown-CG_aM3Ba.js";import"./UiWatch-D1gWowsV.js";import"./UiCalendar-aD5ISbw5.js";import"./UiArrowRight-Cd74eEmp.js";import"./UiClose-DbbVB4Tg.js";import"./FilterPill-_qy4kQee.js";import"./UiAdd-B-QRjwmL.js";import"./UiRemove-MonctF9Y.js";import"./UiCheck-C56O4kNi.js";import"./types-BHfRQr8X.js";import"./UiSearch-OIvii3ib.js";const{fn:y}=__STORYBOOK_MODULE_TEST__,h=[{name:"q",in:"query",schema:{type:"string"},description:"Search query"},{name:"kind",in:"query",schema:{type:"string",enum:["big","small"]},description:"Widget kind"},{name:"limit",in:"query",schema:{type:"integer",default:50},description:"Max rows"}];function S(i){const u=l.useMemo(()=>new d({defaultOptions:{queries:{retry:!1,gcTime:0}}}),[]);return r.jsx(f,{client:u,children:r.jsx("div",{className:"max-w-md",children:r.jsx(c,{...i})})})}const H={title:"Clicky-RPC/FilterForm",component:c,parameters:{docs:{description:{component:"Renders an operation's query parameters as a compact filter form (the list-page sidebar of the entity explorer). Supports locked/hidden values, server-side lookup options (via the client) and auto-submit. This story injects a synthetic client."}}},render:i=>r.jsx(S,{...i})},t={args:{client:g,path:"/api/v1/widgets",method:"get",parameters:h,submitLabel:"Apply filters",onSubmit:y()}},e={args:{...t.args,autoSubmit:!0}};var o,s,a;t.parameters={...t.parameters,docs:{...(o=t.parameters)==null?void 0:o.docs,source:{originalSource:`{
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
