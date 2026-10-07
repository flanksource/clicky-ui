import{j as e,r as l}from"./iframe-DrKsS3M_.js";import{Q as d}from"./queryClient-D7Tldrxf.js";import{Q as f}from"./suspense-BbxoaRfr.js";import{F as c}from"./FilterForm-DeLrSMYa.js";import{F as g}from"./rpc-story.fixtures-CCx_sU75.js";import"./preload-helper-CLP1olNy.js";import"./useQuery-CZ2xLKcL.js";import"./button-C3u2SMij.js";import"./utils-DW-IJACk.js";import"./index-CPURVhFy.js";import"./loading-Zh7pc3Pa.js";import"./FilterBar-CYPIRBf7.js";import"./floating-ui.react-BaraekBC.js";import"./index-B7F1fGYx.js";import"./index-kSQoS_dD.js";import"./FilterPill-ffMsgFpu.js";import"./Icon-5YnqmjaE.js";import"./Combobox-BOBKHCDA.js";import"./modalStack-BXNp3ooX.js";import"./zIndex-BGbNBNA8.js";import"./json-schema-form-size-E77C3uZS.js";import"./timestamp-format-DJzkpO9P.js";import"./Modal-D-bTTK8j.js";import"./DateTimePicker-CAOmef3v.js";import"./MultiSelect-C6WkU-2I.js";import"./RangeSlider-BRFzD7SU.js";import"./TimeRange-CnG90otP.js";import"./select-BsRobnSb.js";import"./WorkloadPicker-DAf8hPAI.js";import"./NamespacePicker-Cva3-Knl.js";import"./index-Bj-SsGaM.js";import"./formMetadata-CLNzbBlD.js";import"./data-table-filter-values-BoCQDwQ9.js";import"./duration-BuesBvhN.js";const{fn:y}=__STORYBOOK_MODULE_TEST__,h=[{name:"q",in:"query",schema:{type:"string"},description:"Search query"},{name:"kind",in:"query",schema:{type:"string",enum:["big","small"]},description:"Widget kind"},{name:"limit",in:"query",schema:{type:"integer",default:50},description:"Max rows"}];function S(i){const u=l.useMemo(()=>new d({defaultOptions:{queries:{retry:!1,gcTime:0}}}),[]);return e.jsx(f,{client:u,children:e.jsx("div",{className:"max-w-md",children:e.jsx(c,{...i})})})}const $={title:"Clicky-RPC/FilterForm",component:c,parameters:{docs:{description:{component:"Renders an operation's query parameters as a compact filter form (the list-page sidebar of the entity explorer). Supports locked/hidden values, server-side lookup options (via the client) and auto-submit. This story injects a synthetic client."}}},render:i=>e.jsx(S,{...i})},t={args:{client:g,path:"/api/v1/widgets",method:"get",parameters:h,submitLabel:"Apply filters",onSubmit:y()}},r={args:{...t.args,autoSubmit:!0}};var o,s,m;t.parameters={...t.parameters,docs:{...(o=t.parameters)==null?void 0:o.docs,source:{originalSource:`{
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
