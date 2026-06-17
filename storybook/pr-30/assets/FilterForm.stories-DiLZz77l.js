import{j as r,r as l}from"./iframe-arejdGqO.js";import{Q as d,a as f}from"./suspense-B_Cq-Djq.js";import{F as c}from"./FilterForm-Cf20lCzI.js";import{F as g}from"./rpc-story.fixtures-B_eNSNUE.js";import"./preload-helper-D5l2DbWZ.js";import"./useQuery-CD8MMPuu.js";import"./button-DXx6_iX5.js";import"./utils-BLSKlp9E.js";import"./index-1evVQkiP.js";import"./loading-mRDMzzrx.js";import"./TimeRange-RjEyRz2D.js";import"./Icon-C86pXtXX.js";import"./select-CeQ0HxEC.js";import"./UiChevronDown-BB4_FLML.js";import"./UiWatch-B8LCSRkT.js";import"./UiCalendar-XH-8JV2N.js";import"./UiArrowRight-Ax2vyeH4.js";import"./UiClose-Bhea-P7b.js";import"./FilterPill-BF59rV-S.js";import"./UiAdd-De5NLLr5.js";import"./UiRemove-D6OtOOe_.js";import"./UiCheck-DP4n0Dhh.js";import"./types-BHfRQr8X.js";import"./UiSearch-B76p9nxi.js";const{fn:y}=__STORYBOOK_MODULE_TEST__,h=[{name:"q",in:"query",schema:{type:"string"},description:"Search query"},{name:"kind",in:"query",schema:{type:"string",enum:["big","small"]},description:"Widget kind"},{name:"limit",in:"query",schema:{type:"integer",default:50},description:"Max rows"}];function S(i){const u=l.useMemo(()=>new d({defaultOptions:{queries:{retry:!1,gcTime:0}}}),[]);return r.jsx(f,{client:u,children:r.jsx("div",{className:"max-w-md",children:r.jsx(c,{...i})})})}const U={title:"Clicky-RPC/FilterForm",component:c,parameters:{docs:{description:{component:"Renders an operation's query parameters as a compact filter form (the list-page sidebar of the entity explorer). Supports locked/hidden values, server-side lookup options (via the client) and auto-submit. This story injects a synthetic client."}}},render:i=>r.jsx(S,{...i})},e={args:{client:g,path:"/api/v1/widgets",method:"get",parameters:h,submitLabel:"Apply filters",onSubmit:y()}},t={args:{...e.args,autoSubmit:!0}};var o,s,a;e.parameters={...e.parameters,docs:{...(o=e.parameters)==null?void 0:o.docs,source:{originalSource:`{
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
