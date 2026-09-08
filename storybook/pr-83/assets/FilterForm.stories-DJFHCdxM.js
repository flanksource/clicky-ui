import{j as e,r as l}from"./iframe-D7AEzmiZ.js";import{Q as d}from"./queryClient-DHEN_YvS.js";import{Q as f}from"./suspense-TEhGRCRW.js";import{F as c}from"./FilterForm-C4WRgxqX.js";import{F as g}from"./rpc-story.fixtures-DZtK2kfL.js";import"./preload-helper-hq9vNfsk.js";import"./useQuery-CuCo4T3y.js";import"./button-qcdX8b7r.js";import"./utils-DW-IJACk.js";import"./index-CPURVhFy.js";import"./loading-Cul39Clz.js";import"./FilterBar-D6eH6yZ-.js";import"./floating-ui.react-r1UfLjHW.js";import"./index-DOqUsOzE.js";import"./index-ChecR3Pf.js";import"./FilterPill-D4gg9Vsw.js";import"./Icon-BHlfVGs3.js";import"./Combobox-D00TCDOF.js";import"./modalStack-BBzzK_XK.js";import"./zIndex-BGbNBNA8.js";import"./json-schema-form-size-E77C3uZS.js";import"./timestamp-format-DJzkpO9P.js";import"./Modal-D4dCfCM0.js";import"./DateTimePicker-DDhBpBxg.js";import"./MultiSelect-BqAvyQ3l.js";import"./RangeSlider-BpPWQdDn.js";import"./TimeRange-5vV1xcid.js";import"./select-DzFjSwKH.js";import"./WorkloadPicker-BQqkWkl4.js";import"./NamespacePicker-DsgYgv7u.js";import"./index-BfV7-unC.js";import"./formMetadata-BFtDF-bn.js";import"./data-table-filter-values-BjWgdAnO.js";const{fn:y}=__STORYBOOK_MODULE_TEST__,h=[{name:"q",in:"query",schema:{type:"string"},description:"Search query"},{name:"kind",in:"query",schema:{type:"string",enum:["big","small"]},description:"Widget kind"},{name:"limit",in:"query",schema:{type:"integer",default:50},description:"Max rows"}];function S(i){const u=l.useMemo(()=>new d({defaultOptions:{queries:{retry:!1,gcTime:0}}}),[]);return e.jsx(f,{client:u,children:e.jsx("div",{className:"max-w-md",children:e.jsx(c,{...i})})})}const Z={title:"Clicky-RPC/FilterForm",component:c,parameters:{docs:{description:{component:"Renders an operation's query parameters as a compact filter form (the list-page sidebar of the entity explorer). Supports locked/hidden values, server-side lookup options (via the client) and auto-submit. This story injects a synthetic client."}}},render:i=>e.jsx(S,{...i})},t={args:{client:g,path:"/api/v1/widgets",method:"get",parameters:h,submitLabel:"Apply filters",onSubmit:y()}},r={args:{...t.args,autoSubmit:!0}};var o,s,m;t.parameters={...t.parameters,docs:{...(o=t.parameters)==null?void 0:o.docs,source:{originalSource:`{
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
