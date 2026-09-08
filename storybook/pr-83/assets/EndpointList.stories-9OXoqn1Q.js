import{j as a}from"./iframe-D7AEzmiZ.js";import{E as s}from"./EndpointList-BCx6U1li.js";import{a as c,W as l,b as g}from"./rpc-story.fixtures-DZtK2kfL.js";import"./preload-helper-hq9vNfsk.js";import"./MethodBadge-AnGQnVY_.js";import"./Badge-Bdn1ojcv.js";import"./utils-DW-IJACk.js";import"./index-CPURVhFy.js";import"./Icon-BHlfVGs3.js";const j={title:"Clicky-RPC/EndpointList",component:s,tags:["autodocs"],parameters:{docs:{description:{component:"Lists a domain's operations as method-badged rows linking to each command page. Router-agnostic: pass `renderLink` (a react-router `Link`, a plain `<a>`, …) and optionally `getCommandHref`. Shows the definition's empty state when there are no operations."}}},argTypes:{operations:{control:!1},renderLink:{control:!1},definition:{control:!1}},args:{operations:g,definition:l,renderLink:c}},r={render:o=>a.jsx("div",{className:"max-w-2xl",children:a.jsx(s,{...o})})},e={args:{operations:[]},render:o=>a.jsx("div",{className:"max-w-2xl",children:a.jsx(s,{...o})})};var n,t,i;r.parameters={...r.parameters,docs:{...(n=r.parameters)==null?void 0:n.docs,source:{originalSource:`{
  render: args => <div className="max-w-2xl">
      <EndpointList {...args} />
    </div>
}`,...(i=(t=r.parameters)==null?void 0:t.docs)==null?void 0:i.source}}};var m,p,d;e.parameters={...e.parameters,docs:{...(m=e.parameters)==null?void 0:m.docs,source:{originalSource:`{
  args: {
    operations: []
  },
  render: args => <div className="max-w-2xl">
      <EndpointList {...args} />
    </div>
}`,...(d=(p=e.parameters)==null?void 0:p.docs)==null?void 0:d.source}}};const v=["Default","Empty"];export{r as Default,e as Empty,v as __namedExportsOrder,j as default};
