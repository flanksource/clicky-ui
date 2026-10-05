import{j as e,r as l}from"./iframe-Bk9swcUR.js";import{Q as d}from"./queryClient-bHl9vIbB.js";import{Q as f}from"./suspense-Cn4jCU9d.js";import{F as c}from"./FilterForm-PpMuZq0k.js";import{F as g}from"./rpc-story.fixtures-BfyUnbT4.js";import"./preload-helper-BpddQVpQ.js";import"./useQuery-D5goCVZl.js";import"./button-BwQwEt7k.js";import"./utils-DW-IJACk.js";import"./index-CPURVhFy.js";import"./loading-CDKfpJbq.js";import"./FilterBar-EmtL7p92.js";import"./floating-ui.react-6IB_hdLH.js";import"./index-CLDbtA8-.js";import"./index-B8STd8gT.js";import"./FilterPill-CVfnxEYE.js";import"./Icon-CT2tkhoJ.js";import"./Combobox-FqMST2xS.js";import"./modalStack-CaNd2wxr.js";import"./zIndex-BGbNBNA8.js";import"./json-schema-form-size-E77C3uZS.js";import"./timestamp-format-DJzkpO9P.js";import"./Modal-C5IY1XlS.js";import"./DateTimePicker-B8Somcyq.js";import"./MultiSelect-C0fLbA24.js";import"./RangeSlider-tdtmcZfs.js";import"./TimeRange-CGJEfSXy.js";import"./select-N3OZpg7E.js";import"./WorkloadPicker-dWfhUWSm.js";import"./NamespacePicker-CKLL9-TX.js";import"./formMetadata-BMSLWh73.js";import"./data-table-filter-values-BoCQDwQ9.js";import"./duration-BuesBvhN.js";const{fn:y}=__STORYBOOK_MODULE_TEST__,h=[{name:"q",in:"query",schema:{type:"string"},description:"Search query"},{name:"kind",in:"query",schema:{type:"string",enum:["big","small"]},description:"Widget kind"},{name:"limit",in:"query",schema:{type:"integer",default:50},description:"Max rows"}];function S(i){const u=l.useMemo(()=>new d({defaultOptions:{queries:{retry:!1,gcTime:0}}}),[]);return e.jsx(f,{client:u,children:e.jsx("div",{className:"max-w-md",children:e.jsx(c,{...i})})})}const Z={title:"Clicky-RPC/FilterForm",component:c,parameters:{docs:{description:{component:"Renders an operation's query parameters as a compact filter form (the list-page sidebar of the entity explorer). Supports locked/hidden values, server-side lookup options (via the client) and auto-submit. This story injects a synthetic client."}}},render:i=>e.jsx(S,{...i})},t={args:{client:g,path:"/api/v1/widgets",method:"get",parameters:h,submitLabel:"Apply filters",onSubmit:y()}},r={args:{...t.args,autoSubmit:!0}};var o,s,m;t.parameters={...t.parameters,docs:{...(o=t.parameters)==null?void 0:o.docs,source:{originalSource:`{
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
}`,...(n=(p=r.parameters)==null?void 0:p.docs)==null?void 0:n.source}}};const $=["Default","AutoSubmit"];export{r as AutoSubmit,t as Default,$ as __namedExportsOrder,Z as default};
