import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{t}from"./jsx-runtime-BG4KOiPz.js";import{i as n,r,t as i}from"./loading-DuUuJdTP.js";var a,o,s,c,l,u,d;function f(){return(f=e((()=>{n(),a=t(),o={title:`Components/Loading`,component:i,tags:[`autodocs`],parameters:{docs:{description:{component:"Three-dot loading indicator. `inline` sits in the flow of text/buttons; `centered` fills the space it is given and, with the default `responsive` size, scales the dots to the container via `cqmin`."}}},argTypes:{size:{description:"Fixed dot size, or `responsive` to scale with the container.",control:`inline-radio`,options:[`sm`,`md`,`lg`,`responsive`],table:{defaultValue:{summary:`responsive`}}},variant:{description:"`inline` in-flow loader, `centered` section/page loader.",control:`inline-radio`,options:[`inline`,`centered`],table:{defaultValue:{summary:`inline`}}},label:{control:`text`,description:`Optional caption beside/beneath the dots.`}},args:{variant:`inline`,size:`md`,label:`Loading…`}},s={},c={render:()=>(0,a.jsxs)(`div`,{className:`flex items-center gap-6`,children:[(0,a.jsx)(i,{size:`sm`,label:`sm`}),(0,a.jsx)(i,{size:`md`,label:`md`}),(0,a.jsx)(i,{size:`lg`,label:`lg`})]})},l={args:{variant:`centered`,size:`responsive`,label:`Loading dashboard…`},render:e=>(0,a.jsx)(`div`,{className:`h-64 w-96 rounded-md border border-border`,children:(0,a.jsx)(i,{...e})})},u={render:()=>(0,a.jsx)(r,{className:`size-8 text-primary`})},d=[`Inline`,`Sizes`,`Centered`,`DotsOnly`],s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{}`,...s.parameters?.docs?.source}}},c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  render: () => <div className="flex items-center gap-6">
      <Loading size="sm" label="sm" />
      <Loading size="md" label="md" />
      <Loading size="lg" label="lg" />
    </div>
}`,...c.parameters?.docs?.source}}},l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  args: {
    variant: "centered",
    size: "responsive",
    label: "Loading dashboard…"
  },
  render: args => <div className="h-64 w-96 rounded-md border border-border">
      <Loading {...args} />
    </div>
}`,...l.parameters?.docs?.source}}},u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  render: () => <LoadingDots className="size-8 text-primary" />
}`,...u.parameters?.docs?.source}}}})))()}f();export{l as Centered,u as DotsOnly,s as Inline,c as Sizes,d as __namedExportsOrder,o as default};