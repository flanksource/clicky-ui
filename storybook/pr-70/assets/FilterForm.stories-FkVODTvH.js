import{j as e,r as l}from"./iframe-Cui5-lWu.js";import{Q as d}from"./queryClient-Cksu0eHS.js";import{Q as f}from"./suspense-s9sBhEqN.js";import{F as c}from"./FilterForm-DwFV14wl.js";import{F as g}from"./rpc-story.fixtures-B8ZybSi7.js";import"./preload-helper-C9Uksf5K.js";import"./useQuery-QE0EXqL3.js";import"./button-B1GBh7k-.js";import"./utils-DW-IJACk.js";import"./index-CPURVhFy.js";import"./loading-Dsn8OLUr.js";import"./FilterBar-B9zEEoih.js";import"./floating-ui.react-CERrJHOI.js";import"./index-EXwF3-1q.js";import"./index-Cd5L4RPL.js";import"./FilterPill-sfj4fjir.js";import"./Icon-DK_SiWhj.js";import"./Combobox-HV3zHzde.js";import"./modalStack-BWOZdhrQ.js";import"./zIndex-BGbNBNA8.js";import"./json-schema-form-size-E77C3uZS.js";import"./timestamp-format-CIXhO4AH.js";import"./DateTimePicker-DanjWDsK.js";import"./MultiSelect-Dca93yNo.js";import"./RangeSlider-cDlcNKHZ.js";import"./TimeRange-Qmqi_tJV.js";import"./select-Bnw_woz1.js";import"./WorkloadPicker-D-3ZTc-6.js";import"./NamespacePicker-BVusxqQC.js";import"./index-DqcnNpE3.js";import"./formMetadata-B9GYL8Qy.js";import"./data-table-filter-values-BjWgdAnO.js";const{fn:y}=__STORYBOOK_MODULE_TEST__,h=[{name:"q",in:"query",schema:{type:"string"},description:"Search query"},{name:"kind",in:"query",schema:{type:"string",enum:["big","small"]},description:"Widget kind"},{name:"limit",in:"query",schema:{type:"integer",default:50},description:"Max rows"}];function S(i){const u=l.useMemo(()=>new d({defaultOptions:{queries:{retry:!1,gcTime:0}}}),[]);return e.jsx(f,{client:u,children:e.jsx("div",{className:"max-w-md",children:e.jsx(c,{...i})})})}const X={title:"Clicky-RPC/FilterForm",component:c,parameters:{docs:{description:{component:"Renders an operation's query parameters as a compact filter form (the list-page sidebar of the entity explorer). Supports locked/hidden values, server-side lookup options (via the client) and auto-submit. This story injects a synthetic client."}}},render:i=>e.jsx(S,{...i})},t={args:{client:g,path:"/api/v1/widgets",method:"get",parameters:h,submitLabel:"Apply filters",onSubmit:y()}},r={args:{...t.args,autoSubmit:!0}};var o,s,m;t.parameters={...t.parameters,docs:{...(o=t.parameters)==null?void 0:o.docs,source:{originalSource:`{
  args: {
    client: FAKE_CLIENT,
    path: "/api/v1/widgets",
    method: "get",
    parameters: PARAMETERS,
    submitLabel: "Apply filters",
    onSubmit: fn()
  }
}`,...(m=(s=t.parameters)==null?void 0:s.docs)==null?void 0:m.source}}};var a,n,p;r.parameters={...r.parameters,docs:{...(a=r.parameters)==null?void 0:a.docs,source:{originalSource:`{
  args: {
    ...Default.args,
    autoSubmit: true
  }
}`,...(p=(n=r.parameters)==null?void 0:n.docs)==null?void 0:p.source}}};const Z=["Default","AutoSubmit"];export{r as AutoSubmit,t as Default,Z as __namedExportsOrder,X as default};
