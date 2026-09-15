import{j as e,r as l}from"./iframe-9fOldjr2.js";import{Q as d}from"./queryClient-DTo9rMUm.js";import{Q as f}from"./suspense-BORGsMKf.js";import{F as c}from"./FilterForm-dVdkfcgB.js";import{F as g}from"./rpc-story.fixtures-C9FpsJ-b.js";import"./preload-helper-CcRYDqr-.js";import"./useQuery-CJ6kUDNs.js";import"./button-DHo1DwEi.js";import"./utils-DW-IJACk.js";import"./index-CPURVhFy.js";import"./loading-CEI-SvW7.js";import"./FilterBar-C3h1BYM5.js";import"./floating-ui.react-CNbHq_-f.js";import"./index-C34MHfKY.js";import"./index-Bi8EVZEl.js";import"./FilterPill-CHM0Kb7W.js";import"./Icon-BkUgp3wm.js";import"./Combobox-Cdlj5MHl.js";import"./modalStack-C6PZaG8M.js";import"./zIndex-BGbNBNA8.js";import"./json-schema-form-size-E77C3uZS.js";import"./timestamp-format-DJzkpO9P.js";import"./Modal-DUXQNAPs.js";import"./DateTimePicker-BzPCAMNs.js";import"./MultiSelect-BUfYPvta.js";import"./RangeSlider-gX8ppj-P.js";import"./TimeRange-M3RpSG5G.js";import"./select-Wy56f_jX.js";import"./WorkloadPicker-BNvFs__t.js";import"./NamespacePicker-BTHp2RPE.js";import"./index-DPG4NjsX.js";import"./formMetadata-DXUrmcIH.js";import"./data-table-filter-values-BjWgdAnO.js";const{fn:y}=__STORYBOOK_MODULE_TEST__,h=[{name:"q",in:"query",schema:{type:"string"},description:"Search query"},{name:"kind",in:"query",schema:{type:"string",enum:["big","small"]},description:"Widget kind"},{name:"limit",in:"query",schema:{type:"integer",default:50},description:"Max rows"}];function S(i){const u=l.useMemo(()=>new d({defaultOptions:{queries:{retry:!1,gcTime:0}}}),[]);return e.jsx(f,{client:u,children:e.jsx("div",{className:"max-w-md",children:e.jsx(c,{...i})})})}const Z={title:"Clicky-RPC/FilterForm",component:c,parameters:{docs:{description:{component:"Renders an operation's query parameters as a compact filter form (the list-page sidebar of the entity explorer). Supports locked/hidden values, server-side lookup options (via the client) and auto-submit. This story injects a synthetic client."}}},render:i=>e.jsx(S,{...i})},t={args:{client:g,path:"/api/v1/widgets",method:"get",parameters:h,submitLabel:"Apply filters",onSubmit:y()}},r={args:{...t.args,autoSubmit:!0}};var o,s,m;t.parameters={...t.parameters,docs:{...(o=t.parameters)==null?void 0:o.docs,source:{originalSource:`{
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
