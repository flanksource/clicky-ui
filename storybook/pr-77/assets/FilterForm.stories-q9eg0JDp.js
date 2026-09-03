import{j as e,r as l}from"./iframe-CiA63uuc.js";import{Q as d}from"./queryClient-BmAv53Yf.js";import{Q as f}from"./suspense-DbNuRuet.js";import{F as c}from"./FilterForm-CSFezSd5.js";import{F as g}from"./rpc-story.fixtures-DChmLaqx.js";import"./preload-helper-DqldIB3Q.js";import"./useQuery-BaHYQtxz.js";import"./button-ppGJePHl.js";import"./utils-DW-IJACk.js";import"./index-CPURVhFy.js";import"./loading-X8NYIprp.js";import"./FilterBar-C4LglIFa.js";import"./floating-ui.react-BzcB7PEn.js";import"./index-BzPaU3HF.js";import"./index-CDCKIc0i.js";import"./FilterPill-2pMT1Pki.js";import"./Icon-ChAy_Zq6.js";import"./Combobox-C-Pmuu7J.js";import"./modalStack-B1ctHZfJ.js";import"./zIndex-BGbNBNA8.js";import"./json-schema-form-size-E77C3uZS.js";import"./timestamp-format-CIXhO4AH.js";import"./Modal-BWkFQvgr.js";import"./DateTimePicker-MwGYzabr.js";import"./MultiSelect-BEb4QcU1.js";import"./RangeSlider-BF5vIFTr.js";import"./TimeRange-CVxt8508.js";import"./select-SOFw-W8N.js";import"./WorkloadPicker-KNnpqbtg.js";import"./NamespacePicker-CPYiebHw.js";import"./index-CZSejjdY.js";import"./formMetadata-CG1ONdQs.js";import"./data-table-filter-values-BjWgdAnO.js";const{fn:y}=__STORYBOOK_MODULE_TEST__,h=[{name:"q",in:"query",schema:{type:"string"},description:"Search query"},{name:"kind",in:"query",schema:{type:"string",enum:["big","small"]},description:"Widget kind"},{name:"limit",in:"query",schema:{type:"integer",default:50},description:"Max rows"}];function S(i){const u=l.useMemo(()=>new d({defaultOptions:{queries:{retry:!1,gcTime:0}}}),[]);return e.jsx(f,{client:u,children:e.jsx("div",{className:"max-w-md",children:e.jsx(c,{...i})})})}const Z={title:"Clicky-RPC/FilterForm",component:c,parameters:{docs:{description:{component:"Renders an operation's query parameters as a compact filter form (the list-page sidebar of the entity explorer). Supports locked/hidden values, server-side lookup options (via the client) and auto-submit. This story injects a synthetic client."}}},render:i=>e.jsx(S,{...i})},t={args:{client:g,path:"/api/v1/widgets",method:"get",parameters:h,submitLabel:"Apply filters",onSubmit:y()}},r={args:{...t.args,autoSubmit:!0}};var o,s,m;t.parameters={...t.parameters,docs:{...(o=t.parameters)==null?void 0:o.docs,source:{originalSource:`{
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
