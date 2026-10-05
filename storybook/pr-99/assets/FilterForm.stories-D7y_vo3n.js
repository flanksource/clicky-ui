import{j as e,r as l}from"./iframe-DPCKfhUU.js";import{Q as d}from"./queryClient-CH-Q1fLz.js";import{Q as f}from"./suspense-Cu5yEGLz.js";import{F as c}from"./FilterForm-BxAq6DCf.js";import{F as g}from"./rpc-story.fixtures-B1DXPvnt.js";import"./preload-helper-BCNcasCO.js";import"./useQuery-DXk0UROZ.js";import"./button-BRy1qK7g.js";import"./utils-DW-IJACk.js";import"./index-CPURVhFy.js";import"./loading-BG9apmJx.js";import"./FilterBar-Dhhd2ltF.js";import"./floating-ui.react-BEtJE_L2.js";import"./index-B3Aoa8ie.js";import"./index-C7L_BM3M.js";import"./FilterPill-BH7sqdYv.js";import"./Icon-DSGt7Mo2.js";import"./Combobox-CnZ1Ars5.js";import"./modalStack-CXC147LT.js";import"./zIndex-BGbNBNA8.js";import"./json-schema-form-size-E77C3uZS.js";import"./timestamp-format-DJzkpO9P.js";import"./Modal-C2yzBEFr.js";import"./DateTimePicker-C8b6LJoe.js";import"./MultiSelect-BmqEVc_p.js";import"./RangeSlider-D0k6ky-r.js";import"./TimeRange-CYHfjysz.js";import"./select-CJBzvO-L.js";import"./WorkloadPicker-BklWKNgW.js";import"./NamespacePicker-DLOcX6Zo.js";import"./index-Mce-3mm_.js";import"./formMetadata-fzDaMxNs.js";import"./data-table-filter-values-BoCQDwQ9.js";import"./duration-BuesBvhN.js";const{fn:y}=__STORYBOOK_MODULE_TEST__,h=[{name:"q",in:"query",schema:{type:"string"},description:"Search query"},{name:"kind",in:"query",schema:{type:"string",enum:["big","small"]},description:"Widget kind"},{name:"limit",in:"query",schema:{type:"integer",default:50},description:"Max rows"}];function S(i){const u=l.useMemo(()=>new d({defaultOptions:{queries:{retry:!1,gcTime:0}}}),[]);return e.jsx(f,{client:u,children:e.jsx("div",{className:"max-w-md",children:e.jsx(c,{...i})})})}const $={title:"Clicky-RPC/FilterForm",component:c,parameters:{docs:{description:{component:"Renders an operation's query parameters as a compact filter form (the list-page sidebar of the entity explorer). Supports locked/hidden values, server-side lookup options (via the client) and auto-submit. This story injects a synthetic client."}}},render:i=>e.jsx(S,{...i})},t={args:{client:g,path:"/api/v1/widgets",method:"get",parameters:h,submitLabel:"Apply filters",onSubmit:y()}},r={args:{...t.args,autoSubmit:!0}};var o,s,m;t.parameters={...t.parameters,docs:{...(o=t.parameters)==null?void 0:o.docs,source:{originalSource:`{
  args: {
    client: FAKE_CLIENT,
    path: "/api/v1/widgets",
    method: "get",
    parameters: PARAMETERS,
    submitLabel: "Apply filters",
    onSubmit: fn()
  }
}`,...(m=(s=t.parameters)==null?void 0:s.docs)==null?void 0:m.source}}};var a,p,n;r.parameters={...r.parameters,docs:{...(a=r.parameters)==null?void 0:a.docs,source:{originalSource:`{
  args: {
    ...Default.args,
    autoSubmit: true
  }
}`,...(n=(p=r.parameters)==null?void 0:p.docs)==null?void 0:n.source}}};const tt=["Default","AutoSubmit"];export{r as AutoSubmit,t as Default,tt as __namedExportsOrder,$ as default};
