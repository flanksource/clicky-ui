import{j as e,r as l}from"./iframe-CmyXO54k.js";import{Q as d}from"./queryClient-B2Xv_EHK.js";import{Q as f}from"./suspense-BOS34ZdN.js";import{F as c}from"./FilterForm-D8UwS8Z2.js";import{F as g}from"./rpc-story.fixtures-C1AFjt5r.js";import"./preload-helper-CrzHa85r.js";import"./useQuery-BPPYtObm.js";import"./button-FnyWyL3m.js";import"./utils-DW-IJACk.js";import"./index-CPURVhFy.js";import"./loading-DtL9kt7i.js";import"./FilterBar-CR3SYMoz.js";import"./floating-ui.react-DYdEGXOX.js";import"./index-93oggNQY.js";import"./index-CZqGiS_m.js";import"./FilterPill-BwfzPWF4.js";import"./Icon-Cn5Qjct9.js";import"./Combobox-BaA3oC34.js";import"./modalStack-BYsPhtu4.js";import"./zIndex-BGbNBNA8.js";import"./json-schema-form-size-E77C3uZS.js";import"./timestamp-format-CIXhO4AH.js";import"./DateTimePicker-CQH9V_hE.js";import"./MultiSelect-DbRXyI3L.js";import"./RangeSlider-DMwlpwrM.js";import"./TimeRange-B0wkt0iH.js";import"./select-CV4LZDDf.js";import"./WorkloadPicker-CnCrR_XI.js";import"./NamespacePicker-DByGFZpM.js";import"./index-BLrjPNKr.js";import"./formMetadata-Do1EDjnJ.js";import"./data-table-filter-values-BjWgdAnO.js";const{fn:y}=__STORYBOOK_MODULE_TEST__,h=[{name:"q",in:"query",schema:{type:"string"},description:"Search query"},{name:"kind",in:"query",schema:{type:"string",enum:["big","small"]},description:"Widget kind"},{name:"limit",in:"query",schema:{type:"integer",default:50},description:"Max rows"}];function S(i){const u=l.useMemo(()=>new d({defaultOptions:{queries:{retry:!1,gcTime:0}}}),[]);return e.jsx(f,{client:u,children:e.jsx("div",{className:"max-w-md",children:e.jsx(c,{...i})})})}const X={title:"Clicky-RPC/FilterForm",component:c,parameters:{docs:{description:{component:"Renders an operation's query parameters as a compact filter form (the list-page sidebar of the entity explorer). Supports locked/hidden values, server-side lookup options (via the client) and auto-submit. This story injects a synthetic client."}}},render:i=>e.jsx(S,{...i})},t={args:{client:g,path:"/api/v1/widgets",method:"get",parameters:h,submitLabel:"Apply filters",onSubmit:y()}},r={args:{...t.args,autoSubmit:!0}};var o,s,m;t.parameters={...t.parameters,docs:{...(o=t.parameters)==null?void 0:o.docs,source:{originalSource:`{
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
