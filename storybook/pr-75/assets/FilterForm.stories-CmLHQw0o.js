import{j as e,r as l}from"./iframe-BJPr9MUp.js";import{Q as d}from"./queryClient-C6c3XZo6.js";import{Q as f}from"./suspense-CuH39Ej-.js";import{F as c}from"./FilterForm-B5P6VqYy.js";import{F as g}from"./rpc-story.fixtures-CwM5yrjP.js";import"./preload-helper-CoNDIDFR.js";import"./useQuery-BIoTlE58.js";import"./button-B8dsTuZQ.js";import"./utils-DW-IJACk.js";import"./index-CPURVhFy.js";import"./loading-DIju19wB.js";import"./FilterBar-4gzxlg7T.js";import"./floating-ui.react-CsImbkCW.js";import"./index-CPdQ4eZx.js";import"./index-DgdWD9e2.js";import"./FilterPill-D9M1bTkF.js";import"./Icon-BHJH8c2q.js";import"./Combobox-JBD2C9EO.js";import"./modalStack-QICYOAYs.js";import"./zIndex-BGbNBNA8.js";import"./json-schema-form-size-E77C3uZS.js";import"./timestamp-format-CIXhO4AH.js";import"./Modal-Dovh43vD.js";import"./DateTimePicker-n2tM6Z6k.js";import"./MultiSelect-D05zdTnV.js";import"./RangeSlider-Bm_sMAmX.js";import"./TimeRange-Bgp7jwKT.js";import"./select-RR-XqR1d.js";import"./WorkloadPicker-BdAmb5l0.js";import"./NamespacePicker-B0z_E5rw.js";import"./index-eP72hBTy.js";import"./formMetadata-C_5JHrQ6.js";import"./data-table-filter-values-BjWgdAnO.js";const{fn:y}=__STORYBOOK_MODULE_TEST__,h=[{name:"q",in:"query",schema:{type:"string"},description:"Search query"},{name:"kind",in:"query",schema:{type:"string",enum:["big","small"]},description:"Widget kind"},{name:"limit",in:"query",schema:{type:"integer",default:50},description:"Max rows"}];function S(i){const u=l.useMemo(()=>new d({defaultOptions:{queries:{retry:!1,gcTime:0}}}),[]);return e.jsx(f,{client:u,children:e.jsx("div",{className:"max-w-md",children:e.jsx(c,{...i})})})}const Z={title:"Clicky-RPC/FilterForm",component:c,parameters:{docs:{description:{component:"Renders an operation's query parameters as a compact filter form (the list-page sidebar of the entity explorer). Supports locked/hidden values, server-side lookup options (via the client) and auto-submit. This story injects a synthetic client."}}},render:i=>e.jsx(S,{...i})},t={args:{client:g,path:"/api/v1/widgets",method:"get",parameters:h,submitLabel:"Apply filters",onSubmit:y()}},r={args:{...t.args,autoSubmit:!0}};var o,s,m;t.parameters={...t.parameters,docs:{...(o=t.parameters)==null?void 0:o.docs,source:{originalSource:`{
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
