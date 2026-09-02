import{j as e,r as l}from"./iframe-D7GyV4pJ.js";import{Q as d}from"./queryClient-D28N7CIZ.js";import{Q as f}from"./suspense-CcPLgE_a.js";import{F as c}from"./FilterForm-CW2OQQJr.js";import{F as g}from"./rpc-story.fixtures-C3YsgXVH.js";import"./preload-helper-B_Vm21o9.js";import"./useQuery-O9Jt8Szl.js";import"./button-DGCXgUzH.js";import"./utils-DW-IJACk.js";import"./index-CPURVhFy.js";import"./loading-l0OT6FT8.js";import"./FilterBar-M7hkXB8v.js";import"./floating-ui.react-0HlP6Bgn.js";import"./index-vBVdkF1K.js";import"./index-CBRh9JwW.js";import"./FilterPill-BWoIl1NP.js";import"./Icon-CjYo4K-K.js";import"./Combobox-C64Z6EDs.js";import"./modalStack-j79ynlPx.js";import"./zIndex-BGbNBNA8.js";import"./json-schema-form-size-E77C3uZS.js";import"./timestamp-format-CIXhO4AH.js";import"./Modal-DeNB64-i.js";import"./DateTimePicker-Bn9BjCAe.js";import"./MultiSelect-DkyPso9n.js";import"./RangeSlider-D7XowFPM.js";import"./TimeRange-CNngFNbj.js";import"./select-D_lEekK7.js";import"./WorkloadPicker-BMqXJ_A5.js";import"./NamespacePicker-D0FCM0FR.js";import"./index-y8FDIv-9.js";import"./formMetadata-C9HXT4sA.js";import"./data-table-filter-values-BjWgdAnO.js";const{fn:y}=__STORYBOOK_MODULE_TEST__,h=[{name:"q",in:"query",schema:{type:"string"},description:"Search query"},{name:"kind",in:"query",schema:{type:"string",enum:["big","small"]},description:"Widget kind"},{name:"limit",in:"query",schema:{type:"integer",default:50},description:"Max rows"}];function S(i){const u=l.useMemo(()=>new d({defaultOptions:{queries:{retry:!1,gcTime:0}}}),[]);return e.jsx(f,{client:u,children:e.jsx("div",{className:"max-w-md",children:e.jsx(c,{...i})})})}const Z={title:"Clicky-RPC/FilterForm",component:c,parameters:{docs:{description:{component:"Renders an operation's query parameters as a compact filter form (the list-page sidebar of the entity explorer). Supports locked/hidden values, server-side lookup options (via the client) and auto-submit. This story injects a synthetic client."}}},render:i=>e.jsx(S,{...i})},t={args:{client:g,path:"/api/v1/widgets",method:"get",parameters:h,submitLabel:"Apply filters",onSubmit:y()}},r={args:{...t.args,autoSubmit:!0}};var o,s,m;t.parameters={...t.parameters,docs:{...(o=t.parameters)==null?void 0:o.docs,source:{originalSource:`{
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
