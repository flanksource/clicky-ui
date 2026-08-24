import{j as e,r as l}from"./iframe-1nhP4pBA.js";import{Q as d}from"./queryClient-Drs06rU2.js";import{Q as f}from"./suspense-DBlaIW4n.js";import{F as c}from"./FilterForm-E9UcUJoo.js";import{F as g}from"./rpc-story.fixtures-CAED4tIQ.js";import"./preload-helper-C9Uksf5K.js";import"./useQuery-Bch4MnZl.js";import"./button--4D2VPD7.js";import"./utils-DW-IJACk.js";import"./index-CPURVhFy.js";import"./loading-Ch-5BGAb.js";import"./FilterBar-C_3aF3TU.js";import"./floating-ui.react-BFwwEc5i.js";import"./index-BSiZIXYH.js";import"./index-XDodYxLy.js";import"./FilterPill-CXYMNTt5.js";import"./Icon-B2d9yic_.js";import"./Combobox-BCbQu6RQ.js";import"./modalStack-DxHx75M7.js";import"./zIndex-BGbNBNA8.js";import"./json-schema-form-size-E77C3uZS.js";import"./timestamp-format-CIXhO4AH.js";import"./DateTimePicker-D-pa_he-.js";import"./MultiSelect-B50Px8dh.js";import"./RangeSlider-4m86cNh6.js";import"./TimeRange-D-87v7d_.js";import"./select-B2pQvorm.js";import"./WorkloadPicker-bAN7wney.js";import"./NamespacePicker-Brgo_DSM.js";import"./index-BVDmj5Ga.js";import"./formMetadata-C5xWBaoU.js";import"./data-table-filter-values-BjWgdAnO.js";const{fn:y}=__STORYBOOK_MODULE_TEST__,h=[{name:"q",in:"query",schema:{type:"string"},description:"Search query"},{name:"kind",in:"query",schema:{type:"string",enum:["big","small"]},description:"Widget kind"},{name:"limit",in:"query",schema:{type:"integer",default:50},description:"Max rows"}];function S(i){const u=l.useMemo(()=>new d({defaultOptions:{queries:{retry:!1,gcTime:0}}}),[]);return e.jsx(f,{client:u,children:e.jsx("div",{className:"max-w-md",children:e.jsx(c,{...i})})})}const X={title:"Clicky-RPC/FilterForm",component:c,parameters:{docs:{description:{component:"Renders an operation's query parameters as a compact filter form (the list-page sidebar of the entity explorer). Supports locked/hidden values, server-side lookup options (via the client) and auto-submit. This story injects a synthetic client."}}},render:i=>e.jsx(S,{...i})},t={args:{client:g,path:"/api/v1/widgets",method:"get",parameters:h,submitLabel:"Apply filters",onSubmit:y()}},r={args:{...t.args,autoSubmit:!0}};var o,s,m;t.parameters={...t.parameters,docs:{...(o=t.parameters)==null?void 0:o.docs,source:{originalSource:`{
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
