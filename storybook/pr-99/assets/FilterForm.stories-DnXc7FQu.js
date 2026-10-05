import{j as e,r as l}from"./iframe-3PyLJ2TM.js";import{Q as d}from"./queryClient-eOF60azq.js";import{Q as f}from"./suspense-9OLRUhuM.js";import{F as c}from"./FilterForm-_Y54yLBK.js";import{F as g}from"./rpc-story.fixtures-QpoukFtv.js";import"./preload-helper-BCNcasCO.js";import"./useQuery-B1_8JvOS.js";import"./button-DwXbKSmw.js";import"./utils-DW-IJACk.js";import"./index-CPURVhFy.js";import"./loading-CSw9PWsW.js";import"./FilterBar-CGMDl5Kc.js";import"./floating-ui.react-oWH__shU.js";import"./index-CgLXIHcd.js";import"./index-qqzrnE86.js";import"./FilterPill-DJ0u6M-E.js";import"./Icon-BZD3ke3N.js";import"./Combobox-CtwV8HwY.js";import"./modalStack-D5gAHSM-.js";import"./zIndex-BGbNBNA8.js";import"./json-schema-form-size-E77C3uZS.js";import"./timestamp-format-DJzkpO9P.js";import"./Modal-CgHCFO42.js";import"./DateTimePicker-DtCJk5nd.js";import"./MultiSelect-D2uoJyN5.js";import"./RangeSlider-p2RrywI1.js";import"./TimeRange-CC9JpUD4.js";import"./select-CW6JcOqk.js";import"./WorkloadPicker-BlU1fYBE.js";import"./NamespacePicker-CuUvd8m2.js";import"./index-CBigCKQU.js";import"./formMetadata-CRTrx6G0.js";import"./data-table-filter-values-BoCQDwQ9.js";import"./duration-BuesBvhN.js";const{fn:y}=__STORYBOOK_MODULE_TEST__,h=[{name:"q",in:"query",schema:{type:"string"},description:"Search query"},{name:"kind",in:"query",schema:{type:"string",enum:["big","small"]},description:"Widget kind"},{name:"limit",in:"query",schema:{type:"integer",default:50},description:"Max rows"}];function S(i){const u=l.useMemo(()=>new d({defaultOptions:{queries:{retry:!1,gcTime:0}}}),[]);return e.jsx(f,{client:u,children:e.jsx("div",{className:"max-w-md",children:e.jsx(c,{...i})})})}const $={title:"Clicky-RPC/FilterForm",component:c,parameters:{docs:{description:{component:"Renders an operation's query parameters as a compact filter form (the list-page sidebar of the entity explorer). Supports locked/hidden values, server-side lookup options (via the client) and auto-submit. This story injects a synthetic client."}}},render:i=>e.jsx(S,{...i})},t={args:{client:g,path:"/api/v1/widgets",method:"get",parameters:h,submitLabel:"Apply filters",onSubmit:y()}},r={args:{...t.args,autoSubmit:!0}};var o,s,m;t.parameters={...t.parameters,docs:{...(o=t.parameters)==null?void 0:o.docs,source:{originalSource:`{
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
