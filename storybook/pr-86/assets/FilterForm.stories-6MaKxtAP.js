import{j as e,r as l}from"./iframe-Cvtq5r5o.js";import{Q as d}from"./queryClient-C_3tmXS4.js";import{Q as f}from"./suspense-CbGELY4z.js";import{F as c}from"./FilterForm-CjSbRj13.js";import{F as g}from"./rpc-story.fixtures-tbnPiE0-.js";import"./preload-helper-CcRYDqr-.js";import"./useQuery-qVWjwK3e.js";import"./button-D_f9KbYW.js";import"./utils-DW-IJACk.js";import"./index-CPURVhFy.js";import"./loading-DKOjjMZb.js";import"./FilterBar-CYMayfG9.js";import"./floating-ui.react-Cvq7eJTv.js";import"./index-ClajA7XS.js";import"./index-kUH0lmcJ.js";import"./FilterPill-CiLj5-dG.js";import"./Icon-AK-L3art.js";import"./Combobox-DmcYmCM1.js";import"./modalStack-Br6WXpFW.js";import"./zIndex-BGbNBNA8.js";import"./json-schema-form-size-E77C3uZS.js";import"./timestamp-format-DJzkpO9P.js";import"./Modal-B2iT9EIZ.js";import"./DateTimePicker-OpVNRO9P.js";import"./MultiSelect-DcdrjFJ7.js";import"./RangeSlider-CjNa1mqr.js";import"./TimeRange-2UMh_tst.js";import"./select-Dj5LQxng.js";import"./WorkloadPicker-B6PIQp81.js";import"./NamespacePicker-BqHwlbCZ.js";import"./index-CEHxgROo.js";import"./formMetadata-DmPYmLcw.js";import"./data-table-filter-values-B85q5-NK.js";const{fn:y}=__STORYBOOK_MODULE_TEST__,h=[{name:"q",in:"query",schema:{type:"string"},description:"Search query"},{name:"kind",in:"query",schema:{type:"string",enum:["big","small"]},description:"Widget kind"},{name:"limit",in:"query",schema:{type:"integer",default:50},description:"Max rows"}];function S(i){const u=l.useMemo(()=>new d({defaultOptions:{queries:{retry:!1,gcTime:0}}}),[]);return e.jsx(f,{client:u,children:e.jsx("div",{className:"max-w-md",children:e.jsx(c,{...i})})})}const Z={title:"Clicky-RPC/FilterForm",component:c,parameters:{docs:{description:{component:"Renders an operation's query parameters as a compact filter form (the list-page sidebar of the entity explorer). Supports locked/hidden values, server-side lookup options (via the client) and auto-submit. This story injects a synthetic client."}}},render:i=>e.jsx(S,{...i})},t={args:{client:g,path:"/api/v1/widgets",method:"get",parameters:h,submitLabel:"Apply filters",onSubmit:y()}},r={args:{...t.args,autoSubmit:!0}};var o,s,m;t.parameters={...t.parameters,docs:{...(o=t.parameters)==null?void 0:o.docs,source:{originalSource:`{
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
