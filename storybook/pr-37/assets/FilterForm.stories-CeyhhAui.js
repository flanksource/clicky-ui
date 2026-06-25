import{j as r,r as l}from"./iframe-DQ9XXhpn.js";import{Q as d,a as f}from"./suspense-B8NYwupZ.js";import{F as c}from"./FilterForm-BvUWcu1F.js";import{F as g}from"./rpc-story.fixtures-BWD85c2W.js";import"./preload-helper-B2wK-Kjy.js";import"./useQuery-BVlkhY8p.js";import"./button-CE3xxuNF.js";import"./utils-BLSKlp9E.js";import"./index-1evVQkiP.js";import"./loading-ORxmrxml.js";import"./TimeRange-MD_93kyM.js";import"./floating-ui.react-DaZkj6wF.js";import"./index-BDYInp2-.js";import"./index-C6GOQB4V.js";import"./Icon-OSD6-FvK.js";import"./modalStack-BT1YNoec.js";import"./zIndex-CigQ76av.js";import"./select-6I3Clfwh.js";import"./UiChevronDown-B2K9Ka4v.js";import"./UiWatch-D6tN40P_.js";import"./UiCalendar-DYAYcylm.js";import"./UiArrowRight-0x6Am8yU.js";import"./UiClose-D-7AUFZ5.js";import"./FilterPill-5nce_K9Q.js";import"./UiAdd-lGhx2fYA.js";import"./UiRemove-posUC4Fy.js";import"./UiCheck-BSaE0h4R.js";import"./types-BHfRQr8X.js";import"./UiSearch-CUaTG5b7.js";const{fn:y}=__STORYBOOK_MODULE_TEST__,h=[{name:"q",in:"query",schema:{type:"string"},description:"Search query"},{name:"kind",in:"query",schema:{type:"string",enum:["big","small"]},description:"Widget kind"},{name:"limit",in:"query",schema:{type:"integer",default:50},description:"Max rows"}];function S(i){const u=l.useMemo(()=>new d({defaultOptions:{queries:{retry:!1,gcTime:0}}}),[]);return r.jsx(f,{client:u,children:r.jsx("div",{className:"max-w-md",children:r.jsx(c,{...i})})})}const H={title:"Clicky-RPC/FilterForm",component:c,parameters:{docs:{description:{component:"Renders an operation's query parameters as a compact filter form (the list-page sidebar of the entity explorer). Supports locked/hidden values, server-side lookup options (via the client) and auto-submit. This story injects a synthetic client."}}},render:i=>r.jsx(S,{...i})},t={args:{client:g,path:"/api/v1/widgets",method:"get",parameters:h,submitLabel:"Apply filters",onSubmit:y()}},e={args:{...t.args,autoSubmit:!0}};var o,s,a;t.parameters={...t.parameters,docs:{...(o=t.parameters)==null?void 0:o.docs,source:{originalSource:`{
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
