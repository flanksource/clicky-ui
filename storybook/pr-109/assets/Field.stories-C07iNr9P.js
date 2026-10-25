import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{t}from"./jsx-runtime-BG4KOiPz.js";import{n,t as r}from"./select-Dm3V5pY3.js";import{n as i,t as a}from"./Field-BYz5_dWE.js";var o,s,c,l,u,d,f;function p(){return(p=e((()=>{i(),n(),o=t(),s={title:`Components/Field`,component:a,tags:[`autodocs`],parameters:{docs:{description:{component:"Generic label-over-control chrome: a label (with optional required `*`), the control, and an inline error or helper line beneath it. The same primitive `JsonSchemaForm` renders internally, exposed for hand-built forms. Pair with `useForm` for blur/submit-gated errors."}}},argTypes:{label:{control:`text`},helper:{control:`text`,description:`Muted description shown when there's no error.`},error:{control:`text`,description:`Destructive validation message; replaces helper.`},required:{control:`boolean`},htmlFor:{control:`text`}},args:{label:`Region`,htmlFor:`region`,required:!1,helper:`Where your workloads are deployed.`}},c=(0,o.jsx)(r,{id:`region`,options:[{value:`us-east-1`,label:`US East (N. Virginia)`},{value:`eu-west-1`,label:`EU (Ireland)`}]}),l={render:e=>(0,o.jsx)(`div`,{className:`w-80`,children:(0,o.jsx)(a,{...e,children:c})})},u={args:{required:!0,helper:void 0},render:e=>(0,o.jsx)(`div`,{className:`w-80`,children:(0,o.jsx)(a,{...e,children:c})})},d={args:{required:!0,error:`Select a region to continue.`},render:e=>(0,o.jsx)(`div`,{className:`w-80`,children:(0,o.jsx)(a,{...e,children:c})})},f=[`WithHelper`,`Required`,`WithError`],l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  render: args => <div className="w-80">
      <Field {...args}>{control}</Field>
    </div>
}`,...l.parameters?.docs?.source}}},u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  args: {
    required: true,
    helper: undefined
  },
  render: args => <div className="w-80">
      <Field {...args}>{control}</Field>
    </div>
}`,...u.parameters?.docs?.source}}},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    required: true,
    error: "Select a region to continue."
  },
  render: args => <div className="w-80">
      <Field {...args}>{control}</Field>
    </div>
}`,...d.parameters?.docs?.source}}}})))()}p();export{u as Required,d as WithError,l as WithHelper,f as __namedExportsOrder,s as default};