import{j as e,r as l}from"./iframe-DeBYCw4x.js";import{Q as d}from"./queryClient-B_9eng9g.js";import{Q as f}from"./suspense-BzBLBQV6.js";import{F as c}from"./FilterForm-CfIiAqUM.js";import{F as g}from"./rpc-story.fixtures-BfsjhXP9.js";import"./preload-helper-CcRYDqr-.js";import"./useQuery-CIeNeFpw.js";import"./button-DB9m7UYN.js";import"./utils-DW-IJACk.js";import"./index-CPURVhFy.js";import"./loading-ho48Z2wq.js";import"./FilterBar-mv1uq_Za.js";import"./floating-ui.react-CJIncd7i.js";import"./index-Dt3DPIKA.js";import"./index-MmMKnFNW.js";import"./FilterPill-DFY6Z2w0.js";import"./Icon-CGwyQOB1.js";import"./Combobox-Blg1URfg.js";import"./modalStack-Bmz6C5Fa.js";import"./zIndex-BGbNBNA8.js";import"./json-schema-form-size-E77C3uZS.js";import"./timestamp-format-DJzkpO9P.js";import"./Modal-DKr8ZZ_E.js";import"./DateTimePicker-TXnXjNJ7.js";import"./MultiSelect-BAke_gC4.js";import"./RangeSlider-CY-mpLNd.js";import"./TimeRange-1nQfxhxt.js";import"./select-C_dZVFqX.js";import"./WorkloadPicker-BOLGZqyS.js";import"./NamespacePicker-10mVS6un.js";import"./index-CmecybCa.js";import"./formMetadata-KKPMiMb9.js";import"./data-table-filter-values-BjWgdAnO.js";const{fn:y}=__STORYBOOK_MODULE_TEST__,h=[{name:"q",in:"query",schema:{type:"string"},description:"Search query"},{name:"kind",in:"query",schema:{type:"string",enum:["big","small"]},description:"Widget kind"},{name:"limit",in:"query",schema:{type:"integer",default:50},description:"Max rows"}];function S(i){const u=l.useMemo(()=>new d({defaultOptions:{queries:{retry:!1,gcTime:0}}}),[]);return e.jsx(f,{client:u,children:e.jsx("div",{className:"max-w-md",children:e.jsx(c,{...i})})})}const Z={title:"Clicky-RPC/FilterForm",component:c,parameters:{docs:{description:{component:"Renders an operation's query parameters as a compact filter form (the list-page sidebar of the entity explorer). Supports locked/hidden values, server-side lookup options (via the client) and auto-submit. This story injects a synthetic client."}}},render:i=>e.jsx(S,{...i})},t={args:{client:g,path:"/api/v1/widgets",method:"get",parameters:h,submitLabel:"Apply filters",onSubmit:y()}},r={args:{...t.args,autoSubmit:!0}};var o,s,m;t.parameters={...t.parameters,docs:{...(o=t.parameters)==null?void 0:o.docs,source:{originalSource:`{
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
