import{j as r,r as l}from"./iframe-DiVtfPK2.js";import{Q as d}from"./queryClient-CZbVF_4o.js";import{Q as f}from"./suspense-BLFyOtB0.js";import{F as c}from"./FilterForm-DGeOZarV.js";import{F as g}from"./rpc-story.fixtures-DqET-aaz.js";import"./preload-helper-BHaa9cja.js";import"./useQuery-DgxYXok0.js";import"./button-DQujlY7L.js";import"./utils-DW-IJACk.js";import"./index-CPURVhFy.js";import"./loading-DDAQP9UA.js";import"./Combobox-DOKJeV5v.js";import"./Icon-NtM811xi.js";import"./modalStack-bLrEb3vK.js";import"./zIndex-BGbNBNA8.js";import"./json-schema-form-size-E77C3uZS.js";import"./FilterPill-CLZSJksL.js";import"./index-S0SA--oV.js";import"./index-Cv07EZkj.js";import"./TimeRange-D85Kepw2.js";import"./floating-ui.react-sYWlUL6v.js";import"./select-BWijJE8K.js";import"./formMetadata-DTAGMC8P.js";import"./data-table-filter-values-BjWgdAnO.js";import"./types-BHfRQr8X.js";const{fn:y}=__STORYBOOK_MODULE_TEST__,h=[{name:"q",in:"query",schema:{type:"string"},description:"Search query"},{name:"kind",in:"query",schema:{type:"string",enum:["big","small"]},description:"Widget kind"},{name:"limit",in:"query",schema:{type:"integer",default:50},description:"Max rows"}];function S(i){const u=l.useMemo(()=>new d({defaultOptions:{queries:{retry:!1,gcTime:0}}}),[]);return r.jsx(f,{client:u,children:r.jsx("div",{className:"max-w-md",children:r.jsx(c,{...i})})})}const W={title:"Clicky-RPC/FilterForm",component:c,parameters:{docs:{description:{component:"Renders an operation's query parameters as a compact filter form (the list-page sidebar of the entity explorer). Supports locked/hidden values, server-side lookup options (via the client) and auto-submit. This story injects a synthetic client."}}},render:i=>r.jsx(S,{...i})},e={args:{client:g,path:"/api/v1/widgets",method:"get",parameters:h,submitLabel:"Apply filters",onSubmit:y()}},t={args:{...e.args,autoSubmit:!0}};var o,s,a;e.parameters={...e.parameters,docs:{...(o=e.parameters)==null?void 0:o.docs,source:{originalSource:`{
  args: {
    client: FAKE_CLIENT,
    path: "/api/v1/widgets",
    method: "get",
    parameters: PARAMETERS,
    submitLabel: "Apply filters",
    onSubmit: fn()
  }
}`,...(a=(s=e.parameters)==null?void 0:s.docs)==null?void 0:a.source}}};var m,n,p;t.parameters={...t.parameters,docs:{...(m=t.parameters)==null?void 0:m.docs,source:{originalSource:`{
  args: {
    ...Default.args,
    autoSubmit: true
  }
}`,...(p=(n=t.parameters)==null?void 0:n.docs)==null?void 0:p.source}}};const Y=["Default","AutoSubmit"];export{t as AutoSubmit,e as Default,Y as __namedExportsOrder,W as default};
