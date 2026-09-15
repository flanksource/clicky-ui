import{j as e,r as l}from"./iframe-v660Eh3J.js";import{Q as d}from"./queryClient-qUEEPLDD.js";import{Q as f}from"./suspense-DrdLZRhw.js";import{F as c}from"./FilterForm-D6_u-1kl.js";import{F as g}from"./rpc-story.fixtures-B0ncXtxp.js";import"./preload-helper-CcRYDqr-.js";import"./useQuery-BQZrvx0C.js";import"./button-DaO-3A-f.js";import"./utils-DW-IJACk.js";import"./index-CPURVhFy.js";import"./loading-CqVpLPQc.js";import"./FilterBar-Duc5RSNU.js";import"./floating-ui.react-BcxH6J4B.js";import"./index-BTij907j.js";import"./index-De58Dh1Z.js";import"./FilterPill-CUDEkpMK.js";import"./Icon-pN7oW891.js";import"./Combobox-BgwtTUVx.js";import"./modalStack-SZlRUvIz.js";import"./zIndex-BGbNBNA8.js";import"./json-schema-form-size-E77C3uZS.js";import"./timestamp-format-DJzkpO9P.js";import"./Modal-WyKeqA_t.js";import"./DateTimePicker-BRXVyUZU.js";import"./MultiSelect-Cc2T2Q1u.js";import"./RangeSlider-Bs_sDnk3.js";import"./TimeRange-C3YD_HrU.js";import"./select-wT9TD80T.js";import"./WorkloadPicker-C7BiXjIm.js";import"./NamespacePicker-BJLFjBZT.js";import"./index-Db5hPqrJ.js";import"./formMetadata-8-DYvVK1.js";import"./data-table-filter-values-BjWgdAnO.js";const{fn:y}=__STORYBOOK_MODULE_TEST__,h=[{name:"q",in:"query",schema:{type:"string"},description:"Search query"},{name:"kind",in:"query",schema:{type:"string",enum:["big","small"]},description:"Widget kind"},{name:"limit",in:"query",schema:{type:"integer",default:50},description:"Max rows"}];function S(i){const u=l.useMemo(()=>new d({defaultOptions:{queries:{retry:!1,gcTime:0}}}),[]);return e.jsx(f,{client:u,children:e.jsx("div",{className:"max-w-md",children:e.jsx(c,{...i})})})}const Z={title:"Clicky-RPC/FilterForm",component:c,parameters:{docs:{description:{component:"Renders an operation's query parameters as a compact filter form (the list-page sidebar of the entity explorer). Supports locked/hidden values, server-side lookup options (via the client) and auto-submit. This story injects a synthetic client."}}},render:i=>e.jsx(S,{...i})},t={args:{client:g,path:"/api/v1/widgets",method:"get",parameters:h,submitLabel:"Apply filters",onSubmit:y()}},r={args:{...t.args,autoSubmit:!0}};var o,s,m;t.parameters={...t.parameters,docs:{...(o=t.parameters)==null?void 0:o.docs,source:{originalSource:`{
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
