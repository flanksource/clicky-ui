import{j as e,r as l}from"./iframe-Cco5TqZn.js";import{Q as d}from"./queryClient-wsiT9jxi.js";import{Q as f}from"./suspense-BDHMT-c8.js";import{F as c}from"./FilterForm-C8Ix4e5_.js";import{F as g}from"./rpc-story.fixtures-DrorMC2Z.js";import"./preload-helper-CW1BdeJu.js";import"./useQuery-Cw-7fZrp.js";import"./button-DNj3-z2W.js";import"./utils-DW-IJACk.js";import"./index-CPURVhFy.js";import"./loading-CtZM3MTb.js";import"./FilterBar-DVdHLQod.js";import"./floating-ui.react-Dpy7yByO.js";import"./index-D2E1Pu38.js";import"./index-BboRCSKy.js";import"./FilterPill-BVle6yuL.js";import"./Icon-C6Dn9DLx.js";import"./Combobox-DPrIRjAr.js";import"./modalStack-ZpK0V3tF.js";import"./zIndex-BGbNBNA8.js";import"./json-schema-form-size-E77C3uZS.js";import"./timestamp-format-CIXhO4AH.js";import"./Modal-BfOLI4vX.js";import"./DateTimePicker-Dy4sFFgJ.js";import"./MultiSelect-CeyhHNCi.js";import"./RangeSlider-Da0vSqmc.js";import"./TimeRange-DlEhKiKb.js";import"./select-DyfR_FV4.js";import"./WorkloadPicker-Y9hi9dEd.js";import"./NamespacePicker-BzzNcGfX.js";import"./index-CBZ8Tip2.js";import"./formMetadata-2inmewgJ.js";import"./data-table-filter-values-BjWgdAnO.js";const{fn:y}=__STORYBOOK_MODULE_TEST__,h=[{name:"q",in:"query",schema:{type:"string"},description:"Search query"},{name:"kind",in:"query",schema:{type:"string",enum:["big","small"]},description:"Widget kind"},{name:"limit",in:"query",schema:{type:"integer",default:50},description:"Max rows"}];function S(i){const u=l.useMemo(()=>new d({defaultOptions:{queries:{retry:!1,gcTime:0}}}),[]);return e.jsx(f,{client:u,children:e.jsx("div",{className:"max-w-md",children:e.jsx(c,{...i})})})}const Z={title:"Clicky-RPC/FilterForm",component:c,parameters:{docs:{description:{component:"Renders an operation's query parameters as a compact filter form (the list-page sidebar of the entity explorer). Supports locked/hidden values, server-side lookup options (via the client) and auto-submit. This story injects a synthetic client."}}},render:i=>e.jsx(S,{...i})},t={args:{client:g,path:"/api/v1/widgets",method:"get",parameters:h,submitLabel:"Apply filters",onSubmit:y()}},r={args:{...t.args,autoSubmit:!0}};var o,s,m;t.parameters={...t.parameters,docs:{...(o=t.parameters)==null?void 0:o.docs,source:{originalSource:`{
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
