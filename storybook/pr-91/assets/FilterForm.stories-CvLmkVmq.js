import{j as e,r as l}from"./iframe-DxH86FBA.js";import{Q as d}from"./queryClient-bxPR4XMB.js";import{Q as f}from"./suspense-Ds0fW1nV.js";import{F as c}from"./FilterForm-BU7FgY94.js";import{F as g}from"./rpc-story.fixtures-PGD5Zdia.js";import"./preload-helper-CwXsRPHT.js";import"./useQuery-ClfnYRUt.js";import"./button-O6d4Fxrc.js";import"./utils-DW-IJACk.js";import"./index-CPURVhFy.js";import"./loading-DCaPMG1Q.js";import"./FilterBar-DvhEU1sY.js";import"./floating-ui.react-DSfQFonv.js";import"./index-L0gHVN2T.js";import"./index-CZl4QIDy.js";import"./FilterPill-Df2C1Mtk.js";import"./Icon-w2YOVKhv.js";import"./Combobox-THEiNRgN.js";import"./modalStack-DuyRP-Gh.js";import"./zIndex-BGbNBNA8.js";import"./json-schema-form-size-E77C3uZS.js";import"./timestamp-format-DJzkpO9P.js";import"./Modal-i45K_l92.js";import"./DateTimePicker-Bohm6PVx.js";import"./MultiSelect-D5Q4hKOt.js";import"./RangeSlider-L3xi1L8_.js";import"./TimeRange-DL8fsPh4.js";import"./select-D5Eidm6d.js";import"./WorkloadPicker-BYkdP8oF.js";import"./NamespacePicker-IG95wyrx.js";import"./index-DWlcCXij.js";import"./formMetadata-Csc6P2gb.js";import"./data-table-filter-values-BoCQDwQ9.js";import"./duration-BuesBvhN.js";const{fn:y}=__STORYBOOK_MODULE_TEST__,h=[{name:"q",in:"query",schema:{type:"string"},description:"Search query"},{name:"kind",in:"query",schema:{type:"string",enum:["big","small"]},description:"Widget kind"},{name:"limit",in:"query",schema:{type:"integer",default:50},description:"Max rows"}];function S(i){const u=l.useMemo(()=>new d({defaultOptions:{queries:{retry:!1,gcTime:0}}}),[]);return e.jsx(f,{client:u,children:e.jsx("div",{className:"max-w-md",children:e.jsx(c,{...i})})})}const $={title:"Clicky-RPC/FilterForm",component:c,parameters:{docs:{description:{component:"Renders an operation's query parameters as a compact filter form (the list-page sidebar of the entity explorer). Supports locked/hidden values, server-side lookup options (via the client) and auto-submit. This story injects a synthetic client."}}},render:i=>e.jsx(S,{...i})},t={args:{client:g,path:"/api/v1/widgets",method:"get",parameters:h,submitLabel:"Apply filters",onSubmit:y()}},r={args:{...t.args,autoSubmit:!0}};var o,s,m;t.parameters={...t.parameters,docs:{...(o=t.parameters)==null?void 0:o.docs,source:{originalSource:`{
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
}`,...(n=(p=r.parameters)==null?void 0:p.docs)==null?void 0:n.source}}};const tt=["Default","AutoSubmit"];export{r as AutoSubmit,t as Default,tt as __namedExportsOrder,$ as default};
