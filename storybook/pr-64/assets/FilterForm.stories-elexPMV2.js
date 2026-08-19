import{j as r,r as l}from"./iframe-ByC1ls-M.js";import{Q as d}from"./queryClient-DkIYd0-k.js";import{Q as f}from"./suspense-q6y3-W4x.js";import{F as c}from"./FilterForm-DZkNv7Ex.js";import{F as g}from"./rpc-story.fixtures-DOxfLC-G.js";import"./preload-helper-BAJsONWX.js";import"./useQuery-BV5yeLpj.js";import"./button-DiEVhEjn.js";import"./utils-DW-IJACk.js";import"./index-CPURVhFy.js";import"./loading-Qasy5AD_.js";import"./Combobox-_TjyhqvM.js";import"./Icon-BgvA8nny.js";import"./modalStack-CsMy4aGM.js";import"./zIndex-BGbNBNA8.js";import"./json-schema-form-size-E77C3uZS.js";import"./FilterPill-Cz9-D2Wu.js";import"./index-D8ux8KM0.js";import"./index-DKBAnPzp.js";import"./TimeRange-0ZtdzrsU.js";import"./floating-ui.react-DzWLi3sO.js";import"./select-C9XnIfze.js";import"./formMetadata-BDLO7_Sf.js";import"./data-table-filter-values-BjWgdAnO.js";import"./types-BHfRQr8X.js";const{fn:y}=__STORYBOOK_MODULE_TEST__,h=[{name:"q",in:"query",schema:{type:"string"},description:"Search query"},{name:"kind",in:"query",schema:{type:"string",enum:["big","small"]},description:"Widget kind"},{name:"limit",in:"query",schema:{type:"integer",default:50},description:"Max rows"}];function S(i){const u=l.useMemo(()=>new d({defaultOptions:{queries:{retry:!1,gcTime:0}}}),[]);return r.jsx(f,{client:u,children:r.jsx("div",{className:"max-w-md",children:r.jsx(c,{...i})})})}const W={title:"Clicky-RPC/FilterForm",component:c,parameters:{docs:{description:{component:"Renders an operation's query parameters as a compact filter form (the list-page sidebar of the entity explorer). Supports locked/hidden values, server-side lookup options (via the client) and auto-submit. This story injects a synthetic client."}}},render:i=>r.jsx(S,{...i})},e={args:{client:g,path:"/api/v1/widgets",method:"get",parameters:h,submitLabel:"Apply filters",onSubmit:y()}},t={args:{...e.args,autoSubmit:!0}};var o,s,a;e.parameters={...e.parameters,docs:{...(o=e.parameters)==null?void 0:o.docs,source:{originalSource:`{
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
}`,...(p=(n=t.parameters)==null?void 0:n.docs)==null?void 0:p.source}}};const Y=["Default","AutoSubmit"];export{t as AutoSubmit,e as Default,Y as __namedExportsOrder,W as default};
