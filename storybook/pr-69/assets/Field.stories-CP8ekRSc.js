import{j as e}from"./iframe-BDLF7TO0.js";import{F as n}from"./Field-BUSY-Kxa.js";import{S as v}from"./select-jpmhfvra.js";import"./preload-helper-BF_8wlrL.js";import"./utils-DW-IJACk.js";import"./Icon-BDal7uxE.js";const q={title:"Components/Field",component:n,tags:["autodocs"],parameters:{docs:{description:{component:"Generic label-over-control chrome: a label (with optional required `*`), the control, and an inline error or helper line beneath it. The same primitive `JsonSchemaForm` renders internally, exposed for hand-built forms. Pair with `useForm` for blur/submit-gated errors."}}},argTypes:{label:{control:"text"},helper:{control:"text",description:"Muted description shown when there's no error."},error:{control:"text",description:"Destructive validation message; replaces helper."},required:{control:"boolean"},htmlFor:{control:"text"}},args:{label:"Region",htmlFor:"region",required:!1,helper:"Where your workloads are deployed."}},a=e.jsx(v,{id:"region",options:[{value:"us-east-1",label:"US East (N. Virginia)"},{value:"eu-west-1",label:"EU (Ireland)"}]}),o={render:r=>e.jsx("div",{className:"w-80",children:e.jsx(n,{...r,children:a})})},s={args:{required:!0,helper:void 0},render:r=>e.jsx("div",{className:"w-80",children:e.jsx(n,{...r,children:a})})},t={args:{required:!0,error:"Select a region to continue."},render:r=>e.jsx("div",{className:"w-80",children:e.jsx(n,{...r,children:a})})};var i,l,d;o.parameters={...o.parameters,docs:{...(i=o.parameters)==null?void 0:i.docs,source:{originalSource:`{
  render: args => <div className="w-80">
      <Field {...args}>{control}</Field>
    </div>
}`,...(d=(l=o.parameters)==null?void 0:l.docs)==null?void 0:d.source}}};var c,m,p;s.parameters={...s.parameters,docs:{...(c=s.parameters)==null?void 0:c.docs,source:{originalSource:`{
  args: {
    required: true,
    helper: undefined
  },
  render: args => <div className="w-80">
      <Field {...args}>{control}</Field>
    </div>
}`,...(p=(m=s.parameters)==null?void 0:m.docs)==null?void 0:p.source}}};var u,h,g;t.parameters={...t.parameters,docs:{...(u=t.parameters)==null?void 0:u.docs,source:{originalSource:`{
  args: {
    required: true,
    error: "Select a region to continue."
  },
  render: args => <div className="w-80">
      <Field {...args}>{control}</Field>
    </div>
}`,...(g=(h=t.parameters)==null?void 0:h.docs)==null?void 0:g.source}}};const S=["WithHelper","Required","WithError"];export{s as Required,t as WithError,o as WithHelper,S as __namedExportsOrder,q as default};
