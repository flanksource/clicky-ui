import{j as s}from"./iframe-C5-Xigqm.js";import{R as n}from"./Reasoning-B5e8u1z5.js";import"./preload-helper-BZuLNX-z.js";import"./utils-BLSKlp9E.js";import"./Icon-B_F1F--U.js";import"./UiBrain-Dav4OZbU.js";import"./UiChevronDown-Ds2LfhvZ.js";const p="The user wants the pods in the default namespace. I'll call listPods with namespace=default, then summarize the names and count in the answer.",j={title:"Chat/Reasoning",component:n,tags:["autodocs"],parameters:{docs:{description:{component:'A collapsible block showing the model\'s reasoning ("thinking") trace, kept out of the way of the answer. Collapsed by default; renders nothing when `text` is empty.'}}},argTypes:{defaultOpen:{control:"boolean"}},args:{text:p,defaultOpen:!1}},e={render:r=>s.jsx("div",{className:"max-w-2xl",children:s.jsx(n,{...r})})},a={args:{defaultOpen:!0},render:r=>s.jsx("div",{className:"max-w-2xl",children:s.jsx(n,{...r})})};var t,o,d;e.parameters={...e.parameters,docs:{...(t=e.parameters)==null?void 0:t.docs,source:{originalSource:`{
  render: args => <div className="max-w-2xl">
      <Reasoning {...args} />
    </div>
}`,...(d=(o=e.parameters)==null?void 0:o.docs)==null?void 0:d.source}}};var l,i,m;a.parameters={...a.parameters,docs:{...(l=a.parameters)==null?void 0:l.docs,source:{originalSource:`{
  args: {
    defaultOpen: true
  },
  render: args => <div className="max-w-2xl">
      <Reasoning {...args} />
    </div>
}`,...(m=(i=a.parameters)==null?void 0:i.docs)==null?void 0:m.source}}};const v=["Collapsed","Expanded"];export{e as Collapsed,a as Expanded,v as __namedExportsOrder,j as default};
