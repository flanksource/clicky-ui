import{j as e,r as l}from"./iframe-9kVTKmJ0.js";import{Q as d}from"./queryClient-BjzZNByS.js";import{Q as f}from"./suspense-Dukvb27Z.js";import{F as c}from"./FilterForm-CqhhJ8OF.js";import{F as g}from"./rpc-story.fixtures-lLoUYDUC.js";import"./preload-helper-95TtevsV.js";import"./useQuery-BJZS2b_G.js";import"./button-BPQ9SyIv.js";import"./utils-DW-IJACk.js";import"./index-CPURVhFy.js";import"./loading-MkmNbgtg.js";import"./FilterBar-CXhcWigS.js";import"./floating-ui.react-BUMPLM4a.js";import"./index-Cr37FOZC.js";import"./index-BTeDEC8L.js";import"./FilterPill-DQt4CJ8q.js";import"./Icon-CvI4mGjv.js";import"./Combobox-D7J1PGfl.js";import"./modalStack-CNqfYGm3.js";import"./zIndex-BGbNBNA8.js";import"./json-schema-form-size-E77C3uZS.js";import"./timestamp-format-CIXhO4AH.js";import"./DateTimePicker-BbOmlTv2.js";import"./MultiSelect-CSjhdo7W.js";import"./RangeSlider-ClpMy-rf.js";import"./TimeRange-M6wT7L0F.js";import"./select-DuAtkH3m.js";import"./WorkloadPicker-DlkRC9Xa.js";import"./NamespacePicker-D8blYim1.js";import"./index-CX2ajmSK.js";import"./formMetadata-43fCqczO.js";import"./data-table-filter-values-BjWgdAnO.js";const{fn:y}=__STORYBOOK_MODULE_TEST__,h=[{name:"q",in:"query",schema:{type:"string"},description:"Search query"},{name:"kind",in:"query",schema:{type:"string",enum:["big","small"]},description:"Widget kind"},{name:"limit",in:"query",schema:{type:"integer",default:50},description:"Max rows"}];function S(i){const u=l.useMemo(()=>new d({defaultOptions:{queries:{retry:!1,gcTime:0}}}),[]);return e.jsx(f,{client:u,children:e.jsx("div",{className:"max-w-md",children:e.jsx(c,{...i})})})}const X={title:"Clicky-RPC/FilterForm",component:c,parameters:{docs:{description:{component:"Renders an operation's query parameters as a compact filter form (the list-page sidebar of the entity explorer). Supports locked/hidden values, server-side lookup options (via the client) and auto-submit. This story injects a synthetic client."}}},render:i=>e.jsx(S,{...i})},t={args:{client:g,path:"/api/v1/widgets",method:"get",parameters:h,submitLabel:"Apply filters",onSubmit:y()}},r={args:{...t.args,autoSubmit:!0}};var o,s,m;t.parameters={...t.parameters,docs:{...(o=t.parameters)==null?void 0:o.docs,source:{originalSource:`{
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
