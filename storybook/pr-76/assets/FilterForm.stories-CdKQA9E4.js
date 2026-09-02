import{j as e,r as l}from"./iframe-7j6iymLi.js";import{Q as d}from"./queryClient-DCkkB_pQ.js";import{Q as f}from"./suspense-Bh0HMzDu.js";import{F as c}from"./FilterForm-DkeL_g9v.js";import{F as g}from"./rpc-story.fixtures-D5wceM3a.js";import"./preload-helper-I-iSH2ar.js";import"./useQuery-D-Mh9COR.js";import"./button-MYTsFqg6.js";import"./utils-DW-IJACk.js";import"./index-CPURVhFy.js";import"./loading-3vZJBF8-.js";import"./FilterBar-B5GDKp4-.js";import"./floating-ui.react-C0p18HIk.js";import"./index-TxPFcURu.js";import"./index-_iPo7ZOA.js";import"./FilterPill-3tsxv4Ur.js";import"./Icon-0xjlgRqa.js";import"./Combobox-BV-oFzvD.js";import"./modalStack-6YNSsR0j.js";import"./zIndex-BGbNBNA8.js";import"./json-schema-form-size-E77C3uZS.js";import"./timestamp-format-CIXhO4AH.js";import"./Modal-DBrT1dTa.js";import"./DateTimePicker-gPuspeYE.js";import"./MultiSelect-C0WZcQdb.js";import"./RangeSlider-gMn850Zn.js";import"./TimeRange-COUZhaNv.js";import"./select-DaGTT4ps.js";import"./WorkloadPicker-DbYoulg3.js";import"./NamespacePicker-BF9Bdu4v.js";import"./index-CpPL6vYi.js";import"./formMetadata-CLVhI-3c.js";import"./data-table-filter-values-BjWgdAnO.js";const{fn:y}=__STORYBOOK_MODULE_TEST__,h=[{name:"q",in:"query",schema:{type:"string"},description:"Search query"},{name:"kind",in:"query",schema:{type:"string",enum:["big","small"]},description:"Widget kind"},{name:"limit",in:"query",schema:{type:"integer",default:50},description:"Max rows"}];function S(i){const u=l.useMemo(()=>new d({defaultOptions:{queries:{retry:!1,gcTime:0}}}),[]);return e.jsx(f,{client:u,children:e.jsx("div",{className:"max-w-md",children:e.jsx(c,{...i})})})}const Z={title:"Clicky-RPC/FilterForm",component:c,parameters:{docs:{description:{component:"Renders an operation's query parameters as a compact filter form (the list-page sidebar of the entity explorer). Supports locked/hidden values, server-side lookup options (via the client) and auto-submit. This story injects a synthetic client."}}},render:i=>e.jsx(S,{...i})},t={args:{client:g,path:"/api/v1/widgets",method:"get",parameters:h,submitLabel:"Apply filters",onSubmit:y()}},r={args:{...t.args,autoSubmit:!0}};var o,s,m;t.parameters={...t.parameters,docs:{...(o=t.parameters)==null?void 0:o.docs,source:{originalSource:`{
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
