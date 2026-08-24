import{j as e,r as l}from"./iframe-BOpLb2SL.js";import{Q as d}from"./queryClient-D1KqxkWp.js";import{Q as f}from"./suspense-B7ManpSc.js";import{F as c}from"./FilterForm-DAZg2Scm.js";import{F as g}from"./rpc-story.fixtures-kM0p9uWL.js";import"./preload-helper-C9Uksf5K.js";import"./useQuery-p7b_bHRX.js";import"./button-B63egKN7.js";import"./utils-DW-IJACk.js";import"./index-CPURVhFy.js";import"./loading-B_5rDg5X.js";import"./FilterBar-CTITlHUD.js";import"./floating-ui.react-CEIFBjso.js";import"./index-2QoJ5Ixm.js";import"./index-DJ8M53Md.js";import"./FilterPill-DypisSu-.js";import"./Icon-JZhp7A68.js";import"./Combobox-WFb9_XG1.js";import"./modalStack-DTgESsZL.js";import"./zIndex-BGbNBNA8.js";import"./json-schema-form-size-E77C3uZS.js";import"./timestamp-format-CIXhO4AH.js";import"./DateTimePicker-DfjU_MJ1.js";import"./MultiSelect-C45QveeV.js";import"./RangeSlider-DePijQRX.js";import"./TimeRange-QbneOTb6.js";import"./select-CZmFcWWM.js";import"./WorkloadPicker-D31cF_LD.js";import"./NamespacePicker-Bosw-rjb.js";import"./index-AYjp6We2.js";import"./formMetadata-DR5GY7B_.js";import"./data-table-filter-values-BjWgdAnO.js";const{fn:y}=__STORYBOOK_MODULE_TEST__,h=[{name:"q",in:"query",schema:{type:"string"},description:"Search query"},{name:"kind",in:"query",schema:{type:"string",enum:["big","small"]},description:"Widget kind"},{name:"limit",in:"query",schema:{type:"integer",default:50},description:"Max rows"}];function S(i){const u=l.useMemo(()=>new d({defaultOptions:{queries:{retry:!1,gcTime:0}}}),[]);return e.jsx(f,{client:u,children:e.jsx("div",{className:"max-w-md",children:e.jsx(c,{...i})})})}const X={title:"Clicky-RPC/FilterForm",component:c,parameters:{docs:{description:{component:"Renders an operation's query parameters as a compact filter form (the list-page sidebar of the entity explorer). Supports locked/hidden values, server-side lookup options (via the client) and auto-submit. This story injects a synthetic client."}}},render:i=>e.jsx(S,{...i})},t={args:{client:g,path:"/api/v1/widgets",method:"get",parameters:h,submitLabel:"Apply filters",onSubmit:y()}},r={args:{...t.args,autoSubmit:!0}};var o,s,m;t.parameters={...t.parameters,docs:{...(o=t.parameters)==null?void 0:o.docs,source:{originalSource:`{
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
