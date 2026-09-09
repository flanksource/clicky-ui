import{j as e,r as l}from"./iframe-DdgNogAy.js";import{Q as d}from"./queryClient-0iKH4pMI.js";import{Q as f}from"./suspense-BoA9F3Eq.js";import{F as c}from"./FilterForm-4SBypqLY.js";import{F as g}from"./rpc-story.fixtures-B_-a4pSx.js";import"./preload-helper-BvsCWBK3.js";import"./useQuery-Bl39qcsy.js";import"./button-CzjW30CI.js";import"./utils-DW-IJACk.js";import"./index-CPURVhFy.js";import"./loading-wD2sCDq3.js";import"./FilterBar-0HjtfF4s.js";import"./floating-ui.react-Dbg33d5m.js";import"./index-B6mQjjqS.js";import"./index-Sl_STJ6n.js";import"./FilterPill-D2w9E3G0.js";import"./Icon-Cj3ZeRuU.js";import"./Combobox-B2gvGDu0.js";import"./modalStack-DWC2-Zws.js";import"./zIndex-BGbNBNA8.js";import"./json-schema-form-size-E77C3uZS.js";import"./timestamp-format-DJzkpO9P.js";import"./Modal-3z7NTFVw.js";import"./DateTimePicker-CViqF8Rs.js";import"./MultiSelect-CohJxBry.js";import"./RangeSlider-D_mnb0g4.js";import"./TimeRange-QD_IOVqX.js";import"./select-CowP5aZ9.js";import"./WorkloadPicker-ZfoIus6A.js";import"./NamespacePicker-JZuVXT-A.js";import"./index-Ba8kPy08.js";import"./formMetadata-Ceu0tVcZ.js";import"./data-table-filter-values-BjWgdAnO.js";const{fn:y}=__STORYBOOK_MODULE_TEST__,h=[{name:"q",in:"query",schema:{type:"string"},description:"Search query"},{name:"kind",in:"query",schema:{type:"string",enum:["big","small"]},description:"Widget kind"},{name:"limit",in:"query",schema:{type:"integer",default:50},description:"Max rows"}];function S(i){const u=l.useMemo(()=>new d({defaultOptions:{queries:{retry:!1,gcTime:0}}}),[]);return e.jsx(f,{client:u,children:e.jsx("div",{className:"max-w-md",children:e.jsx(c,{...i})})})}const Z={title:"Clicky-RPC/FilterForm",component:c,parameters:{docs:{description:{component:"Renders an operation's query parameters as a compact filter form (the list-page sidebar of the entity explorer). Supports locked/hidden values, server-side lookup options (via the client) and auto-submit. This story injects a synthetic client."}}},render:i=>e.jsx(S,{...i})},t={args:{client:g,path:"/api/v1/widgets",method:"get",parameters:h,submitLabel:"Apply filters",onSubmit:y()}},r={args:{...t.args,autoSubmit:!0}};var o,s,m;t.parameters={...t.parameters,docs:{...(o=t.parameters)==null?void 0:o.docs,source:{originalSource:`{
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
