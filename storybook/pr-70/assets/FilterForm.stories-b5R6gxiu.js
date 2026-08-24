import{j as e,r as l}from"./iframe-CiHj_drq.js";import{Q as d}from"./queryClient-DwOJ7SpZ.js";import{Q as f}from"./suspense-3w3a1LEC.js";import{F as c}from"./FilterForm-CUyV2ayM.js";import{F as g}from"./rpc-story.fixtures-3zZ43tDt.js";import"./preload-helper-C9Uksf5K.js";import"./useQuery-C_mp4XbG.js";import"./button-CF8Oad92.js";import"./utils-DW-IJACk.js";import"./index-CPURVhFy.js";import"./loading-CvQxXIfs.js";import"./FilterBar-DGHJFTaL.js";import"./floating-ui.react-CdsFUqBP.js";import"./index-D-c_5Z52.js";import"./index-BTP8oBdU.js";import"./FilterPill-Cd01icRX.js";import"./Icon-B8CHvJLE.js";import"./Combobox-BeG22V1s.js";import"./modalStack-BxawZIg3.js";import"./zIndex-BGbNBNA8.js";import"./json-schema-form-size-E77C3uZS.js";import"./timestamp-format-CIXhO4AH.js";import"./DateTimePicker-BLABB2Ii.js";import"./MultiSelect-bpx4mBh0.js";import"./RangeSlider-Cyidobpc.js";import"./TimeRange-KTlWidEX.js";import"./select-BS0Fe7RG.js";import"./WorkloadPicker-CyS_JrPw.js";import"./NamespacePicker-XKgMl5_i.js";import"./index-JYe4JoQ1.js";import"./formMetadata-CGf803wG.js";import"./data-table-filter-values-BjWgdAnO.js";const{fn:y}=__STORYBOOK_MODULE_TEST__,h=[{name:"q",in:"query",schema:{type:"string"},description:"Search query"},{name:"kind",in:"query",schema:{type:"string",enum:["big","small"]},description:"Widget kind"},{name:"limit",in:"query",schema:{type:"integer",default:50},description:"Max rows"}];function S(i){const u=l.useMemo(()=>new d({defaultOptions:{queries:{retry:!1,gcTime:0}}}),[]);return e.jsx(f,{client:u,children:e.jsx("div",{className:"max-w-md",children:e.jsx(c,{...i})})})}const X={title:"Clicky-RPC/FilterForm",component:c,parameters:{docs:{description:{component:"Renders an operation's query parameters as a compact filter form (the list-page sidebar of the entity explorer). Supports locked/hidden values, server-side lookup options (via the client) and auto-submit. This story injects a synthetic client."}}},render:i=>e.jsx(S,{...i})},t={args:{client:g,path:"/api/v1/widgets",method:"get",parameters:h,submitLabel:"Apply filters",onSubmit:y()}},r={args:{...t.args,autoSubmit:!0}};var o,s,m;t.parameters={...t.parameters,docs:{...(o=t.parameters)==null?void 0:o.docs,source:{originalSource:`{
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
