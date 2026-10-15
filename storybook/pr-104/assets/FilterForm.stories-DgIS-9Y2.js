import{j as e,r as l}from"./iframe-BpsZ2AnK.js";import{Q as d}from"./queryClient-SrqSI2W3.js";import{Q as f}from"./suspense-C72y7OJM.js";import{F as c}from"./FilterForm-DK6OCTJc.js";import{F as g}from"./rpc-story.fixtures-CEMbMmXM.js";import"./preload-helper-MsDOuF3K.js";import"./useQuery-C8UHSaRz.js";import"./button-Zee-1TPK.js";import"./utils-DW-IJACk.js";import"./index-CPURVhFy.js";import"./loading-Ds2q6m_u.js";import"./FilterBar-DTePjmny.js";import"./floating-ui.react-B4WvYE6p.js";import"./index-LhoKR5ZD.js";import"./index-DBpM0zUQ.js";import"./FilterPill-D1QT-mQn.js";import"./Icon-nPi6h081.js";import"./filter-bar-multi-CZ5GAuNj.js";import"./Combobox-C062J8HP.js";import"./modalStack-CrzPtMDv.js";import"./zIndex-BGbNBNA8.js";import"./json-schema-form-size-E77C3uZS.js";import"./timestamp-format-DJzkpO9P.js";import"./Modal--V1JkUP_.js";import"./DateTimePicker-DXF5Age6.js";import"./MultiSelect-GZgKEjD2.js";import"./RangeSlider-9quJMnq0.js";import"./TimeRange-DaklAFvp.js";import"./select-DmfR8ats.js";import"./WorkloadPicker-KCxpU1_j.js";import"./NamespacePicker-BgJ3RleN.js";import"./index-CwCz_U_4.js";import"./formMetadata-5-a_DJn3.js";import"./data-table-filter-values-BoCQDwQ9.js";import"./duration-BuesBvhN.js";const{fn:y}=__STORYBOOK_MODULE_TEST__,h=[{name:"q",in:"query",schema:{type:"string"},description:"Search query"},{name:"kind",in:"query",schema:{type:"string",enum:["big","small"]},description:"Widget kind"},{name:"limit",in:"query",schema:{type:"integer",default:50},description:"Max rows"}];function S(i){const u=l.useMemo(()=>new d({defaultOptions:{queries:{retry:!1,gcTime:0}}}),[]);return e.jsx(f,{client:u,children:e.jsx("div",{className:"max-w-md",children:e.jsx(c,{...i})})})}const tt={title:"Clicky-RPC/FilterForm",component:c,parameters:{docs:{description:{component:"Renders an operation's query parameters as a compact filter form (the list-page sidebar of the entity explorer). Supports locked/hidden values, server-side lookup options (via the client) and auto-submit. This story injects a synthetic client."}}},render:i=>e.jsx(S,{...i})},t={args:{client:g,path:"/api/v1/widgets",method:"get",parameters:h,submitLabel:"Apply filters",onSubmit:y()}},r={args:{...t.args,autoSubmit:!0}};var o,s,m;t.parameters={...t.parameters,docs:{...(o=t.parameters)==null?void 0:o.docs,source:{originalSource:`{
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
}`,...(n=(p=r.parameters)==null?void 0:p.docs)==null?void 0:n.source}}};const rt=["Default","AutoSubmit"];export{r as AutoSubmit,t as Default,rt as __namedExportsOrder,tt as default};
