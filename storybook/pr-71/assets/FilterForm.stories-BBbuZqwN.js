import{j as e,r as l}from"./iframe-CIC35eeX.js";import{Q as d}from"./queryClient-Dlhl3_zo.js";import{Q as f}from"./suspense-JoMc3dmy.js";import{F as c}from"./FilterForm-C0vf8Of9.js";import{F as g}from"./rpc-story.fixtures-CwPZzz-p.js";import"./preload-helper-CrzHa85r.js";import"./useQuery-C_yjEjoY.js";import"./button-jrxQ6vwL.js";import"./utils-DW-IJACk.js";import"./index-CPURVhFy.js";import"./loading-nBEUV0ex.js";import"./FilterBar-BDMNzfC5.js";import"./floating-ui.react-B-Amc-L4.js";import"./index-DwO5TgZY.js";import"./index-C6gbLGVc.js";import"./FilterPill-DKv4DvZD.js";import"./Icon-BApSHLDT.js";import"./Combobox-l6NoX43q.js";import"./modalStack-CfG6hB1c.js";import"./zIndex-BGbNBNA8.js";import"./json-schema-form-size-E77C3uZS.js";import"./timestamp-format-CIXhO4AH.js";import"./DateTimePicker-DDs3I4g0.js";import"./MultiSelect-CsY2Ffa8.js";import"./RangeSlider-r13dYiUP.js";import"./TimeRange-B-elXoE0.js";import"./select-BwS4L93K.js";import"./WorkloadPicker-F9bLsS7a.js";import"./NamespacePicker-DItY5PNm.js";import"./index-Dwoe35I0.js";import"./formMetadata-BpkrjKBY.js";import"./data-table-filter-values-BjWgdAnO.js";const{fn:y}=__STORYBOOK_MODULE_TEST__,h=[{name:"q",in:"query",schema:{type:"string"},description:"Search query"},{name:"kind",in:"query",schema:{type:"string",enum:["big","small"]},description:"Widget kind"},{name:"limit",in:"query",schema:{type:"integer",default:50},description:"Max rows"}];function S(i){const u=l.useMemo(()=>new d({defaultOptions:{queries:{retry:!1,gcTime:0}}}),[]);return e.jsx(f,{client:u,children:e.jsx("div",{className:"max-w-md",children:e.jsx(c,{...i})})})}const X={title:"Clicky-RPC/FilterForm",component:c,parameters:{docs:{description:{component:"Renders an operation's query parameters as a compact filter form (the list-page sidebar of the entity explorer). Supports locked/hidden values, server-side lookup options (via the client) and auto-submit. This story injects a synthetic client."}}},render:i=>e.jsx(S,{...i})},t={args:{client:g,path:"/api/v1/widgets",method:"get",parameters:h,submitLabel:"Apply filters",onSubmit:y()}},r={args:{...t.args,autoSubmit:!0}};var o,s,m;t.parameters={...t.parameters,docs:{...(o=t.parameters)==null?void 0:o.docs,source:{originalSource:`{
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
