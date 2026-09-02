import{j as e,r as l}from"./iframe-BC1SeayG.js";import{Q as d}from"./queryClient-ClwnbC12.js";import{Q as f}from"./suspense-DT5oo41w.js";import{F as c}from"./FilterForm-CY_aWZtM.js";import{F as g}from"./rpc-story.fixtures-BEHSLxaN.js";import"./preload-helper-95TtevsV.js";import"./useQuery-CO-hwqdQ.js";import"./button-BJ4iY5h1.js";import"./utils-DW-IJACk.js";import"./index-CPURVhFy.js";import"./loading-CFMNfL_k.js";import"./FilterBar-BufdYk35.js";import"./floating-ui.react-BZ8r-J5t.js";import"./index-CPwGNz_W.js";import"./index-9O5VV7bp.js";import"./FilterPill-CCg47i6K.js";import"./Icon-CYz8IPcf.js";import"./Combobox-DtdUjmAB.js";import"./modalStack-DoTdEIQR.js";import"./zIndex-BGbNBNA8.js";import"./json-schema-form-size-E77C3uZS.js";import"./timestamp-format-CIXhO4AH.js";import"./Modal-wXbu7MXG.js";import"./DateTimePicker-Diw3tly_.js";import"./MultiSelect-Cmn38Ozv.js";import"./RangeSlider-C5DqVIbQ.js";import"./TimeRange-BsSJj2T6.js";import"./select-DHfmXRwq.js";import"./WorkloadPicker-BFyyo34l.js";import"./NamespacePicker-DqNbZtf4.js";import"./index-B2Xe8pVy.js";import"./formMetadata-D-oVZ4GR.js";import"./data-table-filter-values-BjWgdAnO.js";const{fn:y}=__STORYBOOK_MODULE_TEST__,h=[{name:"q",in:"query",schema:{type:"string"},description:"Search query"},{name:"kind",in:"query",schema:{type:"string",enum:["big","small"]},description:"Widget kind"},{name:"limit",in:"query",schema:{type:"integer",default:50},description:"Max rows"}];function S(i){const u=l.useMemo(()=>new d({defaultOptions:{queries:{retry:!1,gcTime:0}}}),[]);return e.jsx(f,{client:u,children:e.jsx("div",{className:"max-w-md",children:e.jsx(c,{...i})})})}const Z={title:"Clicky-RPC/FilterForm",component:c,parameters:{docs:{description:{component:"Renders an operation's query parameters as a compact filter form (the list-page sidebar of the entity explorer). Supports locked/hidden values, server-side lookup options (via the client) and auto-submit. This story injects a synthetic client."}}},render:i=>e.jsx(S,{...i})},t={args:{client:g,path:"/api/v1/widgets",method:"get",parameters:h,submitLabel:"Apply filters",onSubmit:y()}},r={args:{...t.args,autoSubmit:!0}};var o,s,m;t.parameters={...t.parameters,docs:{...(o=t.parameters)==null?void 0:o.docs,source:{originalSource:`{
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
