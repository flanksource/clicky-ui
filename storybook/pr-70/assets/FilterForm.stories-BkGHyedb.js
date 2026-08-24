import{j as e,r as l}from"./iframe-CrD5m2_8.js";import{Q as d}from"./queryClient-6cI7ofQB.js";import{Q as f}from"./suspense-4rh80laa.js";import{F as c}from"./FilterForm-B8jz4ubH.js";import{F as g}from"./rpc-story.fixtures-DyyUfK--.js";import"./preload-helper-C9Uksf5K.js";import"./useQuery-DVuYFBhL.js";import"./button-KKR3itPP.js";import"./utils-DW-IJACk.js";import"./index-CPURVhFy.js";import"./loading-Czeqb770.js";import"./FilterBar-ColiWGHi.js";import"./floating-ui.react-CP7HTaTu.js";import"./index-oGxvMW6m.js";import"./index-BJrxtn44.js";import"./FilterPill-B9M6udAn.js";import"./Icon-BTfkw-8h.js";import"./Combobox-kceivp8R.js";import"./modalStack-DuaGAyy0.js";import"./zIndex-BGbNBNA8.js";import"./json-schema-form-size-E77C3uZS.js";import"./timestamp-format-CIXhO4AH.js";import"./DateTimePicker-CLtlKQIR.js";import"./MultiSelect-CS-_mmVi.js";import"./RangeSlider-DmYc5Dvi.js";import"./TimeRange-llyFu8Yj.js";import"./select-uQCbSidz.js";import"./WorkloadPicker-BpYXZ4B8.js";import"./NamespacePicker-BqHZ_WXk.js";import"./index-DsV-XxBU.js";import"./formMetadata-CW70M6H2.js";import"./data-table-filter-values-BjWgdAnO.js";const{fn:y}=__STORYBOOK_MODULE_TEST__,h=[{name:"q",in:"query",schema:{type:"string"},description:"Search query"},{name:"kind",in:"query",schema:{type:"string",enum:["big","small"]},description:"Widget kind"},{name:"limit",in:"query",schema:{type:"integer",default:50},description:"Max rows"}];function S(i){const u=l.useMemo(()=>new d({defaultOptions:{queries:{retry:!1,gcTime:0}}}),[]);return e.jsx(f,{client:u,children:e.jsx("div",{className:"max-w-md",children:e.jsx(c,{...i})})})}const X={title:"Clicky-RPC/FilterForm",component:c,parameters:{docs:{description:{component:"Renders an operation's query parameters as a compact filter form (the list-page sidebar of the entity explorer). Supports locked/hidden values, server-side lookup options (via the client) and auto-submit. This story injects a synthetic client."}}},render:i=>e.jsx(S,{...i})},t={args:{client:g,path:"/api/v1/widgets",method:"get",parameters:h,submitLabel:"Apply filters",onSubmit:y()}},r={args:{...t.args,autoSubmit:!0}};var o,s,m;t.parameters={...t.parameters,docs:{...(o=t.parameters)==null?void 0:o.docs,source:{originalSource:`{
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
