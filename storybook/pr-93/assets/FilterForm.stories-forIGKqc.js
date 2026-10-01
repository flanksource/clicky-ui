import{j as e,r as l}from"./iframe-CNJi-CEN.js";import{Q as d}from"./queryClient-CHiZW0I3.js";import{Q as f}from"./suspense-ojdhTGrQ.js";import{F as c}from"./FilterForm-DxDgA4_X.js";import{F as g}from"./rpc-story.fixtures-DLu1xk-C.js";import"./preload-helper-DmsBQNJi.js";import"./useQuery-BWvPSOBc.js";import"./button-DO1UR7aw.js";import"./utils-DW-IJACk.js";import"./index-CPURVhFy.js";import"./loading-CMRhZ8P1.js";import"./FilterBar-Cz5ZKs0h.js";import"./floating-ui.react-Bzi9C0oq.js";import"./index-C5jqvT-L.js";import"./index-BXovTO2l.js";import"./FilterPill-CAbk9lWN.js";import"./Icon-Bv4kfyO8.js";import"./Combobox-QDnxkUXx.js";import"./modalStack-CMRaiiqk.js";import"./zIndex-BGbNBNA8.js";import"./json-schema-form-size-E77C3uZS.js";import"./timestamp-format-DJzkpO9P.js";import"./Modal-D0weZIS9.js";import"./DateTimePicker-BesfIaOc.js";import"./MultiSelect-CRmFg68w.js";import"./RangeSlider-O3RumkcL.js";import"./TimeRange-Dx90ONOZ.js";import"./select-C6D2hC6T.js";import"./WorkloadPicker-4hu0dNEp.js";import"./NamespacePicker-CCjeQklL.js";import"./index-fGcEWGBL.js";import"./formMetadata-BtisHEtV.js";import"./data-table-filter-values-BoCQDwQ9.js";import"./duration-BuesBvhN.js";const{fn:y}=__STORYBOOK_MODULE_TEST__,h=[{name:"q",in:"query",schema:{type:"string"},description:"Search query"},{name:"kind",in:"query",schema:{type:"string",enum:["big","small"]},description:"Widget kind"},{name:"limit",in:"query",schema:{type:"integer",default:50},description:"Max rows"}];function S(i){const u=l.useMemo(()=>new d({defaultOptions:{queries:{retry:!1,gcTime:0}}}),[]);return e.jsx(f,{client:u,children:e.jsx("div",{className:"max-w-md",children:e.jsx(c,{...i})})})}const $={title:"Clicky-RPC/FilterForm",component:c,parameters:{docs:{description:{component:"Renders an operation's query parameters as a compact filter form (the list-page sidebar of the entity explorer). Supports locked/hidden values, server-side lookup options (via the client) and auto-submit. This story injects a synthetic client."}}},render:i=>e.jsx(S,{...i})},t={args:{client:g,path:"/api/v1/widgets",method:"get",parameters:h,submitLabel:"Apply filters",onSubmit:y()}},r={args:{...t.args,autoSubmit:!0}};var o,s,m;t.parameters={...t.parameters,docs:{...(o=t.parameters)==null?void 0:o.docs,source:{originalSource:`{
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
