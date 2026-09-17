import{j as e,r as l}from"./iframe-k78te_Hj.js";import{Q as d}from"./queryClient-tVbUJ5BZ.js";import{Q as f}from"./suspense-DskWbggu.js";import{F as c}from"./FilterForm-ggLpxfrb.js";import{F as g}from"./rpc-story.fixtures-C4OUboFs.js";import"./preload-helper-CcRYDqr-.js";import"./useQuery-ypyrQXqE.js";import"./button-DOHlwBT1.js";import"./utils-DW-IJACk.js";import"./index-CPURVhFy.js";import"./loading-J2lUy0bP.js";import"./FilterBar-X4FVmHKq.js";import"./floating-ui.react-CBq0PPGN.js";import"./index-BT2sJ_Ky.js";import"./index-BYV-uwhj.js";import"./FilterPill-Bm-1wg7m.js";import"./Icon-BxFpjwAC.js";import"./Combobox-81j1jr0e.js";import"./modalStack-gX0DzNXp.js";import"./zIndex-BGbNBNA8.js";import"./json-schema-form-size-E77C3uZS.js";import"./timestamp-format-DJzkpO9P.js";import"./Modal-C9UBUNoB.js";import"./DateTimePicker-EQnd0KSf.js";import"./MultiSelect-BgJflaJt.js";import"./RangeSlider-Cc0mKcGR.js";import"./TimeRange-CMd5DcgS.js";import"./select-Dhvd8eXB.js";import"./WorkloadPicker-CgkPF1a_.js";import"./NamespacePicker-SNF8kyXp.js";import"./index-D1FPM4Jg.js";import"./formMetadata-D3Fy5TC6.js";import"./data-table-filter-values-CSqhQ9CN.js";const{fn:y}=__STORYBOOK_MODULE_TEST__,h=[{name:"q",in:"query",schema:{type:"string"},description:"Search query"},{name:"kind",in:"query",schema:{type:"string",enum:["big","small"]},description:"Widget kind"},{name:"limit",in:"query",schema:{type:"integer",default:50},description:"Max rows"}];function S(i){const u=l.useMemo(()=>new d({defaultOptions:{queries:{retry:!1,gcTime:0}}}),[]);return e.jsx(f,{client:u,children:e.jsx("div",{className:"max-w-md",children:e.jsx(c,{...i})})})}const Z={title:"Clicky-RPC/FilterForm",component:c,parameters:{docs:{description:{component:"Renders an operation's query parameters as a compact filter form (the list-page sidebar of the entity explorer). Supports locked/hidden values, server-side lookup options (via the client) and auto-submit. This story injects a synthetic client."}}},render:i=>e.jsx(S,{...i})},t={args:{client:g,path:"/api/v1/widgets",method:"get",parameters:h,submitLabel:"Apply filters",onSubmit:y()}},r={args:{...t.args,autoSubmit:!0}};var o,s,m;t.parameters={...t.parameters,docs:{...(o=t.parameters)==null?void 0:o.docs,source:{originalSource:`{
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
