import{j as s}from"./iframe-D67R8bbl.js";import{R as n}from"./Reasoning-C2zAAhwf.js";import"./preload-helper-DOqJbnTS.js";import"./utils-CR52uffu.js";import"./Icon-00lqZtC6.js";const m="The user wants the pods in the default namespace. I'll call listPods with namespace=default, then summarize the names and count in the answer.",f={title:"Chat/Reasoning",component:n,tags:["autodocs"],parameters:{docs:{description:{component:'A collapsible block showing the model\'s reasoning ("thinking") trace, kept out of the way of the answer. Collapsed by default; renders nothing when `text` is empty.'}}},argTypes:{defaultOpen:{control:"boolean"}},args:{text:m,defaultOpen:!1}},e={render:r=>s.jsx("div",{className:"max-w-2xl",children:s.jsx(n,{...r})})},a={args:{defaultOpen:!0},render:r=>s.jsx("div",{className:"max-w-2xl",children:s.jsx(n,{...r})})};var t,o,d;e.parameters={...e.parameters,docs:{...(t=e.parameters)==null?void 0:t.docs,source:{originalSource:`{
  render: args => <div className="max-w-2xl">
      <Reasoning {...args} />
    </div>
}`,...(d=(o=e.parameters)==null?void 0:o.docs)==null?void 0:d.source}}};var l,i,c;a.parameters={...a.parameters,docs:{...(l=a.parameters)==null?void 0:l.docs,source:{originalSource:`{
  args: {
    defaultOpen: true
  },
  render: args => <div className="max-w-2xl">
      <Reasoning {...args} />
    </div>
}`,...(c=(i=a.parameters)==null?void 0:i.docs)==null?void 0:c.source}}};const w=["Collapsed","Expanded"];export{e as Collapsed,a as Expanded,w as __namedExportsOrder,f as default};
