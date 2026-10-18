import{j as e,r as l}from"./iframe-CKgGkAV6.js";import{Q as d}from"./queryClient-Br5BOrR2.js";import{Q as f}from"./suspense-D4mDBeM9.js";import{F as c}from"./FilterForm-CmvhooX2.js";import{F as g}from"./rpc-story.fixtures-C9wgYSgH.js";import"./preload-helper-D6IOlyYr.js";import"./useQuery-NNRuaWcR.js";import"./button-mYaiNNVw.js";import"./utils-DW-IJACk.js";import"./index-CPURVhFy.js";import"./loading-CVVM6inm.js";import"./FilterBar-DpLc6Jkd.js";import"./floating-ui.react-DvrmiGRg.js";import"./index-B8WCVke5.js";import"./index-B-AXG8c2.js";import"./FilterPill-CvKT4WAZ.js";import"./Icon-zT9BHEU_.js";import"./filter-bar-multi-Dt__OFRf.js";import"./Combobox-Ce8evdZR.js";import"./modalStack-TnERC9Dk.js";import"./zIndex-BGbNBNA8.js";import"./json-schema-form-size-E77C3uZS.js";import"./timestamp-format-DJzkpO9P.js";import"./Modal-CyMxnyK7.js";import"./DateTimePicker-BbQkUMe4.js";import"./MultiSelect-C-Y1qLAG.js";import"./RangeSlider-BaY40EZu.js";import"./TimeRange-j9ZOOMTL.js";import"./select-eS4vf-VP.js";import"./WorkloadPicker-BWVZwiTh.js";import"./NamespacePicker-BlJZooVo.js";import"./index-UgZ8RgH0.js";import"./formMetadata-DLreaQgB.js";import"./data-table-filter-values-BoCQDwQ9.js";import"./duration-BuesBvhN.js";const{fn:y}=__STORYBOOK_MODULE_TEST__,h=[{name:"q",in:"query",schema:{type:"string"},description:"Search query"},{name:"kind",in:"query",schema:{type:"string",enum:["big","small"]},description:"Widget kind"},{name:"limit",in:"query",schema:{type:"integer",default:50},description:"Max rows"}];function S(i){const u=l.useMemo(()=>new d({defaultOptions:{queries:{retry:!1,gcTime:0}}}),[]);return e.jsx(f,{client:u,children:e.jsx("div",{className:"max-w-md",children:e.jsx(c,{...i})})})}const tt={title:"Clicky-RPC/FilterForm",component:c,parameters:{docs:{description:{component:"Renders an operation's query parameters as a compact filter form (the list-page sidebar of the entity explorer). Supports locked/hidden values, server-side lookup options (via the client) and auto-submit. This story injects a synthetic client."}}},render:i=>e.jsx(S,{...i})},t={args:{client:g,path:"/api/v1/widgets",method:"get",parameters:h,submitLabel:"Apply filters",onSubmit:y()}},r={args:{...t.args,autoSubmit:!0}};var o,s,m;t.parameters={...t.parameters,docs:{...(o=t.parameters)==null?void 0:o.docs,source:{originalSource:`{
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
}`,...(n=(p=r.parameters)==null?void 0:p.docs)==null?void 0:n.source}}};const rt=["Default","AutoSubmit"];export{r as AutoSubmit,t as Default,rt as __namedExportsOrder,tt as default};
