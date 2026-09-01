import{j as e,r as l}from"./iframe-CNG2zCjB.js";import{Q as d}from"./queryClient-BkHG9wCF.js";import{Q as f}from"./suspense-DPanNIjz.js";import{F as c}from"./FilterForm-Cf8CgN2B.js";import{F as g}from"./rpc-story.fixtures-kuW6Wqfk.js";import"./preload-helper-Dy2teTf6.js";import"./useQuery-BY7353JW.js";import"./button-CZ-gv9rN.js";import"./utils-DW-IJACk.js";import"./index-CPURVhFy.js";import"./loading-DC-8TGYt.js";import"./FilterBar-HmXIoju5.js";import"./floating-ui.react-DrmKW2um.js";import"./index-59KQ2cX2.js";import"./index-7WZkUODE.js";import"./FilterPill-Dn47F8iw.js";import"./Icon-BBALXVqj.js";import"./Combobox-DOn8_5aU.js";import"./modalStack-DGtA3y-v.js";import"./zIndex-BGbNBNA8.js";import"./json-schema-form-size-E77C3uZS.js";import"./timestamp-format-CIXhO4AH.js";import"./DateTimePicker-CZc_0ceA.js";import"./MultiSelect-DgncBLgQ.js";import"./RangeSlider-B4_d-otG.js";import"./TimeRange-444tVzJk.js";import"./select-D7LCQN6n.js";import"./WorkloadPicker-EFH6lSHv.js";import"./NamespacePicker-NX8PbPxf.js";import"./index-aDDnMnJi.js";import"./formMetadata-BGHBRrD9.js";import"./data-table-filter-values-BjWgdAnO.js";const{fn:y}=__STORYBOOK_MODULE_TEST__,h=[{name:"q",in:"query",schema:{type:"string"},description:"Search query"},{name:"kind",in:"query",schema:{type:"string",enum:["big","small"]},description:"Widget kind"},{name:"limit",in:"query",schema:{type:"integer",default:50},description:"Max rows"}];function S(i){const u=l.useMemo(()=>new d({defaultOptions:{queries:{retry:!1,gcTime:0}}}),[]);return e.jsx(f,{client:u,children:e.jsx("div",{className:"max-w-md",children:e.jsx(c,{...i})})})}const X={title:"Clicky-RPC/FilterForm",component:c,parameters:{docs:{description:{component:"Renders an operation's query parameters as a compact filter form (the list-page sidebar of the entity explorer). Supports locked/hidden values, server-side lookup options (via the client) and auto-submit. This story injects a synthetic client."}}},render:i=>e.jsx(S,{...i})},t={args:{client:g,path:"/api/v1/widgets",method:"get",parameters:h,submitLabel:"Apply filters",onSubmit:y()}},r={args:{...t.args,autoSubmit:!0}};var o,s,m;t.parameters={...t.parameters,docs:{...(o=t.parameters)==null?void 0:o.docs,source:{originalSource:`{
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
