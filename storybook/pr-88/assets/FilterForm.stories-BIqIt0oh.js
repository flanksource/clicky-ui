import{j as e,r as l}from"./iframe-DjmnUs_s.js";import{Q as d}from"./queryClient-WWMP9yZo.js";import{Q as f}from"./suspense-Dj5pR5v4.js";import{F as c}from"./FilterForm-cVz6UVoh.js";import{F as g}from"./rpc-story.fixtures-DwPqESFe.js";import"./preload-helper-BlVIKJwt.js";import"./useQuery-CK5G_QNO.js";import"./button-DfMIapuu.js";import"./utils-DW-IJACk.js";import"./index-CPURVhFy.js";import"./loading-jlJ4TQvy.js";import"./FilterBar-Ch27q_Qp.js";import"./floating-ui.react-DWJ6pxmL.js";import"./index-DsmV4W2z.js";import"./index-CouXz6mu.js";import"./FilterPill--WlUWj89.js";import"./Icon-CWJyCkxy.js";import"./Combobox-FRHPTizX.js";import"./modalStack-Bqy7OkQU.js";import"./zIndex-BGbNBNA8.js";import"./json-schema-form-size-E77C3uZS.js";import"./timestamp-format-DJzkpO9P.js";import"./Modal-DJ5NvytA.js";import"./DateTimePicker-9a9vmkUi.js";import"./MultiSelect-DFFpOHWp.js";import"./RangeSlider-nwtIr3gw.js";import"./TimeRange-tYWtzpEp.js";import"./select-BmbPgT_c.js";import"./WorkloadPicker-ChqqGMOn.js";import"./NamespacePicker-CPEwYjOg.js";import"./index-BGRDfamw.js";import"./formMetadata-DVrz3p05.js";import"./data-table-filter-values-BoCQDwQ9.js";import"./duration-BuesBvhN.js";const{fn:y}=__STORYBOOK_MODULE_TEST__,h=[{name:"q",in:"query",schema:{type:"string"},description:"Search query"},{name:"kind",in:"query",schema:{type:"string",enum:["big","small"]},description:"Widget kind"},{name:"limit",in:"query",schema:{type:"integer",default:50},description:"Max rows"}];function S(i){const u=l.useMemo(()=>new d({defaultOptions:{queries:{retry:!1,gcTime:0}}}),[]);return e.jsx(f,{client:u,children:e.jsx("div",{className:"max-w-md",children:e.jsx(c,{...i})})})}const $={title:"Clicky-RPC/FilterForm",component:c,parameters:{docs:{description:{component:"Renders an operation's query parameters as a compact filter form (the list-page sidebar of the entity explorer). Supports locked/hidden values, server-side lookup options (via the client) and auto-submit. This story injects a synthetic client."}}},render:i=>e.jsx(S,{...i})},t={args:{client:g,path:"/api/v1/widgets",method:"get",parameters:h,submitLabel:"Apply filters",onSubmit:y()}},r={args:{...t.args,autoSubmit:!0}};var o,s,m;t.parameters={...t.parameters,docs:{...(o=t.parameters)==null?void 0:o.docs,source:{originalSource:`{
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
