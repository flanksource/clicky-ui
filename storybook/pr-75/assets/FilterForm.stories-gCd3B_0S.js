import{j as e,r as l}from"./iframe-RmXz6z0S.js";import{Q as d}from"./queryClient-CgiikRyB.js";import{Q as f}from"./suspense-BrXEkBH0.js";import{F as c}from"./FilterForm-CIuA_8pT.js";import{F as g}from"./rpc-story.fixtures-m8IsWbES.js";import"./preload-helper-CoNDIDFR.js";import"./useQuery-CyBPWMcD.js";import"./button-CGTHhixy.js";import"./utils-DW-IJACk.js";import"./index-CPURVhFy.js";import"./loading-BitfFYjk.js";import"./FilterBar-Kw-e-6Qi.js";import"./floating-ui.react-CS_5YbfH.js";import"./index-Dcplh2pp.js";import"./index-B9HoHPg8.js";import"./FilterPill-Ck-4zSqW.js";import"./Icon-C5PBASJ5.js";import"./Combobox-BiiHI8Uh.js";import"./modalStack-BrOZVbb2.js";import"./zIndex-BGbNBNA8.js";import"./json-schema-form-size-E77C3uZS.js";import"./timestamp-format-CIXhO4AH.js";import"./Modal-BFAiABMN.js";import"./DateTimePicker-BhiY2EDa.js";import"./MultiSelect-DFvo3-rs.js";import"./RangeSlider-DSuzfLyY.js";import"./TimeRange-DHR2eMeN.js";import"./select-Cy4bIbtK.js";import"./WorkloadPicker-CivJOvty.js";import"./NamespacePicker-DOFzT_QR.js";import"./index-WgtKURfM.js";import"./formMetadata-DDk4bXH3.js";import"./data-table-filter-values-BjWgdAnO.js";const{fn:y}=__STORYBOOK_MODULE_TEST__,h=[{name:"q",in:"query",schema:{type:"string"},description:"Search query"},{name:"kind",in:"query",schema:{type:"string",enum:["big","small"]},description:"Widget kind"},{name:"limit",in:"query",schema:{type:"integer",default:50},description:"Max rows"}];function S(i){const u=l.useMemo(()=>new d({defaultOptions:{queries:{retry:!1,gcTime:0}}}),[]);return e.jsx(f,{client:u,children:e.jsx("div",{className:"max-w-md",children:e.jsx(c,{...i})})})}const Z={title:"Clicky-RPC/FilterForm",component:c,parameters:{docs:{description:{component:"Renders an operation's query parameters as a compact filter form (the list-page sidebar of the entity explorer). Supports locked/hidden values, server-side lookup options (via the client) and auto-submit. This story injects a synthetic client."}}},render:i=>e.jsx(S,{...i})},t={args:{client:g,path:"/api/v1/widgets",method:"get",parameters:h,submitLabel:"Apply filters",onSubmit:y()}},r={args:{...t.args,autoSubmit:!0}};var o,s,m;t.parameters={...t.parameters,docs:{...(o=t.parameters)==null?void 0:o.docs,source:{originalSource:`{
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
