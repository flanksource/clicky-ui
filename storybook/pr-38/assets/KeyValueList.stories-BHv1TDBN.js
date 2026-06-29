import{j as s}from"./iframe-Ck5OBNy_.js";import{K as i}from"./KeyValueList-ByfyBayA.js";import"./preload-helper-C4wV90-x.js";import"./utils-CR52uffu.js";const g={title:"Data/KeyValueList",component:i,tags:["autodocs"],parameters:{docs:{description:{component:"A bordered, divided `<dl>` of label/value rows for compact detail panels. Items marked `hidden` are filtered out; an empty list renders `emptyMessage`. For richer rows with actions use `Properties`."}}},argTypes:{items:{control:!1},emptyMessage:{control:"text"}},args:{items:[{key:"name",label:"Name",value:"payments-api"},{key:"namespace",label:"Namespace",value:"prod"},{key:"image",label:"Image",value:s.jsx("code",{className:"font-mono text-xs",children:"ghcr.io/acme/payments:1.4.2"})},{key:"replicas",label:"Replicas",value:"3 / 3"},{key:"internal",label:"Internal",value:"secret",hidden:!0}]}},e={render:c=>s.jsx("div",{className:"max-w-md",children:s.jsx(i,{...c})})},a={args:{items:[],emptyMessage:"No metadata available"}};var r,t,o;e.parameters={...e.parameters,docs:{...(r=e.parameters)==null?void 0:r.docs,source:{originalSource:`{
  render: args => <div className="max-w-md">
      <KeyValueList {...args} />
    </div>
}`,...(o=(t=e.parameters)==null?void 0:t.docs)==null?void 0:o.source}}};var m,l,n;a.parameters={...a.parameters,docs:{...(m=a.parameters)==null?void 0:m.docs,source:{originalSource:`{
  args: {
    items: [],
    emptyMessage: "No metadata available"
  }
}`,...(n=(l=a.parameters)==null?void 0:l.docs)==null?void 0:n.source}}};const v=["Default","Empty"];export{e as Default,a as Empty,v as __namedExportsOrder,g as default};
