import{j as e,r as l}from"./iframe-DgmZMBKH.js";import{Q as d}from"./queryClient-CKjncHPv.js";import{Q as f}from"./suspense-V3Rb4fN9.js";import{F as c}from"./FilterForm-ojM__cDC.js";import{F as g}from"./rpc-story.fixtures-BrPuWVSP.js";import"./preload-helper-BBRSUrHX.js";import"./useQuery-ClGI9Z0B.js";import"./button-D2u3DN_P.js";import"./utils-DW-IJACk.js";import"./index-CPURVhFy.js";import"./loading-DyPnp4V1.js";import"./FilterBar-CiW2zgXq.js";import"./floating-ui.react-C3ET48Mi.js";import"./index-Cgx2wwAK.js";import"./index-DAaBVM8v.js";import"./FilterPill-BT8q1R31.js";import"./Icon-COMQMXZj.js";import"./filter-bar-multi-Bq0a6khQ.js";import"./Combobox-BPdyRRYK.js";import"./modalStack-DVmi-TW5.js";import"./zIndex-BGbNBNA8.js";import"./json-schema-form-size-E77C3uZS.js";import"./timestamp-format-DJzkpO9P.js";import"./Modal-CHXTJS63.js";import"./DateTimePicker-O9lN17EE.js";import"./MultiSelect-D80CYoeK.js";import"./RangeSlider-Dxbvtwh2.js";import"./TimeRange-D56Kt8WY.js";import"./select-Dxhm9jtK.js";import"./WorkloadPicker-p6PpGnQi.js";import"./NamespacePicker-DrrQVfeY.js";import"./index-BU-kuIbr.js";import"./formMetadata-Br0VNyH5.js";import"./data-table-filter-values-BoCQDwQ9.js";import"./duration-BuesBvhN.js";const{fn:y}=__STORYBOOK_MODULE_TEST__,h=[{name:"q",in:"query",schema:{type:"string"},description:"Search query"},{name:"kind",in:"query",schema:{type:"string",enum:["big","small"]},description:"Widget kind"},{name:"limit",in:"query",schema:{type:"integer",default:50},description:"Max rows"}];function S(i){const u=l.useMemo(()=>new d({defaultOptions:{queries:{retry:!1,gcTime:0}}}),[]);return e.jsx(f,{client:u,children:e.jsx("div",{className:"max-w-md",children:e.jsx(c,{...i})})})}const tt={title:"Clicky-RPC/FilterForm",component:c,parameters:{docs:{description:{component:"Renders an operation's query parameters as a compact filter form (the list-page sidebar of the entity explorer). Supports locked/hidden values, server-side lookup options (via the client) and auto-submit. This story injects a synthetic client."}}},render:i=>e.jsx(S,{...i})},t={args:{client:g,path:"/api/v1/widgets",method:"get",parameters:h,submitLabel:"Apply filters",onSubmit:y()}},r={args:{...t.args,autoSubmit:!0}};var o,s,m;t.parameters={...t.parameters,docs:{...(o=t.parameters)==null?void 0:o.docs,source:{originalSource:`{
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
