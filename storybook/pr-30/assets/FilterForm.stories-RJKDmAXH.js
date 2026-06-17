import{j as r,r as l}from"./iframe-ChhGfndY.js";import{Q as d,a as f}from"./suspense-DVStHZID.js";import{F as c}from"./FilterForm-kMa5p6AN.js";import{F as g}from"./rpc-story.fixtures-DstQcblI.js";import"./preload-helper-D5l2DbWZ.js";import"./useQuery-BLpIaRIj.js";import"./button-B_Z8s8vs.js";import"./utils-BLSKlp9E.js";import"./index-1evVQkiP.js";import"./loading-TLYQvG27.js";import"./TimeRange-LSxJrMLJ.js";import"./Icon-CYeB20F_.js";import"./select-CAqDlAGE.js";import"./UiChevronDown-CUiVFXzA.js";import"./UiWatch-MrCgZBYb.js";import"./UiCalendar-CPvlgWhM.js";import"./UiArrowRight-CFSaZxfG.js";import"./UiClose-DcGXWzrE.js";import"./FilterPill-bgJNW4vl.js";import"./UiAdd-h1IuClyL.js";import"./UiRemove-1ki0-NK9.js";import"./UiCheck-NmGBycic.js";import"./types-BHfRQr8X.js";import"./UiSearch-CHBRbBmR.js";const{fn:y}=__STORYBOOK_MODULE_TEST__,h=[{name:"q",in:"query",schema:{type:"string"},description:"Search query"},{name:"kind",in:"query",schema:{type:"string",enum:["big","small"]},description:"Widget kind"},{name:"limit",in:"query",schema:{type:"integer",default:50},description:"Max rows"}];function S(i){const u=l.useMemo(()=>new d({defaultOptions:{queries:{retry:!1,gcTime:0}}}),[]);return r.jsx(f,{client:u,children:r.jsx("div",{className:"max-w-md",children:r.jsx(c,{...i})})})}const U={title:"Clicky-RPC/FilterForm",component:c,parameters:{docs:{description:{component:"Renders an operation's query parameters as a compact filter form (the list-page sidebar of the entity explorer). Supports locked/hidden values, server-side lookup options (via the client) and auto-submit. This story injects a synthetic client."}}},render:i=>r.jsx(S,{...i})},e={args:{client:g,path:"/api/v1/widgets",method:"get",parameters:h,submitLabel:"Apply filters",onSubmit:y()}},t={args:{...e.args,autoSubmit:!0}};var o,s,a;e.parameters={...e.parameters,docs:{...(o=e.parameters)==null?void 0:o.docs,source:{originalSource:`{
  args: {
    client: FAKE_CLIENT,
    path: "/api/v1/widgets",
    method: "get",
    parameters: PARAMETERS,
    submitLabel: "Apply filters",
    onSubmit: fn()
  }
}`,...(a=(s=e.parameters)==null?void 0:s.docs)==null?void 0:a.source}}};var m,n,p;t.parameters={...t.parameters,docs:{...(m=t.parameters)==null?void 0:m.docs,source:{originalSource:`{
  args: {
    ...Default.args,
    autoSubmit: true
  }
}`,...(p=(n=t.parameters)==null?void 0:n.docs)==null?void 0:p.source}}};const W=["Default","AutoSubmit"];export{t as AutoSubmit,e as Default,W as __namedExportsOrder,U as default};
