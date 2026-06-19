import{j as e}from"./iframe-CCq80owj.js";import{L as s,a as z}from"./loading-NPQ1cFHI.js";import"./preload-helper-ByUaG9M2.js";import"./utils-BLSKlp9E.js";const w={title:"Components/Loading",component:s,tags:["autodocs"],parameters:{docs:{description:{component:"Three-dot loading indicator. `inline` sits in the flow of text/buttons; `centered` fills the space it is given and, with the default `responsive` size, scales the dots to the container via `cqmin`."}}},argTypes:{size:{description:"Fixed dot size, or `responsive` to scale with the container.",control:"inline-radio",options:["sm","md","lg","responsive"],table:{defaultValue:{summary:"responsive"}}},variant:{description:"`inline` in-flow loader, `centered` section/page loader.",control:"inline-radio",options:["inline","centered"],table:{defaultValue:{summary:"inline"}}},label:{control:"text",description:"Optional caption beside/beneath the dots."}},args:{variant:"inline",size:"md",label:"Loading…"}},r={},a={render:()=>e.jsxs("div",{className:"flex items-center gap-6",children:[e.jsx(s,{size:"sm",label:"sm"}),e.jsx(s,{size:"md",label:"md"}),e.jsx(s,{size:"lg",label:"lg"})]})},n={args:{variant:"centered",size:"responsive",label:"Loading dashboard…"},render:h=>e.jsx("div",{className:"h-64 w-96 rounded-md border border-border",children:e.jsx(s,{...h})})},o={render:()=>e.jsx(z,{className:"size-8 text-primary"})};var i,t,d;r.parameters={...r.parameters,docs:{...(i=r.parameters)==null?void 0:i.docs,source:{originalSource:"{}",...(d=(t=r.parameters)==null?void 0:t.docs)==null?void 0:d.source}}};var l,c,m;a.parameters={...a.parameters,docs:{...(l=a.parameters)==null?void 0:l.docs,source:{originalSource:`{
  render: () => <div className="flex items-center gap-6">
      <Loading size="sm" label="sm" />
      <Loading size="md" label="md" />
      <Loading size="lg" label="lg" />
    </div>
}`,...(m=(c=a.parameters)==null?void 0:c.docs)==null?void 0:m.source}}};var p,g,u;n.parameters={...n.parameters,docs:{...(p=n.parameters)==null?void 0:p.docs,source:{originalSource:`{
  args: {
    variant: "centered",
    size: "responsive",
    label: "Loading dashboard…"
  },
  render: args => <div className="h-64 w-96 rounded-md border border-border">
      <Loading {...args} />
    </div>
}`,...(u=(g=n.parameters)==null?void 0:g.docs)==null?void 0:u.source}}};var b,v,x;o.parameters={...o.parameters,docs:{...(b=o.parameters)==null?void 0:b.docs,source:{originalSource:`{
  render: () => <LoadingDots className="size-8 text-primary" />
}`,...(x=(v=o.parameters)==null?void 0:v.docs)==null?void 0:x.source}}};const N=["Inline","Sizes","Centered","DotsOnly"];export{n as Centered,o as DotsOnly,r as Inline,a as Sizes,N as __namedExportsOrder,w as default};
